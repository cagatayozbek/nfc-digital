import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { slug, link_type, link_label } = await request.json();
    if (!slug || !link_type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    await supabase.from("click_events").insert({ slug, link_type, link_label });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
