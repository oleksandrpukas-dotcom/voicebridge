import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ tier: "free", minutesRemaining: 0, purchasedMinutes: 0 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, minutes_remaining, purchased_minutes")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ tier: "free", minutesRemaining: 0, purchasedMinutes: 0 });
    }

    return NextResponse.json({
      tier: profile.tier,
      minutesRemaining: profile.minutes_remaining,
      purchasedMinutes: profile.purchased_minutes,
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { secondsUsed } = await req.json();

    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, minutes_remaining, purchased_minutes")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // minutes_remaining is stored as minutes in DB, convert to seconds for precise tracking
    const remainingSeconds = profile.minutes_remaining * 60;
    const purchasedSeconds = profile.purchased_minutes * 60;

    let remSec = remainingSeconds;
    let purSec = purchasedSeconds;

    if (remSec >= secondsUsed) {
      remSec -= secondsUsed;
    } else {
      const overflow = secondsUsed - remSec;
      remSec = 0;
      purSec = Math.max(0, purSec - overflow);
    }

    // Convert back to minutes for storage (keep fractional precision)
    const remaining = Math.floor(remSec / 60);
    const purchased = Math.floor(purSec / 60);

    await supabase
      .from("profiles")
      .update({
        minutes_remaining: remaining,
        purchased_minutes: purchased,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await supabase.from("usage_logs").insert({
      user_id: user.id,
      session_start: new Date(Date.now() - secondsUsed * 1000).toISOString(),
      session_end: new Date().toISOString(),
      seconds_used: secondsUsed,
      tier: profile.tier,
    });

    return NextResponse.json({
      minutesRemaining: remaining,
      purchasedMinutes: purchased,
      totalAvailable: remaining + purchased,
    });
  } catch (error) {
    console.error("Usage update error:", error);
    return NextResponse.json({ error: "Failed to update usage" }, { status: 500 });
  }
}
