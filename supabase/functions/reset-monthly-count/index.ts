import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error, count } = await supabase
    .from("profiles")
    .update({ monthly_count: 0 })
    .gt("monthly_count", 0)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("monthly_count reset failed:", error.message);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(`monthly_count reset: ${count ?? 0} rows updated`);
  return new Response(
    JSON.stringify({ ok: true, updated: count ?? 0 }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
