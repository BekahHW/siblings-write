# Behind the Story Feature

An Instagram-style tap-through interface that lets readers explore the creative process behind your works.

## Overview

The "Behind the Story" feature provides an interactive, mobile-friendly way to share:
- Before/after scene rewrites
- Plot evolution and changes
- Character development insights
- Behind-the-scenes stories
- Video and audio content

## How It Works

### 1. Create a Behind the Story File

Create a markdown file in `/src/content/behind-the-story/` named after your work's slug.

Example: `/src/content/behind-the-story/battle-for-christmas.md`

### 2. File Structure

```yaml
---
work: battle-for-christmas  # Must match the work slug from /src/content/works/
title: "Behind The Battle for Christmas"  # Title shown in the story interface
description: "An interactive look at how we created the magical world"  # Optional
slides:
  - type: insight
    title: "Where It All Started"
    content: "Your story content here..."
    duration: 6  # Seconds to auto-advance (optional, default: 5)

  - type: before-after
    title: "The Opening Scene Evolution"
    content: "We rewrote this scene five times..."
    before: "Tim walked through the forest."
    after: "Tim's breath hung in the frozen air as he..."
    duration: 8

  - type: media
    title: "Watch Our Writing Process"
    content: "Here's a video of us brainstorming..."
    videoUrl: "https://www.youtube.com/watch?v=..."
    # OR
    audioUrl: "/assets/audio/behind-story.mp3"
    image: "/assets/images/writing-setup.jpg"
---
```

### 3. Slide Types

#### `insight`
General behind-the-scenes insights and stories.
```yaml
- type: insight
  title: "Our Writing Process"
  content: "We wrote this book trading chapters..."
  duration: 6
```

#### `before-after`
Show how scenes or text evolved during rewrites.
```yaml
- type: before-after
  title: "The Opening Scene Evolution"
  content: "Here's how it changed:"
  before: "Original version..."
  after: "Final version..."
  duration: 8
```

#### `plot`
Discuss plot changes and evolution.
```yaml
- type: plot
  title: "The Biggest Plot Change"
  content: "Originally, the Nutcracker King was..."
  duration: 7
```

#### `character`
Share character development insights.
```yaml
- type: character
  title: "Creating Tim"
  content: "Tim wasn't always the brave hero..."
  duration: 6
```

#### `media`
Include video, audio, or images.
```yaml
- type: media
  title: "Writing Session Recording"
  content: "Listen to our brainstorming session..."
  videoUrl: "https://www.youtube.com/watch?v=..."  # YouTube or direct video URL
  audioUrl: "/assets/audio/session.mp3"  # Optional audio file
  image: "/assets/images/notes.jpg"  # Optional image
  duration: 10
```

### 4. Field Reference

#### Required Fields
- `work`: (string) Slug of the work this belongs to (must match a work in `/src/content/works/`)
- `title`: (string) Title of the Behind the Story series
- `slides`: (array) Array of slide objects

#### Slide Fields
- `type`: (enum) One of: `insight`, `before-after`, `plot`, `character`, `media`
- `title`: (string) Slide title
- `content`: (string) Main content (supports basic markdown)

#### Optional Slide Fields
- `before`: (string) For `before-after` type - the original version
- `after`: (string) For `before-after` type - the revised version
- `videoUrl`: (string) YouTube URL or direct video file URL
- `audioUrl`: (string) Audio file URL
- `image`: (string) Image file URL
- `duration`: (number) Auto-advance duration in seconds (default: 5)

## User Interaction

### Navigation
- **Tap/Click right side**: Next slide
- **Tap/Click left third**: Previous slide
- **Swipe left**: Next slide (mobile)
- **Swipe right**: Previous slide (mobile)
- **Hold/Press**: Pause auto-advance

### Features
- **Progress bars**: Visual indicator of position in story
- **Auto-advance**: Slides automatically advance based on duration
- **Mobile-optimized**: Responsive design for all screen sizes
- **Type badges**: Color-coded badges for different slide types

## Accessing Behind the Story

Once a Behind the Story file exists for a work, it's automatically accessible at:
```
/works/{work-slug}/behind-the-story
```

A "Behind the Story" button will also appear on the work's detail page.

## Example Content Structure

See `/src/content/behind-the-story/battle-for-christmas.md` for a complete example with:
- 12 diverse slides
- Mix of all slide types
- Before/after comparisons
- Engaging, snackable content
- Varied durations based on content length

## Best Practices

1. **Keep it snackable**: Each slide should be digestible in 5-10 seconds
2. **Mix slide types**: Variety keeps it engaging
3. **Show, don't just tell**: Use before/after comparisons
4. **Be personal**: Share genuine insights and challenges
5. **Appropriate duration**: Longer text needs more time (7-10 seconds)
6. **End with impact**: Leave readers with your core message

## Tips for Great Content

- Share real struggles and victories
- Include specific examples (actual text changes)
- Reveal surprises from your process
- Show how characters evolved
- Explain tough decisions
- Keep the tone conversational
- End with your main takeaway

## Technical Notes

- Files are processed during build time
- Content is statically generated
- Works with Astro's content collections
- Svelte component handles interactivity
- Fully responsive design
- Supports YouTube embed and direct video URLs
