import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { event?: string };
    const { event } = body;

    if (!event || typeof event !== "string") {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    // Log the event (can be extended to send to analytics service)
    console.log(`[Track] ${event}`, {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Track] Error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

