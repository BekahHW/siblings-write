# Supabase Setup Guide for One Word Story

This guide will help you set up Supabase as the database for the One Word Story collaborative feature.

## Why Supabase?

- **Shared State**: All users see the same story in real-time
- **Persistent**: Data survives deployments and server restarts
- **Scalable**: Handles concurrent users without database locks
- **Free Tier**: Generous limits perfect for this use case
- **PostgreSQL**: Powerful relational database with full SQL support

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In" if you have an account
3. Create a new project:
   - Choose a project name (e.g., "siblings-write")
   - Set a strong database password (save this!)
   - Select a region close to your users
   - Click "Create new project"
4. Wait ~2 minutes for the project to initialize

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "+ New query"
3. Copy the entire contents of `supabase-schema.sql` from this repo
4. Paste it into the SQL Editor
5. Click **RUN** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is correct!

### Verify Tables Were Created

1. Go to **Table Editor** (left sidebar)
2. You should see three tables:
   - `story` - Stores the current and archived stories
   - `contributors` - Stores contributor information
   - `contributions` - Stores individual word submissions

## Step 3: Get Your API Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** in the settings menu
3. You'll see two important values:

### Project URL
```
https://your-project-id.supabase.co
```

### Anon/Public Key (anon key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: Copy the **anon** key, NOT the service_role key. The anon key is safe for client-side use.

## Step 4: Configure Environment Variables

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Production Deployment

Add these environment variables to your hosting platform:

#### Netlify
1. Go to Site Settings → Build & deploy → Environment
2. Add:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_ANON_KEY` = your anon key

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_ANON_KEY` = your anon key

#### Railway
1. Go to your project → Variables tab
2. Add:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_ANON_KEY` = your anon key

## Step 5: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3030/one-word-story`

3. Try submitting a word

4. Check your Supabase dashboard:
   - Go to **Table Editor**
   - Click on `story` table
   - You should see a new row with your word!

## Troubleshooting

### "Missing Supabase environment variables" Error

**Problem**: The environment variables aren't loaded.

**Solutions**:
- Make sure `.env` exists in your project root
- Restart your development server after creating `.env`
- Check that variable names match exactly: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### "Error fetching current story" in console

**Problem**: Database connection or schema issue.

**Solutions**:
- Verify you ran the `supabase-schema.sql` script completely
- Check that all three tables exist in Table Editor
- Verify your API credentials are correct
- Make sure Row Level Security (RLS) policies were created

### Stories aren't appearing for other users

**Problem**: Not actually using shared database (probably still using local SQLite).

**Solutions**:
- Confirm environment variables are set in production
- Redeploy your site after adding environment variables
- Check the Network tab in browser DevTools - API calls should succeed

### "Rate limit exceeded" errors

**Problem**: Hit Supabase free tier limits.

**Solutions**:
- Free tier: 50,000 database queries/month
- This should be plenty for the One Word Story feature
- If you hit limits, consider upgrading or optimizing queries

## Database Management

### Viewing Data

Use the Supabase **Table Editor** to:
- View all stories (active and archived)
- See all contributors and their names/URLs
- Browse individual word contributions

### Resetting the Story

To manually reset/clear the database:

```sql
-- Archive all active stories
UPDATE story SET is_active = false WHERE is_active = true;

-- Optional: Delete all data (careful!)
TRUNCATE contributions, story, contributors RESTART IDENTITY CASCADE;
```

### Backing Up Data

Supabase automatically backs up your database, but you can also:

1. Go to **Database** → **Backups** in Supabase dashboard
2. Backups are taken daily on the free tier
3. You can also export tables manually from Table Editor

## Security Notes

- ✅ **Anon key is safe**: It's designed for client-side use
- ✅ **Row Level Security (RLS)**: Enabled to protect data
- ✅ **Public access**: Configured for anonymous users (no auth required)
- ⚠️ **Never commit**: Don't commit `.env` to git (already in `.gitignore`)
- ⚠️ **Service role key**: Never use this in client-side code

## Cost

**Free Tier Includes**:
- 500MB database space
- 2GB data transfer
- 50,000 database queries/month
- Unlimited API requests

This is more than enough for the One Word Story feature! The active story is very small, and archived stories are only stored until published.

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/BekahHW/siblings-write/issues)
