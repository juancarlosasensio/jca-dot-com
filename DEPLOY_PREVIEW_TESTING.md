# Testing Add-Book Feature with Netlify Deploy Previews

This guide explains how to test the `/add-book/` feature using Netlify Deploy Previews with environment-specific configuration.

## Overview

Netlify supports **context-specific environment variables**, allowing you to use different values for:
- **Production** - Your live site
- **Deploy Previews** - Pull request previews
- **Branch Deploys** - Specific branch deployments

This is ideal for testing the add-book feature against a **test Airtable base** before deploying to production.

---

## Setup: Environment Variables for Different Contexts

### Option 1: Using Netlify UI (Recommended)

1. Go to your Netlify site dashboard
2. Navigate to **Site Settings → Environment Variables**
3. Add variables with context-specific scopes:

#### Production Variables

```
Variable Name: AIRTABLE_API_KEY
Value: keyXXXXXXXXXXXXXXXXX (your production API key)
Scopes: ☑ Production

Variable Name: AIRTABLE_BASE_ID
Value: appXXXXXXXXXXXXXXXXX (your production base ID)
Scopes: ☑ Production

Variable Name: ADMIN_TOKEN
Value: be34dc3f7c6483fb2eae2e9b0f6447d2f8dc19b1f87e44de35612e5f8b1c1c5b
Scopes: ☑ Production ☑ Deploy Previews ☑ Branch Deploys
```

#### Deploy Preview Variables

```
Variable Name: AIRTABLE_API_KEY
Value: keyYYYYYYYYYYYYYYYYY (your test/staging API key)
Scopes: ☑ Deploy Previews

Variable Name: AIRTABLE_BASE_ID
Value: appYYYYYYYYYYYYYYYYY (your test/staging base ID)
Scopes: ☑ Deploy Previews

Variable Name: ADMIN_TOKEN
Value: test_token_for_previews (optional: different token for testing)
Scopes: ☑ Deploy Previews
```

### Option 2: Using `netlify.toml`

You can also configure context-specific variables in your `netlify.toml` file:

```toml
# Production context
[context.production.environment]
  # Do NOT put sensitive values here - use Netlify UI for secrets
  # AIRTABLE_API_KEY and AIRTABLE_BASE_ID should be in Netlify UI
  # ADMIN_TOKEN should be in Netlify UI

# Deploy preview context
[context.deploy-preview.environment]
  # Do NOT put sensitive values here - use Netlify UI for secrets
  # Use Netlify UI to set different AIRTABLE_API_KEY and AIRTABLE_BASE_ID

# Branch deploy context (optional)
[context.branch-deploy.environment]
  # Same as above - use Netlify UI for secrets
```

**⚠️ Security Note:** Never commit sensitive values (API keys, tokens) to your repository. Always use the Netlify UI for secrets.

---

## Setting Up a Test Airtable Base

### 1. Duplicate Your Production Base

1. Open your production Airtable base
2. Click the dropdown next to the base name
3. Select **"Duplicate base"**
4. Name it something like "Books (Testing)" or "Books (Staging)"

### 2. Get Test Base Credentials

