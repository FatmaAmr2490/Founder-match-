import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (userData) => {
  const { email, password, ...profileData } = userData;
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('No user returned from signup');
    }

    // Create profile record
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          auth_id: authData.user.id,
          email,
          ...profileData,
          is_admin: email === 'admin@foundermatch.com'
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    return { ...authData, profile };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  
  if (user) {
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    return { ...user, ...profile };
  }
  
  return null;
};

// Profile helper functions
export const updateProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: profileData.name,
      bio: profileData.bio,
      university: profileData.university,
      availability: profileData.availability,
      skills: profileData.skills,
      interests: profileData.interests,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) throw error;
  return data;
};

// Matching helper functions
export const createMatch = async (userId1, userId2, score) => {
  const { error } = await supabase
    .from('matches')
    .insert([
      {
        user1_id: userId1,
        user2_id: userId2,
        match_score: score,
      }
    ]);

  if (error) throw error;
};

export const getMatches = async (userId) => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:profiles!matches_user1_id_fkey(*),
      user2:profiles!matches_user2_id_fkey(*)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (error) throw error;
  return data;
};

// Message helper functions
export const sendMessage = async (senderId, receiverId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      }
    ])
    .select();

  if (error) throw error;
  return data[0];
};

export const getMessages = async (userId1, userId2, page = 1, pageSize = 20) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(name, email),
      receiver:profiles!messages_receiver_id_fkey(name, email)
    `)
    .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { 
    messages: data.reverse().map(msg => ({
      ...msg,
      sender_name: msg.sender?.name || msg.sender?.email || 'Unknown User',
      receiver_name: msg.receiver?.name || msg.receiver?.email || 'Unknown User'
    })), 
    totalCount: count,
    hasMore: count > (page * pageSize)
  };
};

export const deleteConversation = async (userId1, userId2) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`);

  if (error) throw error;
};

// Real-time subscriptions
export const subscribeToMessages = (userId, callback) => {
  return supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`,
      },
      (payload) => {
        console.log('New message received:', payload);
        callback(payload);
      }
    )
    .subscribe();
};

export const subscribeToMatches = (userId, callback) => {
  return supabase
    .channel('matches')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `or(user1_id=eq.${userId},user2_id=eq.${userId})`,
      },
      callback
    )
    .subscribe();
}; 