# Cloudflare Pages Deployment Guide

This guide will help you deploy your Fullego Next.js application to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account (sign up at https://dash.cloudflare.com)
2. Node.js installed (v18 or higher)
3. Git repository connected to GitHub, GitLab, or Bitbucket

## Option 1: Deploy via Cloudflare Dashboard (Recommended)

### Step 1: Connect Your Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Cloudflare to access your repositories
5. Select the `fullego` repository
6. Click **Begin setup**

### Step 2: Configure Build Settings

Use these build settings:

- **Framework preset**: `Next.js (Static HTML Export)`
- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory**: `/` (leave as default)

### Step 3: Environment Variables (if needed)

If your app requires environment variables:
1. Go to your Pages project settings
2. Navigate to **Environment variables**
3. Add any required variables for Production, Preview, or both

### Step 4: Deploy

1. Click **Save and Deploy**
2. Cloudflare will automatically build and deploy your site
3. Your site will be available at `https://fullego.pages.dev` (or your custom domain)

## Option 2: Deploy via Wrangler CLI

### Step 1: Install Wrangler

Wrangler is already included in the project. If you need to install it globally:

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will open your browser to authenticate with Cloudflare.

### Step 3: Build Your Application

```bash
npm run build
```

This will create a static export in the `out` directory.

### Step 4: Deploy to Cloudflare Pages

#### Deploy to Production:

```bash
npm run pages:deploy
```

Or use the combined command:

```bash
npm run cf:deploy
```

#### Deploy to a Specific Branch/Environment:

```bash
npx wrangler pages deploy out --project-name=fullego --branch=main
```

## Custom Domain Setup

1. Go to your Cloudflare Pages project
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain name
5. Follow the DNS configuration instructions
6. Cloudflare will automatically provision SSL certificates

## Environment-Specific Deployments

The `wrangler.toml` file includes configurations for different environments:

- **Production**: `fullego-production`
- **Staging**: `fullego-staging`

To deploy to a specific environment:

```bash
npx wrangler pages deploy out --env=production
```

## Important Notes

1. **Static Export**: This configuration uses Next.js static export, which means:
   - Server-side rendering (SSR) is disabled
   - API routes won't work (they need Cloudflare Workers)
   - All pages are pre-rendered at build time
   - Dynamic routes (like `/dashboard/assets/[id]`) are handled client-side using `generateStaticParams()` with empty arrays

2. **Image Optimization**: Images are set to unoptimized mode for Cloudflare Pages compatibility.

3. **Build Output**: The build output directory is set to `out` (Next.js default for static exports).

## Troubleshooting

### Build Fails

- Check that all dependencies are installed: `npm install`
- Verify Node.js version (should be 18+)
- Check build logs in Cloudflare Dashboard

### Images Not Loading

- Ensure image paths are correct
- Check that images are in the `public` folder
- Verify `unoptimized: true` in `next.config.mjs`

### Deployment Errors

- Ensure `out` directory exists after build
- Check `wrangler.toml` configuration
- Verify you're logged in: `npx wrangler whoami`

## Continuous Deployment

Once connected via Git, Cloudflare Pages will automatically:
- Deploy on every push to the main branch
- Create preview deployments for pull requests
- Run builds automatically

## Support

For more information, visit:
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)

