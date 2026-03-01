# Deployment Guide

## Vercel (Recommended)

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js - no config needed

### 2. Set Environment Variables

In Vercel project settings, add:

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |

### 3. Deploy

Click "Deploy". Vercel will build and deploy automatically. Future pushes to `main` trigger automatic deployments.

### 4. Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Products display with images
- [ ] Add to cart works
- [ ] Wishlist heart toggle works
- [ ] Cart persists on page refresh
- [ ] Order form validates correctly
- [ ] Order submission sends Telegram message
- [ ] Order success page displays
- [ ] Mobile responsive layout works
- [ ] Navigation between pages works

## Build Configuration

No special build configuration is needed. The default Next.js build process handles everything:

- Static pages are pre-rendered at build time
- Product detail pages use `generateStaticParams` for SSG
- The `/api/orders` route runs as a serverless function
- Images from Unsplash are optimized via Next.js Image

## Updating Products

After modifying `data/products.ts`:
1. Commit and push to trigger a new deployment
2. Vercel will rebuild with the updated product data
