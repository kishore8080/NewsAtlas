# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for EazyPrepAI.

## Prerequisites

1. A Clerk account (sign up at [clerk.com](https://clerk.com))
2. Node.js 18+ installed

## Setup Steps

### 1. Create a Clerk Application

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Click "Create Application"
3. Choose your preferred authentication methods (Email, Google, GitHub, etc.)
4. Complete the setup wizard

### 2. Get Your API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy the following:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontendnext` directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Optional: Customize Clerk URLs
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Configure Clerk Application Settings

In your Clerk dashboard:

1. Go to **Paths** and ensure:
   - Sign-in path: `/sign-in`
   - Sign-up path: `/sign-up`

2. Go to **Redirects** and add:
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

3. (Optional) Configure **Social Connections**:
   - Enable Google, GitHub, or other OAuth providers
   - Add authorized redirect URLs if needed

### 5. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Click "Sign Up" to create a test account
4. Verify you can sign in and access protected routes

## Protected Routes

The following routes are protected and require authentication:
- `/dashboard`
- `/study-planner`
- `/quiz/daily`
- `/test-series`
- `/current-affairs`
- `/notes`
- `/answer-evaluation`
- `/mentorship`

Public routes (no authentication required):
- `/` (homepage)
- `/sign-in`
- `/sign-up`

## Using Authentication in Components

### Get Current User

```tsx
import { useUser } from "@clerk/nextjs";

export default function MyComponent() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  return <div>Hello, {user.firstName}!</div>;
}
```

### Get User ID for API Calls

```tsx
import { useAuth } from "@clerk/nextjs";

export default function MyComponent() {
  const { userId, getToken } = useAuth();

  const fetchData = async () => {
    const token = await getToken();
    const response = await fetch("/api/data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // ...
  };
}
```

### Server-Side Authentication

```tsx
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function ServerComponent() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return <div>Not authenticated</div>;
  }

  return <div>Hello, {user?.firstName}!</div>;
}
```

## Deployment

When deploying to Vercel or other platforms:

1. Add your Clerk environment variables to your deployment platform
2. Make sure to use production keys (`pk_live_` and `sk_live_`) for production deployments
3. Update your Clerk dashboard with your production domain

See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions.

## Troubleshooting

### "Clerk: Missing publishableKey" Error

- Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in your `.env.local` file
- Restart your development server after adding environment variables
- Check that the variable name is exactly `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### Sign-in/Sign-up Pages Not Working

- Verify the routes `/sign-in` and `/sign-up` exist
- Check that middleware is not blocking these routes
- Ensure Clerk paths are configured correctly in the dashboard

### Users Can't Access Protected Routes

- Check that middleware is properly configured
- Verify the route is not in the public routes list
- Ensure users are properly authenticated

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Components](https://clerk.com/docs/components/overview)

