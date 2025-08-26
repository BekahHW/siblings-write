// This file is used to set up the test environment
// It's included in the vitest.config.mjs setupFiles array

import { vi } from 'vitest';
import path from 'path';
import fs from 'fs';

// Set up global environment variables for testing
process.env.SITE = 'https://example.com';

// Mock Astro's import.meta.env
globalThis.import = {
  meta: {
    env: {
      SITE: 'https://example.com',
    },
  },
};

// Mock Astro's content collections API
vi.mock('astro:content', async () => {
  return {
    getCollection: vi.fn().mockImplementation(async (collection) => {
      if (collection === 'blog') {
        return [
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
      }
      if (collection === 'authors') {
        return [
          { 
            id: 'bekah',
            data: {
              name: 'Bekah Hawrot Weigel',
              bio: 'Test bio',
              avatar: '/assets/bhw_headshot.jpg'
            }
          }
        ];
      }
      return [];
    }),
    getEntry: vi.fn().mockImplementation(async (collection, id) => {
      if (collection === 'authors' && id === 'bekah') {
        return {
          id: 'bekah',
          data: {
            name: 'Bekah Hawrot Weigel',
            bio: 'Test bio',
            avatar: '/assets/bhw_headshot.jpg'
          }
        };
      }
      return null;
    }),
    render: vi.fn().mockResolvedValue({ Content: () => ({}) })
  };
});

// Mock console.log to reduce noise in test output
const originalConsoleLog = console.log;
console.log = (...args) => {
  // Only log errors in tests
  if (args[0]?.includes && args[0].includes('Error')) {
    originalConsoleLog(...args);
  }
};

// Mock console.error to make sure errors are visible
console.error = (...args) => {
  originalConsoleLog('ERROR:', ...args);
};