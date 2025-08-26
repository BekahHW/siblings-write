# Newsletter Import Automation for Kit V4

This tool automates the process of importing newsletter content from Kit to your Astro blog, eliminating the need for manual copying and formatting.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the project root with the following content:
   ```
   # API Keys
   KIT_API_KEY=your_kit_v4_api_key_here
   
   # Newsletter Import Settings
   # How many days back to look for newsletters (default: 30)
   NEWSLETTER_LOOKBACK_DAYS=30
   ```

3. Get your API key:
   - Go to your Kit account dashboard
   - Navigate to [Developer Settings](https://app.kit.com/account_settings/developer_settings)
   - Use the V4 API Keys section (not V3)
   - Create a new key and save it securely

## Usage

### Run a dry-run import (preview only, no files changed)

```bash
npm run import-newsletter:dry
```

This will show you what would be imported without making any changes.

### Run the actual import

```bash
npm run import-newsletter
```

This will:
1. Fetch recent broadcasts from Kit V4 API
2. Download and save any images
3. Create markdown files in your blog content directory
4. Map authors correctly

## Customization

You can customize the import process by:

1. **Modifying the author mapping** in the `determineAuthorId` function
2. **Adjusting the lookback period** in `.env` with `NEWSLETTER_LOOKBACK_DAYS`
3. **Changing the blog post format** in the `convertToAstroMarkdown` function

## Troubleshooting

### API Authentication Issues

If you're getting authentication errors:
- Verify you're using a V4 API key (not V3)
- Ensure your API key has the necessary permissions
- Check that your API key is correctly formatted in the .env file

### Content Formatting Problems

If the imported content doesn't look right:
- Check the `convertToAstroMarkdown` function to adjust formatting
- You may need to modify how HTML content is processed

### Image Download Issues

If images aren't downloading:
- Check file permissions on the `/public/assets/blog` directory
- Verify the thumbnail URLs from Kit are accessible

## Manual Override

If you need to manually update a specific post after import:
1. Find the markdown file in `src/content/blog/`
2. Make your edits directly to that file