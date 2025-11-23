# One Word Story Platform - External Dev Tools Setup

This guide provides detailed instructions for setting up all external development tools and services required for the One Word Story collaborative storytelling platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Stripe Setup](#stripe-setup)
4. [GitHub Integration](#github-integration)
5. [Environment Variables](#environment-variables)
6. [Local Development](#local-development)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **pnpm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A code editor (VS Code recommended)

---

## Supabase Setup

Supabase provides authentication, database, and real-time subscriptions for the platform.

### 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project** and sign up with GitHub, Google, or email
3. Verify your email address

### 2. Create a New Project

1. Click **New Project** in your Supabase dashboard
2. Fill in the project details:
   - **Name**: `one-word-story` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the region closest to your users
3. Click **Create new project**
4. Wait 2-3 minutes for the project to initialize

### 3. Get Your API Credentials

1. In your Supabase project, go to **Settings** > **API**
2. Copy the following values (you'll need them later):
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Run the Database Schema

1. In Supabase, navigate to **SQL Editor**
2. Click **New query**
3. Open the file `supabase-schema-full.sql` from this repository
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** or press `Ctrl/Cmd + Enter`
6. Verify all tables were created successfully (check the **Table Editor**)

### 5. Enable Realtime

1. Go to **Database** > **Replication**
2. Enable replication for these tables:
   - `stories`
   - `contributions`
   - `notifications`
   - `story_votes`
3. Click **Save**

### 6. Configure Authentication Providers

#### Email/Password (Already Enabled)
Email authentication is enabled by default. No additional configuration needed.

#### Google OAuth (Optional)

1. Go to **Authentication** > **Providers** in Supabase
2. Find **Google** and click **Enable**
3. Follow these steps to get credentials:

   **a. Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Navigate to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**

   **b. Add to Supabase:**
   - Paste Client ID and Client Secret in Supabase Google provider settings
   - Click **Save**

#### Apple OAuth (Optional)

1. Go to **Authentication** > **Providers** in Supabase
2. Find **Apple** and click **Enable**
3. Follow these steps:

   **a. Create Apple Services ID:**
   - Go to [Apple Developer Portal](https://developer.apple.com/account/)
   - Navigate to **Certificates, Identifiers & Profiles**
   - Create a new **Services ID**
   - Enable **Sign in with Apple**
   - Add return URL: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy the **Services ID**

   **b. Add to Supabase:**
   - Paste Services ID in Supabase Apple provider settings
   - Follow Supabase's guide for additional Apple configuration
   - Click **Save**

### 7. Configure Row Level Security (RLS)

The SQL schema already includes RLS policies, but verify they're enabled:

1. Go to **Authentication** > **Policies**
2. Verify each table has policies listed
3. If any are missing, re-run the schema SQL

---

## Stripe Setup

Stripe handles payments for premium features and upgrades.

### 1. Create a Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click **Start now** and create an account
3. Complete business verification (can skip for testing)
4. Activate your account

### 2. Get API Keys

1. In Stripe Dashboard, click **Developers** > **API keys**
2. Copy these keys:
   - **Publishable key**: `pk_test_...` (for frontend)
   - **Secret key**: `sk_test_...` (for backend)
3. Keep these secure! Never commit secret keys to Git.

### 3. Create Products and Prices

Create a product for each upgrade type:

#### Multi-Word Upgrade ($1.00)

1. Go to **Products** in Stripe Dashboard
2. Click **Add product**
3. Fill in:
   - **Name**: Multi-Word Submission
   - **Description**: Submit 2-3 words per turn
   - **Pricing**: One-time, $1.00 USD
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_...`)

#### Story Extension ($1.00)

1. Repeat above steps with:
   - **Name**: Story Extension
   - **Description**: Extend story by 100 words
   - **Pricing**: One-time, $1.00 USD
2. Copy the **Price ID**

#### Word Edit Access ($5.00)

1. Create product with:
   - **Name**: Word Edit Access
   - **Description**: Edit or delete submitted words
   - **Pricing**: One-time, $5.00 USD
2. Copy the **Price ID**

#### Premium Membership ($9.99/month)

1. Create product with:
   - **Name**: Premium Membership
   - **Description**: All features and exclusive perks
   - **Pricing**: Recurring, $9.99/month USD
2. Copy the **Price ID**

### 4. Set Up Webhooks

Webhooks notify your app when payments complete:

1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set **Endpoint URL**: `https://yourdomain.com/api/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)

**For local testing:**
- Install Stripe CLI: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- Run: `stripe login`
- Forward events: `stripe listen --forward-to localhost:4321/api/stripe-webhook`
- Use the webhook secret provided by the CLI

### 5. Test Mode vs Live Mode

- **Test mode**: Use `pk_test_...` and `sk_test_...` keys
- **Live mode**: Use `pk_live_...` and `sk_live_...` keys
- Toggle between modes using the switch in Stripe Dashboard
- Always test thoroughly before going live!

---

## GitHub Integration

GitHub integration enables automated pull requests for completed stories.

### 1. Create a Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token** > **Generate new token (classic)**
3. Give it a descriptive name: `One Word Story - PR Creation`
4. Select scopes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `workflow` (update GitHub Action workflows)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again!)

### 2. Configure Repository Access

1. Go to your repository settings
2. Navigate to **Settings** > **Actions** > **General**
3. Under **Workflow permissions**, select:
   - ✅ Read and write permissions
4. Click **Save**

### 3. Test GitHub CLI (Optional)

The `gh` CLI is used for creating pull requests:

1. Install: [cli.github.com](https://cli.github.com/)
2. Authenticate: `gh auth login`
3. Test: `gh repo view` (should show your repo info)

---

## Environment Variables

### 1. Create .env File

Copy the example file:

```bash
cp .env.example .env
```

### 2. Fill in All Values

Open `.env` and add your credentials:

```bash
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_MULTI_WORD_PRICE_ID=price_...
STRIPE_STORY_EXTENSION_PRICE_ID=price_...
STRIPE_WORD_EDIT_PRICE_ID=price_...
STRIPE_MEMBERSHIP_PRICE_ID=price_...

# GitHub (Optional)
GITHUB_TOKEN=ghp_...
GITHUB_REPO=yourusername/your-repo

# Application
NODE_ENV=development
PUBLIC_SITE_URL=http://localhost:4321
```

### 3. Production Environment Variables

When deploying, add these variables to your hosting platform:

**Vercel:**
1. Go to **Settings** > **Environment Variables**
2. Add each variable from `.env`
3. Set environment: Production, Preview, Development

**Netlify:**
1. Go to **Site settings** > **Environment variables**
2. Add each variable
3. Redeploy your site

**Important:** Never commit `.env` to Git! It's already in `.gitignore`.

---

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:4321`

### 3. Test Features

Test each feature locally:

- **Authentication**: Sign up, sign in, sign out
- **Story Creation**: Add words to stories
- **Realtime Updates**: Open two browser windows, add words
- **Notifications**: Check notification bell
- **Leaderboard**: View top contributors
- **Profile**: Edit your profile
- **Upgrades**: Test Stripe checkout (use test cards)

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future date for expiry and any 3-digit CVC

---

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard

4. Set custom domain (optional):
   - Go to **Settings** > **Domains**
   - Add your domain

### Netlify Deployment

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Add environment variables in Netlify dashboard

### Post-Deployment Checklist

- ✅ Verify environment variables are set
- ✅ Test authentication (all providers)
- ✅ Test Stripe webhooks (update endpoint URL)
- ✅ Update OAuth redirect URLs in Supabase
- ✅ Test real-time subscriptions
- ✅ Verify GitHub PR creation works

---

## Troubleshooting

### Supabase Issues

**"Failed to fetch story"**
- Check SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify database schema was run successfully
- Check browser console for specific errors
- View Supabase logs: **Logs** > **Postgres Logs**

**"RLS policy violation"**
- Re-run the schema SQL to create policies
- Check if RLS is enabled: **Authentication** > **Policies**
- Verify user is authenticated before actions

**Realtime not working**
- Enable replication: **Database** > **Replication**
- Check browser console for WebSocket errors
- Verify tables are published: Look for "Realtime off" toggle

### Stripe Issues

**"Payment system not configured"**
- Verify STRIPE_SECRET_KEY is set
- Check key format (should start with `sk_test_` or `sk_live_`)
- Ensure webhooks are configured correctly

**Webhooks not received**
- Check webhook endpoint URL is correct
- Verify webhook secret matches STRIPE_WEBHOOK_SECRET
- For local testing, use Stripe CLI: `stripe listen`
- Check Stripe Dashboard > **Developers** > **Webhooks** for delivery logs

**Checkout redirect fails**
- Verify PUBLIC_SITE_URL is set correctly
- Check success/cancel URLs in checkout session
- Ensure Stripe Price IDs are correct

### Authentication Issues

**OAuth redirect errors**
- Update redirect URLs in Google/Apple developer consoles
- Format: `https://your-project-id.supabase.co/auth/v1/callback`
- Match exactly (no trailing slashes)

**Email confirmation not received**
- Check spam folder
- Verify email settings in Supabase: **Authentication** > **Email Templates**
- For development, disable email confirmation in Supabase settings

### GitHub Integration Issues

**PR creation fails**
- Verify GITHUB_TOKEN has `repo` scope
- Check repository workflow permissions
- Ensure branch name is unique (includes timestamp)
- View errors in application logs

### General Issues

**Build fails**
- Run `npm install` to ensure dependencies are installed
- Check Node.js version (requires 18+)
- Clear cache: `rm -rf node_modules .astro && npm install`

**Environment variables not working**
- Restart dev server after changing `.env`
- For deployed sites, verify variables are set in hosting platform
- Check variable names match exactly (case-sensitive)

---

## Support and Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **Astro Docs**: [docs.astro.build](https://docs.astro.build)
- **Svelte Docs**: [svelte.dev/docs](https://svelte.dev/docs)

## Security Best Practices

1. **Never commit secrets to Git**
   - Use `.env` for local development
   - Use platform environment variables for production

2. **Rotate keys regularly**
   - Regenerate API keys every 90 days
   - Update in all environments

3. **Use test mode for development**
   - Always use Stripe test keys locally
   - Only use live keys in production

4. **Enable 2FA**
   - Enable on Supabase, Stripe, and GitHub accounts
   - Use authenticator app (not SMS)

5. **Monitor logs**
   - Check Supabase logs regularly
   - Review Stripe webhook deliveries
   - Set up error monitoring (Sentry recommended)

---

## Next Steps

After completing this setup:

1. ✅ Test all features locally
2. ✅ Deploy to staging environment
3. ✅ Run end-to-end tests
4. ✅ Deploy to production
5. ✅ Monitor for errors
6. ✅ Set up automated backups (Supabase)
7. ✅ Configure custom domain
8. ✅ Set up analytics (optional)

Happy storytelling! 🎉
