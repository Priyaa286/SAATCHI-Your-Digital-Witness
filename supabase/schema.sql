create table incidents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  platform text,
  url text,
  timestamp timestamptz,
  sender_name text,
  screenshot_url text,
  sha256_hash text,
  description text,
  created_at timestamptz default now()
);

alter table incidents enable row level security;

create policy "Users see own incidents"
  on incidents for all
  using (auth.uid() = user_id);