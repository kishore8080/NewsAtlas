# Vercel Deployment Guide

This guide will help you deploy the eazyprepAI frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Your backend API URL (if your backend is deployed separately)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel will auto-detect Next.js

2. **Configure Project Settings**
   - **Root Directory**: Set to `frontendnext` (if your repo root is the parent directory)
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Environment Variables**
   Add the following environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key (get from https://dashboard.clerk.com)
   - `CLERK_SECRET_KEY`: Your Clerk secret key (get from https://dashboard.clerk.com)
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-backend-api.com`)
   - Or `NEXT_PUBLIC_API_BASE`: Alternative name for the API base URL
   
   Optional Clerk environment variables:
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: Custom sign-in URL (default: `/sign-in`)
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: Custom sign-up URL (default: `/sign-up`)
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: Redirect after sign-in (default: `/dashboard`)
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: Redirect after sign-up (default: `/dashboard`)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to frontend directory**
   ```bash
   cd frontendnext
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production deployment, use: `vercel --prod`

5. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   vercel env add CLERK_SECRET_KEY
   vercel env add NEXT_PUBLIC_API_URL
   # Enter values when prompted
   ```

## Environment Variables

Make sure to set these in your Vercel project settings:

### Required Variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key (get from https://dashboard.clerk.com)
- `CLERK_SECRET_KEY`: Your Clerk secret key (get from https://dashboard.clerk.com)
- `NEXT_PUBLIC_API_URL`: Your backend API base URL (e.g., `https://api.example.com`)
- `NEXT_PUBLIC_API_BASE`: Alternative name (if used)

### Optional Clerk Variables

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: Custom sign-in URL (default: `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: Custom sign-up URL (default: `/sign-up`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: Redirect after sign-in (default: `/dashboard`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: Redirect after sign-up (default: `/dashboard`)

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Make sure your backend API has CORS configured to allow requests from your Vercel domain.

## Post-Deployment

1. **Update Backend CORS**
   - Add your Vercel domain to your backend's CORS allowed origins
   - Example: `https://your-app.vercel.app`

2. **Test Your Deployment**
   - Visit your Vercel deployment URL
   - Test all features that require API calls

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation passes locally first
- Review build logs in Vercel dashboard

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend CORS settings
- Ensure backend is accessible from the internet

### Routing Issues
- Next.js App Router should work automatically
- Check that all pages are in the `app` directory

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. You can configure branch deployments in the Vercel dashboard.

## Additional Resources

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

