#!/usr/bin/env node

/**
 * Test Script for Newsletter Import
 * 
 * This script tests newly created blog posts to ensure they meet all requirements:
 * - Valid frontmatter with all required fields
 * - Proper content structure
 * - Correctly linked images
 * - Asset files exist
 * 
 * Usage: node test-newsletter-import.js [filepath]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// If a filepath is provided as an argument, test just that file
// Otherwise, test all markdown files in the blog directory
const specificFile = process.argv[2];
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const ASSETS_DIR = path.join(process.cwd(), 'public/assets/blog');

/**
 * Extract frontmatter from markdown content
 */
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  try {
    return yaml.load(frontmatterMatch[1]);
  } catch (error) {
    console.error('Error parsing frontmatter:', error.message);
    return null;
  }
}

/**
 * Extract content after frontmatter
 */
function extractContent(content) {
  const parts = content.split('---');
  if (parts.length < 3) return '';
  
  return parts.slice(2).join('---').trim();
}

/**
 * Test if a string is a valid ISO date
 */
function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Test if an image file exists
 */
function imageExists(imagePath) {
  if (!imagePath) return false;
  
  // Handle both absolute and relative paths
  if (imagePath.startsWith('/')) {
    // Remove leading slash for public directory
    const publicPath = path.join(process.cwd(), 'public', imagePath.substring(1));
    return fs.existsSync(publicPath);
  }
  
  return fs.existsSync(path.join(process.cwd(), imagePath));
}

/**
 * Check if content starts with a markdown image
 */
function startsWithImage(content) {
  return /^\s*!\[.*?\]\(.*?\)/.test(content);
}

/**
 * Extract image paths from markdown content
 */
function extractImagePaths(content) {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}

/**
 * Test a single blog post file
 */
function testBlogPost(filepath) {
  console.log(`\nTesting: ${path.basename(filepath)}`);
  
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Test 1: Extract and validate frontmatter
    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) {
      console.error('❌ Invalid or missing frontmatter');
      return false;
    }
    
    // Test 1.5: Check if this is a newsletter post (optional warning)
    if (frontmatter.title && !frontmatter.title.toLowerCase().includes('micro-monthly')) {
      console.log('ℹ️  Note: Title does not contain "micro-monthly" - may not be a newsletter post');
    }
    
    // Test 2: Check required frontmatter fields
    const requiredFields = [
      { name: 'title', validator: (v) => typeof v === 'string' && v.length > 0 },
      { name: 'description', validator: (v) => typeof v === 'string' },
      { name: 'publishDate', validator: isValidDate },
      { name: 'author', validator: (v) => v && typeof v === 'object' && v.id }
    ];
    
    let allFieldsValid = true;
    for (const field of requiredFields) {
      const isValid = field.validator(frontmatter[field.name]);
      console.log(`${isValid ? '✅' : '❌'} ${field.name}: ${JSON.stringify(frontmatter[field.name])}`);
      if (!isValid) allFieldsValid = false;
    }
    
    // Test 3: Check image in frontmatter if present
    if (frontmatter.image && frontmatter.image.src) {
      const imageValid = imageExists(frontmatter.image.src);
      console.log(`${imageValid ? '✅' : '❌'} frontmatter image: ${frontmatter.image.src}`);
      if (!imageValid) allFieldsValid = false;
    }
    
    // Test 4: Extract and check content
    const postContent = extractContent(content);
    if (!postContent || postContent.length < 10) {
      console.log('❌ Missing or very short content');
      return false;
    }
    console.log(`✅ Content length: ${postContent.length} characters`);
    
    // Test 5: Check if content starts with an image
    const hasLeadingImage = startsWithImage(postContent);
    console.log(`${hasLeadingImage ? '✅' : '❌'} Content starts with an image`);
    
    // Test 6: Check if all images in content exist
    const imagePaths = extractImagePaths(postContent);
    let allImagesExist = true;
    
    for (const imgPath of imagePaths) {
      const imgExists = imageExists(imgPath);
      console.log(`${imgExists ? '✅' : '❌'} Content image: ${imgPath}`);
      if (!imgExists) allImagesExist = false;
    }
    
    // Final result
    const passed = allFieldsValid && postContent.length > 10 && allImagesExist;
    console.log(`\nOverall result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    return passed;
    
  } catch (error) {
    console.error(`Error testing ${filepath}:`, error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('Running newsletter import tests...');
    
    let filesToTest = [];
    
    if (specificFile) {
      // Test a specific file
      filesToTest = [specificFile];
    } else {
      // Get the most recently created/modified files in the blog directory
      const allFiles = fs.readdirSync(BLOG_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          path: path.join(BLOG_DIR, file),
          stats: fs.statSync(path.join(BLOG_DIR, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
      
      // Test the 3 most recent files
      filesToTest = allFiles.slice(0, 3).map(file => file.path);
    }
    
    if (filesToTest.length === 0) {
      console.log('No files to test.');
      return;
    }
    
    console.log(`Found ${filesToTest.length} files to test.`);
    
    let allPassed = true;
    for (const file of filesToTest) {
      const passed = testBlogPost(file);
      if (!passed) allPassed = false;
    }
    
    // Check for new assets
    console.log('\nChecking for blog assets...');
    const assetFiles = fs.existsSync(ASSETS_DIR) ? fs.readdirSync(ASSETS_DIR) : [];
    console.log(`Found ${assetFiles.length} asset files in ${ASSETS_DIR}`);
    
    // Exit with appropriate code
    if (allPassed) {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error in test execution:', error);
    process.exit(1);
  }
}

// Execute script
main().catch(error => {
  console.error('Error in main execution:', error);
  process.exit(1);
});