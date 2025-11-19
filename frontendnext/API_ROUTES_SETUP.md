# API Routes Setup Guide

This guide explains how the backend API has been integrated into the Next.js frontend using API routes.

## Structure

The backend has been converted from FastAPI to Next.js API routes:

- **Original**: `app/main.py` (FastAPI)
- **New**: `frontendnext/app/api/*/route.ts` (Next.js API Routes)

## API Endpoints

### `/api/quiz/daily`
- **Method**: GET
- **Description**: Fetches daily quiz questions
- **File**: `app/api/quiz/daily/route.ts`
- **Response**: `{ quiz: [...] }`

### `/api/health`
- **Method**: GET
- **Description**: Health check endpoint
- **File**: `app/api/health/route.ts`
- **Response**: `{ status: "healthy", service: "EazyPrepAI API", version: "1.0.0" }`

## File Path Configuration

The API routes need access to the quiz JSON files. The code tries multiple paths:

1. `frontendnext/json-output-files/upsc_mcqs.json` (recommended for Vercel)
2. `../json-output-files/upsc_mcqs.json` (for local development)
3. Path from `QUIZ_JSON_PATH` environment variable

### For Vercel Deployment

**Option 1: Copy JSON files to frontendnext (Recommended)**
```bash
# Copy the JSON files into the frontendnext folder
mkdir -p frontendnext/json-output-files
cp json-output-files/upsc_mcqs.json frontendnext/json-output-files/
```

**Option 2: Use Environment Variable**
Set `QUIZ_JSON_PATH` in Vercel to point to your JSON file location (if using external storage).

**Option 3: Include in Git**
If the JSON files are in the repository, they'll be included in the deployment automatically.

## Local Development

For local development, you have two options:

### Option 1: Use Next.js API Routes (Default)
The API routes will automatically work when you run `npm run dev`. Make sure the JSON files are accessible at one of the paths mentioned above.

### Option 2: Use External FastAPI Backend
If you want to use the original FastAPI backend:

1. Set environment variable:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

2. Start the FastAPI server:
   ```bash
   cd app
   uvicorn main:app --reload
   ```

3. The frontend will automatically use the external API when `NEXT_PUBLIC_API_URL` is set.

## API Client

The API client (`lib/api.ts`) automatically detects which backend to use:

- If `NEXT_PUBLIC_API_URL` is set → uses external API
- If not set → uses Next.js API routes (`/api/*`)

## Updating Endpoints

To add a new endpoint:

1. Create a new file: `app/api/your-endpoint/route.ts`
2. Export the HTTP methods you need:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Your logic here
  return NextResponse.json({ data: "your data" });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Your logic here
  return NextResponse.json({ success: true });
}
```

3. The endpoint will be available at `/api/your-endpoint`

## Python Serverless Functions (Alternative)

If you prefer to keep using Python, Vercel also supports Python serverless functions:

1. Create files in `api/` directory (not `app/api/`)
2. Example: `api/quiz/daily.py`
3. Use the handler format shown in `api/quiz/daily.py` and `api/health.py`

However, Next.js API routes are recommended for better integration with the Next.js app.

## Troubleshooting

### "Quiz JSON not found" Error

1. Check that `upsc_mcqs.json` exists
2. Verify the file path is correct
3. For Vercel: Ensure the file is included in the deployment (check `.vercelignore`)
4. Try setting `QUIZ_JSON_PATH` environment variable with the absolute path

### CORS Errors

CORS is automatically handled by Next.js API routes when accessed from the same origin. If you're accessing from a different domain, you may need to add CORS headers (already included in the routes).

### File System Access

Vercel serverless functions have read-only access to the file system. Make sure your JSON files are:
- Included in the Git repository, OR
- Uploaded to external storage (S3, etc.) and accessed via environment variables

## Migration from FastAPI

If you were using the FastAPI backend:

1. ✅ API routes created in `app/api/`
2. ✅ API client updated to use new routes
3. ✅ CORS handling included
4. ⚠️ JSON file path needs to be configured for Vercel
5. ⚠️ Any Python-specific logic needs to be converted to TypeScript/JavaScript

## Next Steps

1. Copy JSON files to `frontendnext/json-output-files/` for Vercel deployment
2. Test the API routes locally: `npm run dev`
3. Deploy to Vercel - the API routes will work automatically
4. Add more endpoints as needed in `app/api/`

