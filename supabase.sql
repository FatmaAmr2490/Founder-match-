-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Update or create RLS policies for profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = auth_id);

CREATE POLICY "Users can delete own profile"
ON profiles FOR DELETE
USING (auth.uid() = auth_id);

-- Update or create RLS policies for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

CREATE POLICY "Users can view their own messages"
ON messages FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_id FROM profiles WHERE id = sender_id OR id = receiver_id
  )
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT auth_id FROM profiles WHERE id = sender_id
  )
);

CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_id FROM profiles WHERE id = sender_id
  )
);

-- Update or create RLS policies for matches
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update their matches" ON matches;

CREATE POLICY "Users can view their matches"
ON matches FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_id FROM profiles WHERE id = user1_id OR id = user2_id
  )
);

CREATE POLICY "Users can create matches"
ON matches FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT auth_id FROM profiles WHERE id = user1_id
  )
);

CREATE POLICY "Users can update their matches"
ON matches FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_id FROM profiles WHERE id = user1_id OR id = user2_id
  )
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    -- ... other fields ...
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
); 

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = auth_id); 

SELECT * FROM pg_policies WHERE tablename = 'profiles'; 