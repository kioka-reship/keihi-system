import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AccountItem, Expense } from "@/types";

function mapRow(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    storeName: row.store_name as string,
    amount: row.amount as number,
    accountItem: row.account_item as AccountItem,
    description: (row.description as string) || "",
    memo: (row.memo as string) || "",
    imageUrl: (row.image_url as string) || undefined,
    createdAt: row.created_at as string,
  };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data || []).map(mapRow));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const body = await req.json() as Expense;

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      date: body.date,
      store_name: body.storeName,
      amount: body.amount,
      account_item: body.accountItem,
      description: body.description || "",
      memo: body.memo || "",
      image_url: body.imageUrl || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(mapRow(data));
}
