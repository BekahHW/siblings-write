# Content Management System (CMS) Guide

This guide will help you update the Siblings Write website without needing to code or use GitHub directly.

## Getting Started

### What is Decap CMS?

Decap CMS is a user-friendly content management system that lets you edit website content through a simple web interface. Instead of editing code files, you'll use forms and text editors to make changes.

### Accessing the CMS

1. Go to your website URL followed by `/admin`
   - Example: `https://yoursite.com/admin`
2. Click "Login with GitHub"
3. If prompted, authorize the application with your GitHub account
4. You're in! You'll see a dashboard with all the content you can edit

**First time?** Make sure you've accepted the GitHub collaborator invitation from the repository owner.

## What You Can Edit

### 1. Blog Posts

**Location:** In the CMS dashboard, click "Blog Posts"

**What you can do:**
- Create new blog posts
- Edit existing posts
- Set publish dates
- Choose the author
- Hide posts temporarily (using the "Hidden" toggle)

**How to create a new blog post:**
1. Click "Blog Posts" in the sidebar
2. Click the "New Blog Posts" button
3. Fill in the form:
   - **Title:** The headline of your post
   - **Description:** A brief summary (appears in previews)
   - **Publish Date:** When the post should appear
   - **Author:** Select from the dropdown (Josh, Bekah, Zach, or FrMichael)
   - **Hidden:** Toggle ON if you want to hide it temporarily
   - **Body:** Write your story using the rich text editor
4. Click "Publish" to save
5. Your changes will automatically create a commit in GitHub

### 2. Authors

**Location:** In the CMS dashboard, click "Authors"

**What you can do:**
- Update author bios
- Change author profile pictures
- Add new authors

**How to edit an author:**
1. Click "Authors" in the sidebar
2. Click on the author you want to edit
3. Update the fields:
   - **Name:** Author's full name
   - **Bio:** Short description about the author
   - **Avatar:** Profile picture (upload a new image or use existing)
4. Click "Publish" to save

### 3. Works & Books

**Location:** In the CMS dashboard, click "Works & Books"

**What you can do:**
- Add new books or projects (each gets its own dedicated page!)
- Update book descriptions, summaries, and inspiration stories
- Change buy links
- Upload book cover images and hero header images
- Mark books as "Featured" (appears at top of Works page)
- Reorder books using the "Order" number

**How to add a new book:**
1. Click "Works & Books" in the sidebar
2. Click "New Works & Books"
3. Fill in the form:
   - **Title:** Book or project title
   - **Description / Logline:** Short catchy description (appears on Works page and detail page)
   - **Book Cover Image:** Upload the book cover (click to upload from your computer)
   - **Header Image:** *(Optional)* Large hero image for the book's detail page. If not provided, the book cover will be used
   - **Amazon Buy Link:** Amazon or other purchase link
   - **Featured:** Toggle ON to show in the Featured section
   - **Order:** Lower numbers appear first (1, 2, 3, etc.)
   - **Inspired By:** *(Optional)* One sentence about what inspired this work (shows on the detail page)
   - **Book Summary:** *(Optional)* Full 1-2 paragraph summary of the book (shows on the detail page)
   - **Inspiration Story:** *(Optional)* Full 1-3 paragraphs about what inspired the book - the story behind the story. Separate paragraphs with a blank line. (shows on the detail page)
4. Click "Publish" to save

**Note:** Each work automatically gets its own detail page at `/works/book-title-slug` with all the information you provide!

**Editing existing books:**
1. Click "Works & Books"
2. Click on the book you want to edit
3. Make your changes
4. Click "Publish"

### 4. Site Settings

**Location:** In the CMS dashboard, click "Site Settings"

#### Homepage Settings
Edit the main homepage text and headlines:
- **Main Title:** The big heading (currently "The Hawrot Siblings")
- **Subtitle:** The tagline below it
- **About Text:** The paragraph about the siblings
- **Newsletter Intro:** Text above the email signup form

#### Works Page Settings
Edit the Works page headings and intro:
- **Page Title:** Main heading for the Works page
- **Introduction:** Opening paragraph
- **Featured Section Title:** Heading for featured books
- **Other Projects Title:** Heading for other projects

## Tips and Best Practices

### Images
- **Recommended sizes:**
  - Book covers: 200-400px wide
  - Book header images: 1200-1600px wide (for hero headers)
  - Author avatars: 200-300px square
- **Formats:** JPG or PNG work best
- When you upload an image, it gets saved to `/assets` automatically

### Publishing Flow
When you click "Publish":
1. Your changes are saved
2. A commit is automatically created in GitHub
3. The website will rebuild with your changes (may take a few minutes)

### Draft Mode
- You can save drafts before publishing
- Click "Save" instead of "Publish" to work on something later
- Drafts won't appear on the live website

### Hiding Content Temporarily
- For blog posts: Toggle the "Hidden" field to ON
- The post stays in the system but won't show on the website

### Ordering Content
- Works/Books can be ordered using the "Order" field
- Lower numbers appear first (1, 2, 3...)
- If two items have the same order number, they'll appear alphabetically

## Common Tasks

### Changing the homepage intro text
1. Go to CMS > Site Settings
2. Click "Homepage"
3. Edit "About Text"
4. Click "Publish"

### Adding a new book to the Works page (with its own detail page!)
1. Go to CMS > Works & Books
2. Click "New Works & Books"
3. Fill in the required fields:
   - Title, description/logline, book cover image
   - Add Amazon link
   - Set "Featured" to ON if it should appear at the top
   - Set "Order" (use next available number, like 3 or 4)
4. Fill in the optional detail page fields:
   - **Inspired By:** One sentence about the inspiration
   - **Book Summary:** Full summary (1-2 paragraphs)
   - **Inspiration Story:** The full story behind the story (1-3 paragraphs, separate with blank lines)
   - **Header Image:** Upload a hero image for the top of the detail page (or it will use the cover)
5. Click "Publish"
6. Your book now appears on the Works page AND has its own dedicated page at `/works/your-book-title`!

### Publishing a new blog post
1. Go to CMS > Blog Posts
2. Click "New Blog Posts"
3. Write your post in the Body field
4. Set title, description, publish date, and author
5. Click "Publish"

## Troubleshooting

### Can't see my changes on the website
- Changes may take 2-5 minutes to appear after publishing
- Check that you clicked "Publish" not just "Save"
- Try refreshing your browser with a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Image won't upload
- Make sure the image is less than 5MB
- Use JPG or PNG format
- Try resizing the image if it's very large

### Lost work
- Decap CMS auto-saves drafts in your browser
- If you accidentally close the browser, your draft might still be there
- Always click "Publish" to permanently save changes

## Need Help?

If you run into any issues or have questions:
1. Check this guide first
2. Contact the developer who set this up
3. Check the [Decap CMS documentation](https://decapcms.org/docs/)

## Authentication & Access

To use the CMS, you need:
1. A free GitHub account (create one at https://github.com/join)
2. Collaborator access to the `BekahHW/siblings-write` repository
3. To accept the collaborator invitation email from GitHub

**Completely free!** No paid plans or upgrades needed.

**First time setup (for site admin only)?** See the [Free CMS Setup Guide](CMS-SETUP-FREE.md) for adding team members.

If you can't log in:
- Make sure you've been added as a collaborator on GitHub
- Check your email for the GitHub invitation and accept it
- Log out of GitHub and log back in, then try again
- Contact the repository owner to verify your collaborator access
