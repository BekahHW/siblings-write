# Blog Post Testing

This project includes comprehensive testing for blog posts to ensure consistency and quality, especially for automated newsletter imports.

## Test Types

We have two main types of tests:

### 1. Content Structure Tests

These tests verify that all blog posts, especially imported newsletters, have the correct structure:

- Required frontmatter fields (title, description, date, author)
- Valid author references
- Proper image references that point to existing files
- Well-formed content

### 2. Component Rendering Tests

These tests simulate how blog posts will render on the site:

- Proper rendering of title, description, date
- Author information display
- Image rendering
- Content rendering

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Test only blog content structure
npm run test:blog

# Test only component rendering
npm run test:components
```

## Automated Testing in CI/CD

Our monthly newsletter import workflow automatically runs these tests on new content:

1. After importing new newsletters, the workflow runs all blog content tests
2. If tests pass, a PR is created that can be automatically merged
3. If tests fail, a PR is created with details about the issues

## Adding Custom Tests

To add new tests:

1. Add test files to the `tests/` directory
2. Follow the existing pattern of using Vitest and Astro's content collections
3. Update the GitHub workflow if needed

## Test Implementation Details

- We use Vitest as our test runner
- Tests access content through Astro's content collections API
- Component tests simulate rendering using mock functions
- Image references are validated by checking file existence

These tests ensure that all blog posts maintain a consistent structure and can be correctly rendered on the site.