import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../../../utils/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("click_events")
    .select("link_type, link_label, clicked_at")
    .eq("slug", params.slug)
    .order("clicked_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by link_type + link_label
  const counts: Record<string, { type: string; label: string; count: number }> =
    {};
  for (const row of data ?? []) {
    const key = `${row.link_type}::${row.link_label}`;
    if (!counts[key]) {
      counts[key] = {
        type: row.link_type,
        label: row.link_label ?? "",
        count: 0,
      };
    }
    counts[key].count++;
  }

  return NextResponse.json({
    total: data?.length ?? 0,
    breakdown: Object.values(counts).sort((a, b) => b.count - a.count),
  });
}
