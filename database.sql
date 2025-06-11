-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS profiles;

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    university VARCHAR(255),
    skills TEXT[],
    interests TEXT[],
    availability VARCHAR(50),
    bio TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY (id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
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

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create policies for matches
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;

CREATE POLICY "Users can view their own matches" 
ON matches FOR SELECT 
USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
);

CREATE POLICY "Users can create matches" 
ON matches FOR INSERT 
WITH CHECK (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
);

-- Create policies for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can view their own messages" 
ON messages FOR SELECT 
USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
);

CREATE POLICY "Users can send messages" 
ON messages FOR INSERT 
WITH CHECK (
    auth.uid() = sender_id
);

-- Create indexes for better performance
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_matches_user1;
DROP INDEX IF EXISTS idx_matches_user2;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_receiver;
DROP INDEX IF EXISTS idx_messages_created_at;

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at); 