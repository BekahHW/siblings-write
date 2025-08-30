#!/usr/bin/env node

/**
 * Newsletter Content Import Script
 * 
 * This script fetches newsletter content from Kit V4 API and creates/updates
 * corresponding blog posts in the Astro project.
 * 
 * Usage: node newsletter-import.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const yaml = require('js-yaml');
const dotenv = require('dotenv');
const { formatISO, subDays } = require('date-fns');

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Environment loaded:', process.env.KIT_API_KEY ? 'API Key exists' : 'API Key missing');
console.log('API Key length:', process.env.KIT_API_KEY ? process.env.KIT_API_KEY.length : 0);
console.log('API Key first 4 chars:', process.env.KIT_API_KEY ? process.env.KIT_API_KEY.substring(0, 4) : 'none');

// Configuration
const KIT_API_KEY = process.env.KIT_API_KEY; // V4 API key from Kit developer settings
const TARGET_BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const IMAGE_DOWNLOAD_DIR = path.join(process.cwd(), 'public/assets/blog');
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_POSTS = 3; // Only check the 3 most recent posts

// Ensure directories exist
if (!fs.existsSync(IMAGE_DOWNLOAD_DIR)) {
  fs.mkdirSync(IMAGE_DOWNLOAD_DIR, { recursive: true });
}

/**
 * Check if a newsletter subject contains the required identifier
 */
function isValidNewsletterSubject(subject) {
  if (!subject) return false;
  return subject.toLowerCase().includes('a hawrot siblings micro-monthly');
}

/**
 * Fetch recent broadcasts (newsletters) from Kit V4 API
 */
