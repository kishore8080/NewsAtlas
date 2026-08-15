import { NextResponse } from "next/server";

export async function POST() {
  const trackingId = `unsub_${Math.random().toString(36).substring(2, 10)}`;
  return NextResponse.json({
    success: true,
    trackingId,
    message: "Unsubscribed from global events tracking",
  });
}
