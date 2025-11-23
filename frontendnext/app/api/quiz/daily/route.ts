import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import quizBundle from "@/json-output-files/upsc_mcqs.json";

export async function GET(_request: NextRequest) {
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

    let quiz = null;
    let jsonPath = null;

    // Try each path until we find the file
    for (const jsonPathAttempt of possiblePaths) {
      if (fs.existsSync(jsonPathAttempt)) {
        jsonPath = jsonPathAttempt;
        break;
      }
    }

    if (!jsonPath) {
      // Fallback to bundled JSON (ensures availability in Vercel)
      quiz = quizBundle;
    } else {
      const fileContent = fs.readFileSync(jsonPath, "utf-8");
      quiz = JSON.parse(fileContent);
    }

    // Normalize structure (the JSON might already have a `quiz` key)
    const quizData = Array.isArray(quiz)
      ? quiz
      : Array.isArray(quiz.quiz)
        ? quiz.quiz
        : quiz?.data ?? [];

    if (!Array.isArray(quizData) || quizData.length === 0) {
      return NextResponse.json(
        { quiz: [], message: "Quiz file is empty or invalid format" },
        { status: 200 }
      );
    }

    return NextResponse.json({ quiz: quizData });
  } catch (error) {
    console.error("Error loading quiz:", error);
    return NextResponse.json(
      { error: "Failed to load quiz", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Handle CORS
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