async function fetchNewsletters() {
  try {
    // Log request details for debugging
    console.log(`Making API request to: https://api.kit.com/v4/broadcasts?limit=${MAX_POSTS}`);
    console.log('Using Authorization header with format: Bearer [API_KEY]');
    
    // Use Kit V4 API to fetch most recent broadcasts (newsletters)
    const response = await fetch(
      `https://api.kit.com/v4/broadcasts?limit=${MAX_POSTS}`,
      {
        headers: {
          'X-Kit-Api-Key': KIT_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Log response status
    console.log(`API Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // Try to get response body for more error details
      try {
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
      } catch (e) {
        console.error('Could not read error response body');
      }
      
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.broadcasts?.length || 0} broadcasts`);
    
    // Get full content for each broadcast and filter by subject
    const newsletters = [];
    for (const broadcast of (data.broadcasts || [])) {
      try {
        // First check if the subject contains the required text
        if (!isValidNewsletterSubject(broadcast.subject)) {
          console.log(`Skipping broadcast "${broadcast.subject}" - does not contain "A Hawrot Siblings Micro-Monthly"`);
          continue;
        }
        
        console.log(`Including valid newsletter: "${broadcast.subject}"`);
        newsletters.push(broadcast);
      } catch (error) {
        console.error(`Error fetching details for broadcast ${broadcast.id}:`, error.message);
      }
    }
    
    console.log(`Found ${newsletters.length} valid "A Hawrot Siblings Micro-Monthly" newsletters`);
    return newsletters;
  } catch (error) {
    console.error('Error fetching newsletters:', error.message);
    return [];
  }
}

/**
 * Extract featured image URL from newsletter content
 */
function extractFeaturedImageUrl(htmlContent) {
  if (!htmlContent) return null;
  
  // Look for Kit CDN images
  const kitImageMatch = htmlContent.match(/https:\/\/embed\.filekitcdn\.com\/[^"\'\s]+/i);
  if (kitImageMatch) {
    return kitImageMatch[0];
  }
  
  return null;
}

/**
 * Convert HTML content to cleaner markdown format
 */
function convertHtmlToMarkdown(htmlContent, title = '', featuredImageUrl = null) {
  if (!htmlContent) return '';
  
  let content = htmlContent;
  
  // Convert HTML images to markdown images (filter out unwanted images)
  content = content.replace(/<img[^>]+src="([^"]+)"[^>]*\/?>(?:<\/img>)?/gi, (match, src) => {
    // Skip the featured image - we'll add it at the top
    if (featuredImageUrl && src === featuredImageUrl) {
      return '';
    }
    
    // Skip Kit branding images
    if (src.includes('convertkit.com') || src.includes('kit-badge')) {
      return '';
    }
    
    // Extract alt text if present
    const altMatch = match.match(/alt="([^"]*)"/i);
    const alt = altMatch ? altMatch[1] : 'Image';
    return `![${alt}](${src})`;
  });
  
  // Remove email-specific styles, HTML tags, and attributes
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<(?:table|tbody|tr|td|center|figure|figcaption|div)[^>]*>/gi, '');
  content = content.replace(/<\/(?:table|tbody|tr|td|center|figure|figcaption|div)>/gi, '');
  content = content.replace(/cellPadding="[^"]*"/gi, '');
  content = content.replace(/cellSpacing="[^"]*"/gi, '');
  content = content.replace(/bgcolor="[^"]*"/gi, '');
  content = content.replace(/style="[^"]*"/gi, '');
  content = content.replace(/class="[^"]*"/gi, '');
  content = content.replace(/width="[^"]*"/gi, '');
  content = content.replace(/height="[^"]*"/gi, '');
  
  // Convert basic HTML tags to markdown
  content = content.replace(/<strong[^>]*>([^<]+)<\/strong>/gi, '**$1**');
  content = content.replace(/<em[^>]*>([^<]+)<\/em>/gi, '*$1*');
  content = content.replace(/<hr[^>]*\/?>/gi, '\n---\n');
  content = content.replace(/<p[^>]*>([^<]*)<\/p>/gi, '$1\n\n');
  content = content.replace(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi, '## $1\n\n');
  
  // Remove remaining HTML tags but keep content
  content = content.replace(/<[^>]+>/g, '');
  
  // Clean up HTML entities
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&#x27;/g, "'");
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&nbsp;/g, ' ');
  
  // Clean up excessive whitespace and special characters
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.replace(/​/g, ''); // Remove zero-width space
  content = content.replace(/\s*\n\s*/g, '\n'); // Clean up line breaks
  content = content.replace(/^\n+|\n+$/g, ''); // Remove leading/trailing newlines
  content = content.trim();
  
  // Add featured image at the top if we have one
  if (featuredImageUrl) {
    const featuredImageMarkdown = `![${title}](${featuredImageUrl})`;
    content = `${featuredImageMarkdown}\n\n${content}`;
  }
  
  // Final cleanup - remove extra formatting artifacts
  content = content.replace(/;[^)]*\)/g, ')'); // Fix malformed image URLs
  content = content.replace(/\*\*\*\*/g, '**'); // Fix excessive bold formatting
  content = content.replace(/## \*\*\*\*\s*/g, ''); // Remove empty headers
  content = content.replace(/\{\{[^}]+\}\}/g, ''); // Remove template variables
  content = content.replace(/^---\s*$/gm, '\n---\n'); // Fix horizontal rules
  
  return content;
}

/**
 * Extract title from newsletter HTML content
 */
function extractTitleFromContent(htmlContent) {
  try {
    // Look for patterns like <span style="font-size:24px"><strong>Title Here</strong></span>
    const titleMatch = htmlContent.match(/<span[^>]*font-size:24px[^>]*><strong>([^<]+)<\/strong><\/span>/);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    
    // Fallback: look for any large text that might be a title
    const fallbackMatch = htmlContent.match(/<(?:h1|h2|h3)[^>]*>([^<]+)<\/(?:h1|h2|h3)>/);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1].trim();
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting title:', error.message);
    return null;
  }
}

/**
 * Download an image from a URL
 */
