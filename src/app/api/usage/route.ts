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

    const minutesUsed = Math.ceil(secondsUsed / 60);
    let remaining = profile.minutes_remaining;
    let purchased = profile.purchased_minutes;

    // Deduct from monthly minutes first, then purchased
    if (remaining >= minutesUsed) {
      remaining -= minutesUsed;
    } else {
      const overflow = minutesUsed - remaining;
      remaining = 0;
      purchased = Math.max(0, purchased - overflow);
    }

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
