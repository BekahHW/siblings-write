import type { APIRoute } from 'astro';
import { supabase } from '../../utils/supabase';
import { validateWord, sanitizeWord } from '../../utils/wordFilter';

const WRAP_UP_THRESHOLD = 850;
const MAX_WORDS = 900;

export const prerender = false;

/**
 * GET /api/one-word-story
 * Get the current active story
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .in('status', ['active', 'wrap_up'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
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

    return new Response(JSON.stringify({
      success: true,
      story: story || null
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/one-word-story:', error);
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
    const { word, userId, storyId } = body;

    // Validate required fields
    if (!word || !userId || !storyId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Word, user ID, and story ID are required'
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

    // Sanitize the word
    const sanitizedWord = sanitizeWord(word);

    // Check if word contains only one word
    if (sanitizedWord.split(/\s+/).length > 1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Please submit only one word'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get the current story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('story_id', storyId)
      .single();

    if (storyError || !story) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Story not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if story is already published
    if (story.status === 'published') {
      return new Response(JSON.stringify({
        success: false,
        error: 'This story has been completed. Please refresh to see the new story.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if story is at max capacity
    if (story.word_count >= MAX_WORDS) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Story has reached maximum word count'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Server-side turn enforcement: Check if user was the last contributor
    if (story.last_contributor_id === userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'You cannot submit two consecutive words. Wait for another user to contribute.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const newWordCount = story.word_count + 1;
    const newStatus = newWordCount >= WRAP_UP_THRESHOLD ? 'wrap_up' : 'active';
    const isCompleted = newWordCount >= MAX_WORDS;

    // Update the story
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        word_count: newWordCount,
        last_contributor_id: userId,
        status: isCompleted ? 'published' : newStatus,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('story_id', storyId);

    if (updateError) {
      console.error('Error updating story:', updateError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update story'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Add the contribution
    const { error: contributionError } = await supabase
      .from('contributions')
      .insert({
        story_id: storyId,
        user_id: userId,
        word: sanitizedWord,
        word_position: newWordCount
      });

    if (contributionError) {
      console.error('Error adding contribution:', contributionError);
      // Rollback story update
      await supabase
        .from('stories')
        .update({
          word_count: story.word_count,
          last_contributor_id: story.last_contributor_id,
          status: story.status
        })
        .eq('story_id', storyId);

      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to add contribution'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // If story is completed, create a pull request
    if (isCompleted) {
      // Get all contributions for the completed story
      const { data: contributions } = await supabase
        .from('contributions')
        .select(`
          word,
          word_position,
          user_id,
          profiles (username)
        `)
        .eq('story_id', storyId)
        .order('word_position', { ascending: true });

      if (contributions) {
        // Create PR asynchronously (don't wait)
        createStoryPullRequest(story, contributions).catch(err => {
          console.error('Failed to create PR:', err);
        });
      }

      return new Response(JSON.stringify({
        success: true,
        storyCompleted: true,
        wrapUpMode: false,
        message: 'Story completed! A new story will begin.'
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
      wrapUpMode: newStatus === 'wrap_up',
      message: newStatus === 'wrap_up' ? 'Story is in wrap-up mode!' : 'Word added successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in POST /api/one-word-story:', error);
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
async function createStoryPullRequest(story: any, contributions: any[]): Promise<void> {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const timestamp = new Date().toISOString().split('T')[0];
    const storyFileName = `one-word-story-${timestamp}-${story.story_id.substring(0, 8)}.md`;
    const collabsDir = path.join(process.cwd(), 'src', 'content', 'collabs');
    const storyFilePath = path.join(collabsDir, storyFileName);

    // Ensure collabs directory exists
    if (!fs.existsSync(collabsDir)) {
      fs.mkdirSync(collabsDir, { recursive: true });
    }

    // Build the story text
    const storyText = contributions.map(c => c.word).join(' ');

    // Get unique contributors
    const contributorMap = new Map();
    contributions.forEach((c: any) => {
      if (c.profiles && c.profiles.username) {
        contributorMap.set(c.user_id, c.profiles.username);
      }
    });

    const contributors = Array.from(contributorMap.values());
    const contributorCount = contributorMap.size;

    // Build contributor list
    let contributorList = '';
    if (contributors.length > 0) {
      contributorList = '\n\n### Contributors\n\n';
      contributors.forEach(username => {
        contributorList += `- ${username}\n`;
      });
    }

    // Get theme display name
    const themeNames: Record<string, string> = {
      mystery: 'Mystery',
      time_travel: 'Time Travel',
      whimsical: 'Whimsical',
      thriller: 'Thriller',
      fantasy: 'Fantasy',
      sci_fi: 'Sci-Fi',
      slice_of_life: 'Slice of Life',
    };
    const themeDisplay = story.theme ? themeNames[story.theme] || story.theme : '';

    // Create the story markdown file
    const storyContent = `---
title: "${story.title || `One Word Story - ${themeDisplay} - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}"
description: "A collaborative ${themeDisplay.toLowerCase()} story created one word at a time by the Siblings Write community"
publishDate: "${new Date().toISOString()}"
hidden: false
---

${storyText}

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

    try {
      // Create branch and commit
      await execPromise(`git checkout -b ${branchName}`);
      await execPromise(`git add ${storyFilePath}`);
      await execPromise(`git commit -m "Add completed One Word Story from ${timestamp}"`);
      await execPromise(`git push -u origin ${branchName}`);

      // Create PR using gh CLI (if available)
      try {
        await execPromise(`gh pr create --title "One Word Story - ${themeDisplay} - ${timestamp}" --body "Automated PR for completed collaborative story with ${story.word_count} words.\\n\\nTheme: ${themeDisplay}\\nContributors: ${contributorCount}" --label "collab-story"`);
      } catch (err) {
        console.error('gh CLI not available or failed, PR must be created manually:', err);
      }

      // Switch back to original branch
      await execPromise('git checkout -');
    } catch (gitError) {
      console.error('Git operations failed:', gitError);
      // Don't throw - the story file was created successfully
    }
  } catch (error) {
    console.error('Failed to create story PR:', error);
    // Don't throw - this is a background operation
  }
}
