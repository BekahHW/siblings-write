# Quick Start Guide - One Word Story Platform

Get up and running in 15 minutes! This guide covers the essential steps to get your One Word Story platform running locally.

## Prerequisites Check

Make sure you have these installed:
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
git --version   # Any recent version
```

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/siblings-write.git
cd siblings-write

# Install dependencies
npm install
```

## Step 2: Set Up Supabase (5 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Fill in project details and wait for initialization

### Run Database Schema
1. In Supabase, go to **SQL Editor**
2. Copy contents of `supabase-schema-full.sql`
3. Paste and click **Run**

### Get Credentials
1. Go to **Settings** > **API**
2. Copy your **Project URL** and **anon key**

## Step 3: Configure Environment (2 minutes)

```bash
# Copy example file
cp .env.example .env

# Edit .env and add your Supabase credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# You can skip Stripe/GitHub for now - they're optional for testing
```

## Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Visit `http://localhost:4321/one-word-story` 🎉

## Test the Platform

### Test Basic Features
1. Click **Sign In** > **Create Account**
2. Choose a username and sign up
3. Confirm your email (check spam folder)
4. Add a word to the story
5. Open another browser (incognito mode)
6. Create another account and add a word
7. See real-time updates!

### Test Leaderboard
- Visit `/leaderboard`
- See your ranking
- Switch between different leaderboard types

### Test Profile
- Visit `/profile`
- Edit your bio and avatar
- View your stats

## Optional: Set Up Payments (Stripe)

Only needed if you want to test upgrade purchases:

1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from **Developers** > **API keys**
3. Add to `.env`:
   ```bash
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
4. Create products in Stripe Dashboard
5. Add Price IDs to `.env`

Test with card: `4242 4242 4242 4242`

## Common Issues

### "Missing Supabase environment variables"
- Check `.env` file exists and has correct values
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Failed to fetch story"
- Verify database schema ran successfully in Supabase
- Check Supabase project is active (not paused)
- View logs in Supabase: **Logs** > **Postgres Logs**

### Email confirmation not received
- Check spam folder
- For testing, disable email confirmation:
  - Supabase > **Authentication** > **Email Auth**
  - Toggle off "Confirm email"

### Realtime not working
- Enable replication in Supabase:
  - **Database** > **Replication**
  - Enable: stories, contributions, notifications

## Next Steps

Once everything works locally:

1. ✅ Read [README.md](./README.md) for full setup guide
2. ✅ Configure OAuth providers (Google, Apple)
3. ✅ Set up Stripe for real payments
4. ✅ Deploy to Vercel or Netlify
5. ✅ Configure custom domain

## Need Help?

- **Full Documentation**: See [README.md](./README.md)
- **Database Schema**: See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Astro Docs**: [docs.astro.build](https://docs.astro.build)

## Features Available

✅ **Authentication** - Email, Google, Apple sign in  
✅ **Real-time Stories** - Live collaborative writing  
✅ **Daily Themes** - Mystery Monday, Time-Travel Tuesday, etc.  
✅ **Leaderboards** - Compete with other writers  
✅ **Badges** - Earn achievements  
✅ **Notifications** - Stay updated in real-time  
✅ **User Profiles** - Track your stats  
✅ **Upgrades** - Premium features (Stripe required)  

Happy storytelling! 🎉📖