async function downloadImage(imageUrl, filename) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const buffer = await response.buffer();
    const filepath = path.join(IMAGE_DOWNLOAD_DIR, filename);
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would download image to: ${filepath}`);
      return filename;
    }
    
    fs.writeFileSync(filepath, buffer);
    console.log(`Image downloaded to: ${filepath}`);
    return filename;
  } catch (error) {
    console.error(`Error downloading image: ${error.message}`);
    return null;
  }
}

/**
 * Convert Kit content to Astro markdown
 */
function convertToAstroMarkdown(newsletter) {
  // Extract HTML content first to get author and title
  const htmlContent = newsletter.content || newsletter.html_content || newsletter.text_content || '';
  
  // Extract title and author from the content
  const extractedTitle = extractTitleFromContent(htmlContent);
  const authorId = extractAndMapAuthor(htmlContent);
  
  // Create frontmatter
  const frontmatter = {
    title: extractedTitle || newsletter.name || 'Untitled Newsletter',
    description: newsletter.preview_text || newsletter.subject || '',
    publishDate: formatISO(new Date(newsletter.published_at || newsletter.send_at || newsletter.sent_at || newsletter.created_at || new Date())),
    author: { id: authorId },
    featured: false,
    draft: false,
  };
  
  // Extract featured image from content instead of thumbnail_url
  const featuredImageUrl = extractFeaturedImageUrl(htmlContent);
  
  // Convert frontmatter to YAML
  const frontmatterYaml = yaml.dump(frontmatter);
  
  // Extract and clean the HTML content
  const rawContent = newsletter.content || newsletter.html_content || newsletter.text_content || '';
  const cleanContent = convertHtmlToMarkdown(rawContent, extractedTitle, featuredImageUrl);
  
  // Combine with content
  return `---
${frontmatterYaml}---

${cleanContent}`;
}

/**
 * Extract author from newsletter content and map to author ID
 */
function extractAndMapAuthor(htmlContent) {
  try {
    // Try to find "By: Author Name" pattern in the HTML content
    const byMatch = htmlContent.match(/By:\s*([^<,]+)/i);
    if (byMatch && byMatch[1]) {
      const authorName = byMatch[1].trim();
      console.log(`Found author in content: "${authorName}"`); 
      return mapAuthorNameToId(authorName);
    }
    
    // Fallback
    return 'bekah';
  } catch (error) {
    console.error('Error extracting author:', error.message);
    return 'bekah'; // Default to Bekah if there's an error
  }
}

/**
 * Map author name to author ID
 */
function mapAuthorNameToId(authorName) {
  // Handle partial matches and variations
  if (authorName.includes('Bekah')) return 'bekah';
  if (authorName.includes('Michael') || authorName.includes('Fr.')) return 'frmichael';
  if (authorName.includes('Josh')) return 'josh';
  if (authorName.includes('Zach')) return 'Zach';
  
  // Default
  return 'bekah';
}

/**
 * Check if a post already exists in the blog directory
 */
function postExists(title) {
  const slug = (title || 'untitled')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  
  const filename = `${slug}.md`;
  const filepath = path.join(TARGET_BLOG_DIR, filename);
  
  return fs.existsSync(filepath);
}

/**
 * Check if a newsletter should be processed (has valid subject and doesn't already exist)
 */
function shouldProcessNewsletter(newsletter) {
  // Check subject line requirement
  if (!isValidNewsletterSubject(newsletter.subject)) {
    console.log(`Skipping newsletter with subject: "${newsletter.subject}" - missing required text`);
    return false;
  }
  
  // Extract title for better duplicate checking
  const htmlContent = newsletter.content || newsletter.html_content || newsletter.text_content || '';
  const extractedTitle = extractTitleFromContent(htmlContent);
  const titleForCheck = extractedTitle || newsletter.name || newsletter.subject;
  
  // Check if post already exists
  if (postExists(titleForCheck)) {
    console.log(`Post already exists for "${titleForCheck}". Skipping.`);
    return false;
  }
  
  return true;
}

/**
 * Create or update blog post file
 */
function createBlogPost(newsletter, content) {
  // Extract title from content for better slug generation
  const htmlContent = newsletter.content || newsletter.html_content || newsletter.text_content || '';
  const extractedTitle = extractTitleFromContent(htmlContent);
  const titleForSlug = extractedTitle || newsletter.name || newsletter.subject || 'untitled';
  
  // Generate filename from title
  const slug = titleForSlug
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  
  const filename = `${slug}.md`;
  const filepath = path.join(TARGET_BLOG_DIR, filename);
  
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would ${fs.existsSync(filepath) ? 'update' : 'create'} blog post: ${filepath}`);
    console.log('Content preview:');
    console.log(content.substring(0, 200) + '...');
    return { created: false, filepath: null };
  }
  
  fs.writeFileSync(filepath, content);
  console.log(`${fs.existsSync(filepath) ? 'Updated' : 'Created'} blog post: ${filepath}`);
  return { created: true, filepath };
}

