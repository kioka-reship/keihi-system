import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      credits: session.metadata?.credits ? parseInt(session.metadata.credits, 10) : null,
    });
  } catch (error) {
    console.error("session-info error:", error);
    return NextResponse.json({ error: "セッション情報の取得に失敗しました" }, { status: 500 });
  }
}
