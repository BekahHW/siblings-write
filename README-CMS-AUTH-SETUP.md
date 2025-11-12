# Decap CMS Authentication Setup Guide

This guide explains how to set up authentication for the Decap CMS so your team can log in and edit content.

## Quick Start (Recommended): Deploy to Netlify

**This is the easiest option** - Netlify automatically handles GitHub OAuth for Decap CMS with zero configuration needed!

### Step 1: Create a Netlify Account
1. Go to [netlify.com](https://www.netlify.com/)
2. Sign up with your GitHub account
3. You're ready to deploy!

### Step 2: Deploy Your Site
You have two options:

#### Option A: Deploy via Netlify UI (Easiest)
1. Log into Netlify
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select the `BekahHW/siblings-write` repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click "Deploy site"

#### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Follow the prompts to connect your GitHub repo
```

### Step 3: Enable Decap CMS OAuth (Automatic!)
Once deployed on Netlify, OAuth is **automatically enabled**. No configuration needed!

### Step 4: Add Collaborators to GitHub Repo
For team members to access the CMS, they need:
1. A GitHub account
2. Collaborator access to the repository

**To add collaborators:**
1. Go to your GitHub repository: `https://github.com/BekahHW/siblings-write`
2. Click "Settings" → "Collaborators"
3. Click "Add people"
4. Enter their GitHub username or email
5. Select "Write" or "Admin" permissions

### Step 5: Access the CMS
1. Go to your deployed site URL + `/admin`
   - Example: `https://your-site-name.netlify.app/admin`
2. Click "Login with GitHub"
3. Authorize the application
4. Start editing content!

---

## Alternative: GitHub Pages or Other Hosting

If you're not using Netlify, you'll need to set up GitHub OAuth manually.

### Step 1: Create a GitHub OAuth App

1. Go to GitHub Settings: https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the application details:
   - **Application name:** `Siblings Write CMS`
   - **Homepage URL:** Your site URL (e.g., `https://bekahhw.github.io/siblings-write`)
   - **Authorization callback URL:** `https://api.netlify.com/auth/done` (if using Netlify Gateway)
     - OR your own OAuth server URL if you set one up
4. Click "Register application"
5. **Save the Client ID** (you'll need this)
6. Click "Generate a new client secret"
7. **Save the Client Secret** (you'll only see this once!)

### Step 2: Set Up OAuth Backend

You have two options:

#### Option A: Use Netlify's OAuth Gateway (Even without deploying to Netlify)
You can use Netlify's OAuth service even if your site is hosted elsewhere:

1. Create a free Netlify account
2. Deploy a dummy site or connect your repo
3. Go to Site Settings → Identity → Enable Git Gateway
4. This allows you to use Netlify's OAuth with any hosting

#### Option B: Self-Host OAuth (Advanced)
If you want full control, you can run your own OAuth server:

1. Use a service like [netlify-cms-github-oauth-provider](https://github.com/vencax/netlify-cms-github-oauth-provider)
2. Deploy it to Heroku, Vercel, or your own server
3. Configure with your GitHub OAuth Client ID and Secret

### Step 3: Update CMS Config

If not using Netlify, update `public/admin/config.yml`:

```yaml
backend:
  name: github
  repo: BekahHW/siblings-write
  branch: main
  base_url: https://your-oauth-server.com  # Your OAuth server URL
  auth_endpoint: auth  # OAuth endpoint path
```

---

## Local Development & Testing

You can test the CMS locally without authentication!

### Step 1: Run the Local Proxy Server

In one terminal window:
```bash
npm run cms:local
```

This starts a local proxy server on port 8081.

### Step 2: Run Your Development Server

In another terminal window:
```bash
npm run dev
```

This starts Astro on port 3030 (or 4321).

### Step 3: Access the Local CMS

Open your browser to:
```
http://localhost:3030/admin  (or whatever port Astro uses)
```

You can now edit content locally without needing to authenticate! Changes are saved directly to your local files.

**Important:** Make sure `local_backend: true` is in your `public/admin/config.yml` (already configured).

---

## Troubleshooting

### "Error: Unable to access identity endpoint"
- Make sure you're accessing the site via the deployed URL, not localhost
- Verify OAuth is properly configured in your hosting platform

### "Login failed" or "GitHub authentication failed"
- Check that the user has collaborator access to the repository
- Verify the OAuth app is configured correctly
- Make sure the callback URL matches your hosting setup

### CMS shows "Config Error"
- Check `public/admin/config.yml` for syntax errors
- Verify the repository name is correct: `BekahHW/siblings-write`
- Ensure the branch name is correct (usually `main`)

### Changes don't appear on the site
- Wait 2-5 minutes for the build to complete
- Check your hosting platform's build logs
- Verify the commit was created in GitHub

### "Cannot load user" error
- Clear your browser cache and cookies
- Log out and log back in
- Check that your GitHub account has repo access

---

## Security Best Practices

### User Permissions
- Only give "Write" access to content editors (not "Admin" unless needed)
- Regularly review collaborators list
- Remove collaborators who no longer need access

### Content Review
- Consider enabling branch protection rules
- Require pull request reviews for main branch
- Set up automated tests to catch issues

### OAuth Secrets
- **Never commit OAuth client secrets to your repository**
- Store secrets in environment variables or secure hosting settings
- Rotate secrets periodically

---

## Production Checklist

Before going live with the CMS:

- [ ] Site is deployed to production hosting
- [ ] OAuth is configured and working
- [ ] All team members have been added as GitHub collaborators
- [ ] Team members can successfully log into the CMS
- [ ] Test creating/editing/deleting content works
- [ ] Changes appear on the live site after publishing
- [ ] Provide team members with the CMS user guide (README-CMS-GUIDE.md)
- [ ] Set up branch protection rules (optional but recommended)

---

## Additional Resources

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Decap CMS Authentication Docs](https://decapcms.org/docs/authentication-backends/)
- [Netlify Identity Documentation](https://docs.netlify.com/visitor-access/identity/)
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

## Need Help?

If you run into issues:
1. Check the troubleshooting section above
2. Review the Decap CMS documentation
3. Check your hosting platform's documentation
4. Contact your developer or technical support

**For Netlify users:** Netlify support can help with OAuth setup issues.