/**
 * Test if the created file has all required components
 */
async function testCreatedPost(filepath) {
  try {
    // Read the created file
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Check for required elements
    const hasTitle = content.includes('title:');
    const hasAuthor = content.includes('author:');
    const hasPublishDate = content.includes('publishDate:');
    const hasDescription = content.includes('description:');
    const hasContent = content.split('---').length > 2 && content.split('---')[2].trim().length > 0;
    
    // Check if all elements are present
    const allElementsPresent = hasTitle && hasAuthor && hasPublishDate && hasDescription && hasContent;
    
    console.log(`Test results for ${path.basename(filepath)}:`);
    console.log(`- Title: ${hasTitle ? '✅' : '❌'}`);
    console.log(`- Author: ${hasAuthor ? '✅' : '❌'}`);
    console.log(`- Publish Date: ${hasPublishDate ? '✅' : '❌'}`);
    console.log(`- Description: ${hasDescription ? '✅' : '❌'}`);
    console.log(`- Content: ${hasContent ? '✅' : '❌'}`);
    
    return allElementsPresent;
  } catch (error) {
    console.error(`Error testing file ${filepath}:`, error.message);
    return false;
  }
}

/**
 * Create a GitHub PR if there are issues
 */
async function createGitHubPR(issueDetails) {
  try {
    // If running in a GitHub Actions environment, create a PR
    if (process.env.GITHUB_TOKEN) {
      console.log('Creating GitHub PR for issue...');
      // GitHub API logic would go here
      // For now, just log the issue
      console.log('Issue details:', issueDetails);
    } else {
      console.log('GITHUB_TOKEN not found. Would create PR with issue:');
      console.log(issueDetails);
    }
  } catch (error) {
    console.error('Error creating PR:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('Starting newsletter import...');
  console.log(DRY_RUN ? 'DRY RUN MODE - no files will be modified' : 'LIVE MODE - files will be created/updated');
  
  // Fetch newsletters
  const newsletters = await fetchNewsletters();
  console.log(`Found ${newsletters.length} newsletters`);
  
  let createdFiles = [];
  let issues = [];
  
  // Process each newsletter
  for (const newsletter of newsletters) {
    console.log(`Processing: ${newsletter.name || newsletter.subject || 'Untitled broadcast'}`);
    console.log(`Subject: ${newsletter.subject}`);
    
    // Check if this newsletter should be processed
    if (!shouldProcessNewsletter(newsletter)) {
      continue;
    }
    
    // Convert to markdown
    const markdownContent = convertToAstroMarkdown(newsletter);
    
    // Create or update blog post
    const result = createBlogPost(newsletter, markdownContent);
    
    if (result.created && result.filepath) {
      createdFiles.push(result.filepath);
    }
  }
  
  // Test created files
  if (!DRY_RUN && createdFiles.length > 0) {
    console.log('\nTesting created files...');
    
    for (const filepath of createdFiles) {
      const passed = await testCreatedPost(filepath);
      
      if (!passed) {
        issues.push({
          file: path.basename(filepath),
          error: 'Missing required elements in the created file'
        });
      }
    }
  }
  
  // Handle any issues
  if (issues.length > 0) {
    console.log('\n⚠️ Issues found during import:');
    issues.forEach(issue => console.log(`- ${issue.file}: ${issue.error}`));
    
    // Create a PR for issues
    await createGitHubPR({
      title: 'Fix newsletter import issues',
      body: 'Issues were found during automatic newsletter import:\n\n' + 
            issues.map(i => `- ${i.file}: ${i.error}`).join('\n') + 
            '\n\n@BekahHW Please review these issues.',
      issues
    });
  } else if (createdFiles.length > 0) {
    console.log('\n✅ All newsletters imported successfully!');
  } else {
    console.log('\n📝 No new newsletters to import.');
  }
  
  console.log('Newsletter import complete!');
}

// Execute script
main().catch(error => {
  console.error('Error in main execution:', error);
  process.exit(1);
});