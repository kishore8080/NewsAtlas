import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const isTracking = body.isTracking ?? true;
    const action = isTracking ? "Started" : "Stopped";
    const trackingId = `trk_${Math.random().toString(36).substring(2, 10)}`;

    return NextResponse.json({
      success: true,
      trackingId,
      message: `${action} tracking global events successfully`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to process tracking request" },
      { status: 500 }
    );
  }
}
