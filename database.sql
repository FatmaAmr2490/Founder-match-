-- First, disable triggers temporarily
SET session_replication_role = 'replica';

-- Drop existing tables if they exist (CAUTION: This will delete existing data)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table first, without auth_id constraint
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID,
    email TEXT NOT NULL,
    name TEXT,
    university TEXT,
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    availability TEXT,
    bio TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add auth_id constraint after table creation
ALTER TABLE profiles 
    ADD CONSTRAINT unique_auth_id UNIQUE (auth_id),
    ADD CONSTRAINT unique_email UNIQUE (email);

-- Create matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID,
    user2_id UUID,
    match_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add match constraints after table creation
ALTER TABLE matches
    ADD CONSTRAINT fk_user1 FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_user2 FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE,
    ADD CONSTRAINT unique_match UNIQUE (user1_id, user2_id);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID,
    receiver_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add message constraints after table creation
ALTER TABLE messages
    ADD CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_profiles_auth_id ON profiles(auth_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_matches_updated_at ON matches;
CREATE TRIGGER set_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_messages_updated_at ON messages;
CREATE TRIGGER set_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (
        auth.uid()::text = auth_id::text
        OR 
        auth.uid() IS NULL
    );

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid()::text = auth_id::text);

CREATE POLICY "Users can delete own profile"
    ON profiles FOR DELETE
    USING (auth.uid()::text = auth_id::text);

-- Create policies for matches
CREATE POLICY "Users can view their own matches"
    ON matches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND (profiles.id = matches.user1_id OR profiles.id = matches.user2_id)
        )
    );

CREATE POLICY "Users can create matches"
    ON matches FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND (profiles.id = user1_id OR profiles.id = user2_id)
        )
    );

-- Create policies for messages
CREATE POLICY "Users can view their own messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND (profiles.id = messages.sender_id OR profiles.id = messages.receiver_id)
        )
    );

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND profiles.id = sender_id
        )
    );

CREATE POLICY "Users can delete their own messages"
    ON messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND profiles.id = sender_id
        )
    );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if a profile already exists for this auth_id
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE auth_id = NEW.id
    ) THEN
        -- Create new profile if one doesn't exist
        INSERT INTO public.profiles (
            auth_id,
            email,
            is_admin
        )
        VALUES (
            NEW.id,
            NEW.email,
            NEW.email = 'admin@foundermatch.com'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Re-enable triggers
SET session_replication_role = 'origin'; 