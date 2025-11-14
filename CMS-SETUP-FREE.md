# Simple CMS Setup (100% Free with GitHub)

This setup uses GitHub for authentication - completely free, no upgrades needed!

## For You (Site Owner) - One-Time Setup

### Step 1: Add Team Members as GitHub Collaborators

This is how you give your non-technical team members access to edit content:

1. Go to your repository: https://github.com/BekahHW/siblings-write
2. Click **"Settings"** (top menu)
3. Click **"Collaborators"** in the left sidebar
4. Click **"Add people"**
5. Enter their GitHub username or email
6. Select **"Write"** permission (this lets them edit content)
7. They'll receive an email invitation

**Important:** They need to accept the invitation before they can use the CMS!

### Step 2: Share the CMS URL

Once your site is deployed, share this URL with your team:
- Production: `https://your-site-url.com/admin`
- Deploy Preview: Works on preview URLs too!

### Step 3: That's It!

No additional setup needed. No paid plans. No OAuth configuration required.

---

## For Your Team Members - Getting Started

### What They Need:

1. **A free GitHub account** (if they don't have one)
   - Go to https://github.com/join
   - Sign up (takes 2 minutes)

2. **Accept your invitation**
   - Check email for invite from GitHub
   - Click "Accept invitation"

### How to Use the CMS:

1. Go to the CMS URL (site owner will provide this)
2. Click **"Login with GitHub"**
3. If prompted, authorize the application
4. Start editing content!

---

## How It Works

### With "Write" Access (Recommended):
- Team members are collaborators on the repo
- Changes save directly to the repository
- Changes go live after the site rebuilds (2-5 minutes)

### With "Read" Access or No Access:
- Users can still edit through "Open Authoring"
- Changes create a pull request instead
- You (site owner) review and merge the PR
- More control, but adds a review step

---

## Troubleshooting

### "Not Found" or "Error!" popup when logging in

**Most common cause:** The person hasn't been added as a collaborator yet.

**Fix:**
1. Make sure you've added them as a collaborator (Step 1 above)
2. Make sure they've accepted the invitation email
3. Have them log out of GitHub and log back in
4. Try the CMS login again

### "This user doesn't have access to this repo"

**Fix:** Add them as a collaborator with "Write" permission.

### Can't see changes on the live site

**Fix:** Wait 2-5 minutes for the site to rebuild. Check your hosting platform's build logs.

---

## Benefits of This Approach

✅ **Completely free** - No paid plans needed
✅ **Works everywhere** - Production, deploy previews, etc
✅ **Simple** - Just GitHub accounts + collaborator access
✅ **Secure** - GitHub handles all authentication
✅ **No extra services** - No Netlify Identity, no OAuth apps to configure

---

## GitHub Account Setup (for non-technical users)

If your team members don't have GitHub accounts:

1. Go to https://github.com/join
2. Enter an email address
3. Create a password
4. Choose a username
5. Verify the email
6. Done! Now they can accept your collaborator invitation

---

## Summary

**For the site owner:**
- Add team members as collaborators on GitHub (Settings > Collaborators)
- Give them "Write" permission
- Share the CMS URL

**For team members:**
- Create a free GitHub account
- Accept the collaborator invitation
- Go to the CMS URL and login with GitHub
- Start editing!

No upgrades. No paid plans. No complicated setup.
