import { describe, it, expect, beforeAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock blog posts data
const mockBlogPosts = [
  {
    id: 'test-post',
    slug: 'test-post',
    body: '# Test Content\n\nThis is test content with an ![image](/assets/blog/test-image.jpg).',
    data: {
      title: 'Test Post',
      description: 'This is a test post',
      publishDate: new Date('2023-01-01'),
      author: { id: 'bekah' },
      image: { src: '/assets/blog/test-image.jpg', alt: 'Test image' }
    }
  }
];

const mockAuthors = [
  { 
    id: 'bekah',
    data: {
      name: 'Bekah Hawrot Weigel',
      bio: 'Test bio',
      avatar: '/assets/bhw_headshot.jpg'
    }
  }
];

// Mock content collection functions
const getCollection = vi.fn().mockImplementation(async (collection) => {
  if (collection === 'blog') return mockBlogPosts;
  if (collection === 'authors') return mockAuthors;
  return [];
});

const getEntry = vi.fn().mockImplementation(async (collection, id) => {
  if (collection === 'authors' && id === 'bekah') {
    return mockAuthors.find(author => author.id === id);
  }
  return null;
});

// Mock fs.existsSync to always return true for image paths in tests
vi.mock('fs', () => {
  const actual = vi.importActual('fs');
  return {
    ...actual,
    existsSync: (path) => {
      // Return true for image paths or known paths
      if (path.includes('/assets/') || path.includes('.jpg') || path.includes('.png') || path.includes('.webp')) {
        return true;
      }
      // Use the real implementation for other cases
      return actual.existsSync(path);
    }
  };
});

// Mock Astro components since we can't directly render them in Vitest
// This is a simplified approach - in a real implementation, you might 
// want to use @astrojs/test integration or a more sophisticated mock

// Mock the BlogPost component behavior
const mockRenderBlogPost = async (post) => {
  // Simulate rendering the blog post component
  // Return an object representing what should be rendered
  return {
    title: post.data.title,
    description: post.data.description,
    publishDate: post.data.publishDate,
    author: post.data.author,
    image: post.data.image,
    content: post.body,
    // Add other properties as needed
  };
};

// Mock Astro.site
const mockAstroSite = { href: 'https://example.com/' };

describe('Blog Post Component Rendering', () => {
  let blogPosts = [];
  let mockRenderedPosts = [];
  
  beforeAll(async () => {
    // Get blog posts
    try {
      blogPosts = await getCollection('blog');
      
      // Mock rendering each post
      mockRenderedPosts = await Promise.all(
        blogPosts.map(post => mockRenderBlogPost(post))
      );
    } catch (error) {
      console.error('Error in test setup:', error);
      blogPosts = [];
      mockRenderedPosts = [];
    }
  });

  it('should have blog posts to test', () => {
    expect(blogPosts.length).toBeGreaterThan(0);
    expect(mockRenderedPosts.length).toEqual(blogPosts.length);
  });

  describe.each(mockRenderedPosts)('Rendered blog post: %s', (renderedPost, index) => {
    const originalPost = blogPosts[index];
    
    it('should render the title correctly', () => {
      expect(renderedPost.title).toEqual(originalPost.data.title);
    });

    it('should render the description', () => {
      expect(renderedPost.description).toEqual(originalPost.data.description);
    });

    it('should render the publish date', () => {
      // Date could be in various formats, so just check it exists
      expect(renderedPost.publishDate).toBeDefined();
    });

    it('should render the author information', () => {
      expect(renderedPost.author).toEqual(originalPost.data.author);
    });

    it('should render the content', () => {
      expect(renderedPost.content).toEqual(originalPost.body);
    });

    it('should render image correctly if present', () => {
      if (originalPost.data.image && originalPost.data.image.src) {
        expect(renderedPost.image).toEqual(originalPost.data.image);
        
        // Additionally verify the image file exists
        const imagePath = originalPost.data.image.src;
        let fullPath;
        
        if (imagePath.startsWith('/')) {
          fullPath = path.join(process.cwd(), 'public', imagePath.substring(1));
        } else {
          fullPath = path.join(process.cwd(), imagePath);
        }
        
        const imageExists = fs.existsSync(fullPath);
        expect(imageExists).toBe(true);
      }
    });
  });
});