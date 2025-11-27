import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";


export async function GET() {
  try {
    // Try multiple possible paths for the JSON file
    const possiblePaths = [
      // Path relative to frontendnext (if JSON files are copied here)
      path.join(process.cwd(), "json-output-files", "upsc_mcqs.json"),
      // Path in parent directory (for local development)
      path.join(process.cwd(), "..", "json-output-files", "upsc_mcqs.json"),
      // Absolute path from environment variable (for production)
      process.env.QUIZ_JSON_PATH || "",
    ].filter(Boolean);

    let jsonPath: string | null = null;

    // Try each path until we find the file
    for (const jsonPathAttempt of possiblePaths) {
      if (fs.existsSync(jsonPathAttempt)) {
        jsonPath = jsonPathAttempt;
        break;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let quizData: any[] = [];

    if (jsonPath) {
      const fileContent = fs.readFileSync(jsonPath, "utf-8");
      try {
        quizData = JSON.parse(fileContent);
      } catch (e) {
        console.error("Failed to parse quiz JSON:", e);
      }
    }

    if (!quizData || quizData.length === 0) {
      return NextResponse.json(
        { error: "Quiz data not found or empty" },
        { status: 404 }
      );
    }

    // Shuffle and select 5 random questions
    const shuffled = quizData.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5);

    return NextResponse.json({ quiz: selectedQuestions });
  } catch (error) {
    console.error("Error loading quiz:", error);
    return NextResponse.json(
      { error: "Failed to load quiz", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Handle CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

