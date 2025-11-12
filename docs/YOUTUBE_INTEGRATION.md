# YouTube Integration Guide

This guide explains how to use the YouTube integration features for The Hawrot Siblings website.

## Features

### 1. **Automatic YouTube Feed Updates**
- **What**: The site automatically fetches the latest videos from [@TheHawrotSiblings](https://www.youtube.com/@TheHawrotSiblings) YouTube channel
- **When**: Every Monday at 8:00 AM UTC
- **How**: A GitHub Action workflow runs `npm run fetch-youtube` and creates a PR if new videos are detected

### 2. **Homepage Video Showcase**
- **What**: Displays the 3 latest YouTube videos on the homepage
- **Where**: Below the "Latest Works" section
- **Link**: Includes a prominent "Visit Our YouTube Channel" button

### 3. **Story-Specific Video Embeds**
- **What**: Individual story pages can have embedded YouTube videos
- **How**: Add a `youtubeId` field to the story's frontmatter

## How to Link a Story to a YouTube Video

To add a YouTube video to a story:

1. Open the story markdown file in `src/content/blog/`
2. Add the `youtubeId` field to the frontmatter with the video ID:

```yaml
---
title: "The Story that Painted Itself"
publishDate: 4 April 2025
description: What's painted on the surface might lead to what's buried beneath.
author: bekah
youtubeId: "dQw4w9WgXcQ"
---
```

3. The video ID is the part after `v=` in a YouTube URL:
   - URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Video ID: `dQw4w9WgXcQ`

4. Save the file and the video will appear on the story page with a "Watch This Story on YouTube" section

## Manual Commands

### Fetch Latest YouTube Videos
```bash
npm run fetch-youtube
```

This command:
- Fetches the latest videos from The Hawrot Siblings YouTube channel RSS feed
- Updates `src/data/youtube-videos.json` with video metadata
- Shows the latest 5 video titles in the console

### Test the Build
```bash
npm run build
```

Builds the site with all YouTube integrations included.

## Files and Components

- **Components**:
  - `src/components/YouTubeEmbed.astro` - Individual video embed
  - `src/components/YouTubeVideosList.astro` - Video grid for homepage

- **Data**:
  - `src/data/youtube-videos.json` - Cached YouTube video data

- **Scripts**:
  - `scripts/youtube-fetch.js` - Fetches videos from YouTube RSS feed

- **Workflows**:
  - `.github/workflows/weekly-youtube-update.yml` - Weekly automation

- **Schema**:
  - `src/content/config.ts` - Includes optional `youtubeId` field for blog posts

## Troubleshooting

### Videos not showing on homepage
- Check that `src/data/youtube-videos.json` exists and has valid data
- Run `npm run fetch-youtube` to refresh the data

### Video embed not showing on story page
- Verify the `youtubeId` field is present in the story's frontmatter
- Check that the video ID is correct (11 characters, alphanumeric with hyphens and underscores)
- The video must be public on YouTube

### Automatic updates not working
- Check the GitHub Actions tab for workflow run status
- Verify the workflow has permission to create PRs (requires `contents: write` and `pull-requests: write`)
- The workflow only creates a PR if there are changes to the video data

## Tips

1. **Video Titles**: Use video titles that match or closely match story titles for easy discovery
2. **Thumbnails**: YouTube automatically provides thumbnails - no manual upload needed
3. **Testing**: Use `workflow_dispatch` in GitHub Actions to manually trigger the weekly update
4. **RSS Feed**: The integration uses YouTube's RSS feed, which doesn't require an API key
