-- First, disable RLS to avoid any conflicts during setup
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can delete their matches" ON matches;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their messages" ON messages;

-- Drop existing tables
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS profiles;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    university VARCHAR(255),
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    availability VARCHAR(50),
    bio TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create matches table
CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID NOT NULL,
    user2_id UUID NOT NULL,
    match_score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_user1
        FOREIGN KEY (user1_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user2
        FOREIGN KEY (user2_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_match
        UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_sender
        FOREIGN KEY (sender_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
WITH CHECK (
    -- Allow during signup
    (auth.uid() IS NULL AND auth.role() = 'anon') 
    OR 
    -- Allow authenticated users to create their profile
    (auth.uid() IS NOT NULL AND auth.uid()::text = id::text)
);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
USING (auth.uid()::text = id::text);

-- Create policies for matches table
CREATE POLICY "Users can view their own matches"
ON matches FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE (profiles.id = matches.user1_id OR profiles.id = matches.user2_id)
        AND profiles.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can create matches"
ON matches FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE (profiles.id = user1_id OR profiles.id = user2_id)
        AND profiles.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their matches"
ON matches FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE (profiles.id = matches.user1_id OR profiles.id = matches.user2_id)
        AND profiles.auth_id = auth.uid()
    )
);

-- Create policies for messages table
CREATE POLICY "Users can view their own messages"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE (profiles.id = messages.sender_id OR profiles.id = messages.receiver_id)
        AND profiles.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = sender_id
        AND profiles.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their messages"
ON messages FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = messages.sender_id
        AND profiles.auth_id = auth.uid()
    )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Reset sequences if they exist
ALTER SEQUENCE IF EXISTS matches_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS messages_id_seq RESTART WITH 1; 