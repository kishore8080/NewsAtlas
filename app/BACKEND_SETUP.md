# Backend API Setup Guide

This guide covers the FastAPI backend setup for EazyPrepAI.

## Prerequisites

- Python 3.8+
- pip or poetry

## Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables (optional):**
   Create a `.env` file in the root directory:
   ```env
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
   FRONTEND_EXTERNAL=http://35.192.3.34
   KUBERNETES_SERVICE=http://frontend-service
   ```

## Running the Server

### Development

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using FastAPI CLI
fastapi dev app/main.py
```

### Production

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Health Check

- **GET** `/` - Root endpoint with service info
- **GET** `/health` - Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "EazyPrepAI API",
  "version": "1.0.0"
}
```

### Quiz Endpoints

- **GET** `/quiz/daily` - Get daily quiz questions

**Response:**
```json
{
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (default Next.js dev server)
- `http://localhost:3001` (alternative port)
- Custom origins via `ALLOWED_ORIGINS` environment variable
- Kubernetes service (if configured)

### Adding Vercel Domain

For production, add your Vercel domain to the `ALLOWED_ORIGINS` environment variable:

```env
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

Or update `app/main.py` to include your specific Vercel domain:

```python
origins.append("https://your-app.vercel.app")
```

## API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

Error responses follow this format:
```json
{
  "detail": "Error message"
}
```

## Testing

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Get daily quiz
curl http://localhost:8000/quiz/daily
```

### Using Python requests

```python
import requests

# Health check
response = requests.get("http://localhost:8000/health")
print(response.json())

# Get daily quiz
response = requests.get("http://localhost:8000/quiz/daily")
print(response.json())
```

## Docker Deployment

The backend includes a Dockerfile. To build and run:

```bash
# Build
docker build -t eazyprepai-backend -f app/Dockerfile .

# Run
docker run -p 8000:8000 eazyprepai-backend
```

## Kubernetes Deployment

See `k8s/backend.yaml` for Kubernetes deployment configuration.

## Adding New Endpoints

1. Add your endpoint function in `app/main.py`:

```python
@app.get("/your-endpoint")
def your_endpoint():
    return {"message": "Hello World"}
```

2. Update this documentation with the new endpoint details.

## Authentication (Future)

To add Clerk authentication verification:

1. Install Clerk Python SDK:
   ```bash
   pip install clerk-sdk
   ```

2. Add authentication dependency:
   ```python
   from clerk_sdk import Clerk
   
   clerk = Clerk(api_key=os.getenv("CLERK_SECRET_KEY"))
   
   async def verify_token(authorization: str = Header(None)):
       if not authorization:
           raise HTTPException(status_code=401, detail="Missing authorization header")
       token = authorization.replace("Bearer ", "")
       try:
           return clerk.verify_token(token)
       except:
           raise HTTPException(status_code=401, detail="Invalid token")
   
   @app.get("/protected-endpoint")
   async def protected_endpoint(user=Depends(verify_token)):
       return {"user_id": user["sub"]}
   ```

## Troubleshooting

### CORS Errors

- Verify your frontend URL is in the `origins` list
- Check that `ALLOWED_ORIGINS` environment variable is set correctly
- Ensure credentials are allowed if using cookies/auth

### Quiz Not Found

- Check that `json-output-files/upsc_mcqs.json` exists
- Verify the file path is correct
- Check file permissions

### Port Already in Use

- Change the port: `uvicorn app.main:app --port 8001`
- Or kill the process using port 8000

## Next Steps

1. Add more API endpoints for other features (study planner, notes, etc.)
2. Implement authentication middleware
3. Add database integration
4. Add request logging and monitoring
5. Implement rate limiting

