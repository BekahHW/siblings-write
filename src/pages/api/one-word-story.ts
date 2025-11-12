import type { APIRoute } from 'astro';
import StoryDatabase from '../../utils/storyDb';
import { validateWord, sanitizeWord } from '../../utils/wordFilter';
import fs from 'fs';
import path from 'path';

const WORD_THRESHOLD = 900;

export const prerender = false;

/**
 * GET /api/one-word-story
 * Get the current active story
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const story = await StoryDatabase.getCurrentStory();

    if (!story) {
      // Create a new story if none exists
      const newStory = await StoryDatabase.createNewStory();
      return new Response(JSON.stringify({
        success: true,
        story: {
          words: newStory.words,
          wordCount: newStory.word_count,
          storyId: newStory.story_id
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      story: {
        words: story.words,
        wordCount: story.word_count,
        storyId: story.story_id
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch story'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

/**
 * POST /api/one-word-story
 * Submit a word to the current story
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { word, contributorId, contributorName, contributorUrl } = body;

    // Validate required fields
    if (!word || !contributorId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Word and contributor ID are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate the word
    const validation = validateWord(word);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        success: false,
        error: validation.error
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Sanitize and add the word
    const sanitizedWord = sanitizeWord(word);
    const result = await StoryDatabase.addWord(
      contributorId,
      sanitizedWord,
      contributorName,
      contributorUrl
    );

    if (!result.success) {
      return new Response(JSON.stringify({
        success: false,
        error: result.error
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if we've reached the threshold
    if (result.story && result.story.word_count >= WORD_THRESHOLD) {
      // Archive the current story
      const archivedStory = await StoryDatabase.archiveCurrentStory();

      if (archivedStory) {
        // Create the PR asynchronously (don't wait for it)
        createStoryPullRequest(archivedStory).catch(err => {
          console.error('Failed to create PR:', err);
        });
      }

      // Create a new story
      const newStory = await StoryDatabase.createNewStory();

      return new Response(JSON.stringify({
        success: true,
        storyCompleted: true,
        completedStory: {
          words: archivedStory?.words,
          wordCount: archivedStory?.word_count
        },
        story: {
          words: newStory.words,
          wordCount: newStory.word_count,
          storyId: newStory.story_id
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      storyCompleted: false,
      story: {
        words: result.story.words,
        wordCount: result.story.word_count,
        storyId: result.story.story_id
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error submitting word:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to submit word'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

/**
 * Create a pull request for a completed story
 */
async function createStoryPullRequest(story: any): Promise<void> {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const storyFileName = `one-word-story-${timestamp}-${story.story_id.substring(0, 8)}.md`;
    const collabsDir = path.join(process.cwd(), 'src', 'content', 'collabs');
    const storyFilePath = path.join(collabsDir, storyFileName);

    // Ensure collabs directory exists
    if (!fs.existsSync(collabsDir)) {
      fs.mkdirSync(collabsDir, { recursive: true });
    }

    // Get contributors
    const contributors = await StoryDatabase.getStoryContributors(story.story_id);
    const contributorCount = await StoryDatabase.getStoryContributorCount(story.story_id);

    // Build contributor list
    let contributorList = '';
    if (contributors.length > 0) {
      const namedContributors = contributors.filter(c => c.name);
      if (namedContributors.length > 0) {
        contributorList = '\n\n### Contributors\n\n';
        namedContributors.forEach(contributor => {
          if (contributor.url) {
            contributorList += `- [${contributor.name}](${contributor.url})\n`;
          } else {
            contributorList += `- ${contributor.name}\n`;
          }
        });
      }
    }

    // Create the story markdown file
    const storyContent = `---
title: "One Word Story - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}"
description: "A collaborative story created one word at a time by the Siblings Write community"
publishDate: "${new Date().toISOString()}"
hidden: false
---

${story.words}

---

*This story was collaboratively written by ${contributorCount} ${contributorCount === 1 ? 'contributor' : 'contributors'}, one word at a time.*${contributorList}
`;

    // Write the story file
    fs.writeFileSync(storyFilePath, storyContent);

    // Use git to create a PR
    const { exec } = await import('child_process');
    const util = await import('util');
    const execPromise = util.promisify(exec);

    const branchName = `collab-story-${timestamp}-${story.story_id.substring(0, 8)}`;

    // Create branch and commit
    await execPromise(`git checkout -b ${branchName}`);
    await execPromise(`git add ${storyFilePath}`);
    await execPromise(`git commit -m "Add completed One Word Story from ${timestamp}"`);
    await execPromise(`git push -u origin ${branchName}`);

    // Create PR using gh CLI (if available)
    try {
      await execPromise(`gh pr create --title "One Word Story - ${timestamp}" --body "Automated PR for completed collaborative story with ${story.word_count} words." --label "collab-story"`);
    } catch (err) {
      console.error('gh CLI not available or failed, PR must be created manually:', err);
    }

    // Switch back to original branch
    await execPromise('git checkout -');
  } catch (error) {
    console.error('Failed to create story PR:', error);
    throw error;
  }
}
