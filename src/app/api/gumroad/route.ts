import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  console.log('=== GUMROAD WEBHOOK CALLED ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  
  const body = await req.formData();
  const secret = body.get("secret") as string;
  const email = body.get("email") as string;
  const saleId = body.get("sale_id") as string;
  
  console.log('Received secret:', secret);
  console.log('Expected secret:', process.env.GUMROAD_WEBHOOK_SECRET);
  console.log('Email:', email);
  console.log('Sale ID:', saleId);
  
  if (secret !== process.env.GUMROAD_WEBHOOK_SECRET) {
    console.log('❌ SECRET MISMATCH!');
    console.log('Received:', secret);
    console.log('Expected:', process.env.GUMROAD_WEBHOOK_SECRET);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const premiumUntil = body.get("subscription_ended_at") as string | null;

  // Find user by email in auth.users
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      is_premium: true,
      premium_until: premiumUntil,
      gumroad_sale_id: saleId,
    })
    .eq("id", userData.id);

  if (updateError) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 