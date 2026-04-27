-- pg_net 拡張を有効化（Supabase では通常デフォルトで有効）
create extension if not exists pg_net with schema extensions;

-- auth.users INSERT 時にウェルカムメールEdge Functionを呼び出す関数
create or replace function public.handle_new_user_welcome()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform extensions.http_post(
    url    := 'https://pvwsaebjloiwcptkojeq.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.webhook_secret', true)
    ),
    body   := jsonb_build_object(
      'type',   'INSERT',
      'schema', 'auth',
      'table',  'users',
      'record', jsonb_build_object(
        'id',    new.id,
        'email', new.email
      )
    )
  );
  return new;
end;
$$;

-- トリガー作成
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user_welcome();
