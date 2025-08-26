# Automatic Newsletter Import System

This system automatically imports recent newsletters from Kit into your blog on the 28th of each month. 

## How It Works

1. **Monthly Automated Import**: GitHub Actions runs the import script on the 28th of each month
2. **Smart Import Logic**: 
   - Fetches the 3 most recent newsletters from Kit
   - Filters for newsletters with "A Hawrot Siblings Micro-Monthly" in the subject line
   - Checks if they already exist in the blog
   - Only imports newsletters that aren't already in the blog
   - Automatically extracts author information from the content

3. **Content Handling**:
   - Uses the newsletter title for the blog post title
   - Uses the preview text as the description
   - Extracts the author from the "By: Author Name" text in the email
   - Correctly downloads and links any images

4. **Quality Assurance**:
   - Tests all created files to ensure they have the required components
   - Creates a PR for successful imports that can be automatically merged
   - If issues are found, creates a PR tagging @BekahHW for review

## Setup Requirements

1. **API Key**: Add your Kit V4 API key as a GitHub repository secret named `KIT_API_KEY`

2. **GitHub Actions**: The workflow is already configured in `.github/workflows/monthly-newsletter-import.yml`

3. **Repository Access**: Ensure GitHub Actions has write permissions to the repository

## Manual Trigger

You can also manually trigger the import process:

1. Go to the Actions tab in your GitHub repository
2. Select "Monthly Newsletter Import" workflow
3. Click "Run workflow" button
4. The import will run immediately

## Troubleshooting

If the import creates a PR with issues:

1. Check the GitHub Actions logs for specific error messages
2. Review the file contents in the PR to see what's missing
3. Common issues might be:
   - Author not being extracted correctly from the content
   - Missing elements in the newsletter HTML
   - Image download failures

## Implementation Details

- **Subject Line Filtering**: Only processes newsletters with "A Hawrot Siblings Micro-Monthly" in the subject
- **Author Extraction**: The script looks for "By: Author Name" in the HTML content
- **File Naming**: Uses the newsletter title converted to kebab-case
- **Duplicate Prevention**: Checks existing files to avoid creating duplicates
- **Image Handling**: Downloads images and updates references to use local paths

This system saves you time by eliminating manual copy-pasting while ensuring quality through automated tests.