# Quick Setup: Enable CMS Authentication on Netlify

Follow these steps to enable the CMS login on your Netlify site (including deploy previews).

## Step 1: Enable Netlify Identity

1. Go to your Netlify site dashboard
2. Click on **"Identity"** in the top navigation
3. Click **"Enable Identity"**

## Step 2: Enable Git Gateway

1. Still in the Identity section, scroll down to **"Services"**
2. Under **"Git Gateway"**, click **"Enable Git Gateway"**
3. That's it! Git Gateway is now enabled

## Step 3: Invite Users (Add Your Team)

Now add your non-technical team members:

1. In the Identity section, click **"Invite users"**
2. Enter their email addresses (they don't need GitHub accounts!)
3. They'll receive an email invitation
4. They click the link, set a password, and can now access the CMS

## Step 4: Test the CMS

1. Go to your site: `https://your-site.netlify.app/admin`
2. Click **"Login with Netlify Identity"**
3. Enter your email and password
4. Start editing content!

## Important Notes

- **Works with deploy previews!** Git Gateway works on both production and deploy preview URLs
- **No GitHub accounts needed** - Users just need an email address
- **You control access** - Add/remove users through Netlify Identity dashboard
- **Free tier:** Netlify Identity is free for up to 1,000 users

## Registration Options (Optional)

By default, only invited users can log in. If you want to allow open registration:

1. Go to Identity settings
2. Under **"Registration preferences"**, select **"Open"** or **"Invite only"**
3. For most teams, **"Invite only"** is recommended for security

## Troubleshooting

### "Not Found" error after login
- Make sure Git Gateway is enabled (Step 2)
- Wait a minute after enabling, then try again
- Clear browser cache and try again

### Can't see the Identity tab in Netlify
- Make sure you're on the correct site
- You need to be the site owner or have admin access

### Email invitations not received
- Check spam folder
- Make sure the email address is correct
- Try sending again from the Identity dashboard

## User Limits

Netlify Identity free tier includes:
- Up to 1,000 active users
- 5 invites per hour
- Unlimited logins

This is more than enough for most teams!

---

## Next Steps

Once setup is complete:
1. Share the CMS URL with your team: `https://your-site.netlify.app/admin`
2. Give them the user guide: `README-CMS-GUIDE.md`
3. They can start editing content immediately!
