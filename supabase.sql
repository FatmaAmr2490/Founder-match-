-- Clean up any existing objects
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop trigger if exists handle_updated_at on profiles;
drop function if exists handle_updated_at cascade;
drop table if exists messages;
drop table if exists matches;
drop table if exists profiles;

-- Drop existing tables and functions
drop table if exists public.messages cascade;
drop table if exists public.matches cascade;
drop table if exists public.profiles cascade;
drop function if exists handle_updated_at cascade;

-- Drop existing policies if they exist
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- Create the base table
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    email text,
    skills text[],
    interests text[],
    availability text,
    role text default 'user',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone" 
on profiles for select using (true);

create policy "Users can update own profile" 
on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile" 
on profiles for insert with check (auth.uid() = id);

-- Create a function to handle updating the updated_at column
create or replace function handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Create a trigger to automatically update the updated_at column
create trigger handle_updated_at
    before update
    on profiles
    for each row
    execute function handle_updated_at();

-- Create a table for matches
create table if not exists public.matches (
    id uuid default uuid_generate_v4() primary key,
    user1_id uuid references profiles(id) on delete cascade,
    user2_id uuid references profiles(id) on delete cascade,
    match_score integer,
    status text default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user1_id, user2_id)
);

-- Enable RLS for matches
alter table public.matches enable row level security;

-- Create policies for matches
create policy "Users can view their own matches"
    on public.matches
    for select
    using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can insert their own matches"
    on public.matches
    for insert
    with check (auth.uid() = user1_id);

create policy "Users can update their own matches"
    on public.matches
    for update
    using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Create a trigger for matches updated_at
create trigger handle_matches_updated_at
    before update
    on public.matches
    for each row
    execute function handle_updated_at();

-- Create messages table
create table messages (
    id uuid default gen_random_uuid() primary key,
    match_id uuid references matches(id) on delete cascade,
    sender_id uuid references profiles(id) on delete cascade,
    content text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table messages enable row level security;

-- Create policies
create policy "Users can view messages in their matches"
on messages for select using (
    exists (
        select 1 from matches
        where id = messages.match_id
        and (user1_id = auth.uid() or user2_id = auth.uid())
    )
);

create policy "Users can send messages in their matches"
on messages for insert with check (
    exists (
        select 1 from matches
        where id = match_id
        and (user1_id = auth.uid() or user2_id = auth.uid())
    )
    and sender_id = auth.uid()
);

-- Create a trigger for messages updated_at
create trigger handle_messages_updated_at
    before update
    on public.messages
    for each row
    execute function handle_updated_at(); 