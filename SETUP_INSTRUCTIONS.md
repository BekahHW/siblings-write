# One Word Story Platform - Setup Instructions

This guide will help you set up the One Word Story collaborative storytelling platform with authentication, real-time updates, and all Phase 1 features.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git configured
- (Optional) GitHub CLI (`gh`) for automated PRs

## Step 1: Set Up Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (this takes a few minutes)
3. Note down your project URL and anon/public API key from Settings > API

## Step 2: Run Database Schema

1. In your Supabase project, go to the SQL Editor
2. Open the file `supabase-schema-full.sql` from this repository
3. Copy the entire contents and paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- User profiles table
- Stories table with theme support
- Contributions table
- Badges system
- Voting system
- Notifications
- User upgrades table (for future monetization)
- All necessary indexes, triggers, and RLS policies

## Step 3: Configure Authentication Providers

### Email Authentication (Already Enabled)
Email/password authentication is enabled by default.

### Google OAuth (Optional)
1. Go to Authentication > Providers in Supabase
2. Enable Google provider
3. Follow Supabase's guide to set up OAuth credentials
4. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### Apple OAuth (Optional)
1. Go to Authentication > Providers in Supabase
2. Enable Apple provider
3. Follow Supabase's guide to set up Sign in with Apple
4. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## Step 4: Set Up Realtime

1. Go to Database > Replication in Supabase
2. Make sure the following tables have replication enabled:
   - `stories`
   - `contributions`
   - `notifications`
   - `story_votes`

These are already configured in the schema via `ALTER PUBLICATION`, but verify they're enabled.

## Step 5: Configure Environment Variables

Create a `.env` file in your project root:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**For deployment (Vercel, Netlify, etc.)**, add these environment variables in your deployment platform's settings.

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Test Locally

```bash
npm run dev
```

Visit `http://localhost:4321/one-word-story` to test the feature.

## Step 8: Test Authentication Flow

1. Click "Sign In" in the navigation
2. Create a new account with email/password
3. Choose a username (3-20 characters, letters, numbers, hyphens, underscores only)
4. Confirm your email (check spam folder)
5. Sign in and contribute a word to the story

## Step 9: Deploy

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

Make sure to add your environment variables in the deployment platform settings!

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you've created the `.env` file with SUPABASE_URL and SUPABASE_ANON_KEY
- For deployed sites, add these in your hosting platform's environment variables

### "Failed to fetch story" or database errors
- Verify the schema was run successfully in Supabase SQL Editor
- Check the Supabase logs in Dashboard > Logs
- Verify RLS policies are enabled (they should be from the schema)

### OAuth redirect errors
- Make sure redirect URLs are configured correctly in Supabase
- For local testing, add `http://localhost:4321/auth/callback`
- For production, add `https://yourdomain.com/auth/callback`

### Story not updating in real-time
- Verify replication is enabled for stories and contributions tables
- Check browser console for WebSocket connection errors
- Make sure you're using the correct Supabase URL and anon key

### "You cannot submit two consecutive words" but I didn't submit before
- This is server-side turn enforcement working correctly
- Someone else was the last contributor - wait for another user to add a word
- If testing alone, use two different accounts or browsers in incognito mode

## Features Implemented

### Phase 1 (Complete)
- ✅ Supabase Authentication (email, Google, Apple)
- ✅ User profiles with usernames
- ✅ Real-time story updates
- ✅ Server-side turn enforcement
- ✅ Daily themed stories (Mystery Monday, Time-Travel Tuesday, etc.)
- ✅ Wrap-up mode at 850 words
- ✅ Automatic story publishing at 900 words
- ✅ User stats tracking (words contributed, streak)
- ✅ NSFW word filtering
- ✅ English-only validation

### Phase 2 (Pending)
- ⏳ Voting UI and backend
- ⏳ Badge system
- ⏳ Leaderboards
- ⏳ User profile pages
- ⏳ Story of the Week selection

### Phase 3 (Pending)
- ⏳ Stripe payment integration
- ⏳ Multi-word upgrade
- ⏳ Story extensions
- ⏳ Word edit/delete
- ⏳ Membership system

## Database Schema Overview

### Key Tables
- **profiles**: User accounts linked to Supabase Auth
- **stories**: Active and published collaborative stories
- **contributions**: Individual words contributed by users
- **badges**: User achievements
- **story_votes**: Voting for published stories
- **notifications**: In-app notifications
- **user_upgrades**: Purchased features (for Phase 3)

### Security
- Row Level Security (RLS) is enabled on all tables
- Users can only modify their own data
- Stories and contributions are readable by everyone
- Voting is one vote per user per story

## Next Steps

1. **Customize Themes**: Edit the themes in `src/utils/supabase.ts` if you want different daily themes
2. **Customize Word Limit**: Change `MAX_WORDS` in the API endpoint to adjust story length
3. **Implement Phase 2**: Add voting, badges, and leaderboards
4. **Implement Phase 3**: Add Stripe integration for monetization
5. **Create Notification UI**: Build the notification center for in-app notifications

## Support

For issues or questions:
1. Check the Supabase dashboard logs
2. Check the browser console for errors
3. Verify all environment variables are set correctly
4. Review the schema in SQL Editor to ensure it ran successfully

Happy storytelling! 🎉