1. Go to [airtable.com/account](https://airtable.com/account)
2. Copy your API key (same for all bases)
3. Get the test base ID:
   - Open your test base in browser
   - URL format: `https://airtable.com/appYYYYYYYYYYYYY/...`
   - The `appYYYYYYYYYYYYY` part is your test base ID

### 3. Configure Deploy Preview Variables

In Netlify UI, add these variables with **Deploy Previews** scope:

```
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX (your API key)
AIRTABLE_BASE_ID=appYYYYYYYYYYYYY (your TEST base ID)
ADMIN_TOKEN=be34dc3f7c6483fb2eae2e9b0f6447d2f8dc19b1f87e44de35612e5f8b1c1c5b
```

---

## Testing Workflow

### 1. Create a Pull Request

```bash
# Create a feature branch
git checkout -b feature/test-add-book

# Make some changes (or push this branch as-is)
git push -u origin feature/test-add-book
```

### 2. Open Pull Request on GitHub

1. Go to your repository on GitHub
2. Click **"Pull requests"** → **"New pull request"**
3. Select your feature branch
4. Create the PR

### 3. Wait for Deploy Preview

Netlify will automatically:
1. Build your site from the PR branch
2. Deploy to a preview URL: `https://deploy-preview-XX--your-site.netlify.app`
3. Use the **Deploy Preview** environment variables (test Airtable base)

### 4. Test the Feature

1. Visit the deploy preview URL: `https://deploy-preview-XX--your-site.netlify.app/add-book/`
2. Enter your admin token
3. Test adding books - they will go to your **test Airtable base**
4. Verify all functionality works:
   - ✅ Authentication
   - ✅ Metadata extraction from URLs
   - ✅ Manual editing of fields
   - ✅ Duplicate detection
   - ✅ Successful creation in test base
   - ✅ Error handling

### 5. Verify in Test Airtable Base

1. Open your test Airtable base
2. Confirm books were added correctly:
   - Title, authors, cover image populated
   - "Queued" shelf assigned
   - `isPublishable` set to true

### 6. Merge to Production

Once testing is complete:
1. Merge the PR on GitHub
2. Netlify will auto-deploy to production
3. Production will use **Production** environment variables (real Airtable base)

---

## Environment Variable Priority

Netlify uses this priority order (highest to lowest):

1. **Context-specific variables** (e.g., Deploy Preview scope)
2. **All scopes variables** (available everywhere)
3. **Build-time .env file** (not recommended for secrets)

**Example:**
- If you have `AIRTABLE_BASE_ID` with Production scope AND Deploy Preview scope
- Deploy previews will use the Deploy Preview value
- Production will use the Production value
- Perfect for testing!

---

## Troubleshooting

### Deploy Preview Not Using Test Base

**Check:**
1. Netlify UI → Environment Variables
2. Verify test `AIRTABLE_BASE_ID` has **"Deploy Previews"** scope checked
3. Redeploy the preview (push a new commit or click "Retry deploy")

### Can't Authenticate on Deploy Preview

**Check:**
1. `ADMIN_TOKEN` is set in Netlify UI
2. Token has **"Deploy Previews"** scope
3. You're using the correct token value

### Functions Not Working

**Check:**
1. Netlify Functions logs: Site → Functions → View logs
2. Environment variables are accessible in function context
3. Functions are deploying correctly (check Deploy log)

### Books Going to Wrong Base

**Check:**
1. Verify which environment you're testing (preview vs production)
2. Check Netlify environment variables for that context
3. Look at Netlify Function logs to see which base ID is being used

---

## Advanced: Multiple Test Environments

You can set up multiple test environments using branch deploys:

### Branch-Specific Testing

```toml
# In netlify.toml

[context.staging]
  # Variables set in Netlify UI with "Branch: staging" scope
  # AIRTABLE_BASE_ID = appSTAGINGBASEID

[context.qa]
  # Variables set in Netlify UI with "Branch: qa" scope
  # AIRTABLE_BASE_ID = appQABASEID
```

Then create branches:
- `staging` - for staging environment
- `qa` - for QA testing
- Each gets its own Airtable base!

---

## Security Best Practices

### ✅ Do:
- Use Netlify UI for all sensitive values (API keys, tokens)
- Use different admin tokens for production vs previews (optional)
- Test thoroughly on deploy previews before merging
- Use HttpOnly cookies (already implemented)
- Verify SSRF protections work

### ❌ Don't:
- Commit API keys to `.env` files in git
- Share admin tokens publicly
- Use production base for testing
- Skip testing on deploy previews

---

## Quick Reference

### Testing Checklist

Before merging a PR that affects `/add-book/`:

- [ ] Deploy preview generated successfully
- [ ] Can authenticate with admin token
- [ ] Can extract metadata from Amazon URL
- [ ] Can extract metadata from Bookshop.org URL
- [ ] Can extract metadata from Open Library URL
- [ ] Can manually edit extracted fields
- [ ] Duplicate detection shows warning correctly
- [ ] Book created successfully in test Airtable base
- [ ] Placeholder image used when cover missing
- [ ] Error messages display correctly
- [ ] Success page shows correct information
- [ ] "Add Another Book" link works
- [ ] Verified in test Airtable base (not production!)

---

## Getting Help

**Netlify Deploy Preview Issues:**
- Check Netlify Deploy log for build errors
- Check Netlify Function logs for runtime errors
- Verify environment variables in Netlify UI

**Airtable Issues:**
- Verify API key is correct (check [airtable.com/account](https://airtable.com/account))
- Verify base ID is correct (check URL in Airtable)
- Check Airtable API status page for outages

**Authentication Issues:**
- Verify `ADMIN_TOKEN` matches in Netlify UI and your local token
- Check browser cookies are enabled
- Try clearing cookies and re-authenticating
