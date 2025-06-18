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

    // Prepare profile data with arrays and new fields
    const processedProfileData = {
      ...profileData,
      skills: Array.isArray(profileData.skills) ? profileData.skills : (profileData.skills ? profileData.skills.split(',').map(s => s.trim()).filter(Boolean) : []),
      interests: Array.isArray(profileData.interests) ? profileData.interests : (profileData.interests ? profileData.interests.split(',').map(i => i.trim()).filter(Boolean) : []),
      portfolio_links: Array.isArray(profileData.portfolio_links) ? profileData.portfolio_links : (profileData.portfolio_links ? profileData.portfolio_links.filter(link => link.trim() !== '') : []),
      major: profileData.major || '',
      department: profileData.department || '',
      role: profileData.role || 'founder',
      status: profileData.status || 'active',
      auth_id: authData.user.id,
      email,
      is_admin: email === 'admin@foundermatch.com'
    };

    // Create profile record
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([processedProfileData])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    return { user: { ...authData.user, ...profile } };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Enforce email verification
    if (!authData.user.email_confirmed_at) {
      throw new Error('Please verify your email address before logging in.');
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile after login:', profileError);
      throw profileError;
    }

    return { user: { ...authData.user, ...profile } };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    
    if (user) {
      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      return { ...user, ...profile };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Profile helper functions
export const updateProfile = async (userId, profileData) => {
  try {
    const processedData = {
      ...profileData,
      skills: Array.isArray(profileData.skills) ? profileData.skills : (profileData.skills ? profileData.skills.split(',').map(s => s.trim()).filter(Boolean) : []),
      interests: Array.isArray(profileData.interests) ? profileData.interests : (profileData.interests ? profileData.interests.split(',').map(i => i.trim()).filter(Boolean) : []),
      portfolio_links: Array.isArray(profileData.portfolio_links) ? profileData.portfolio_links : (profileData.portfolio_links ? profileData.portfolio_links.filter(link => link.trim() !== '') : []),
      major: profileData.major || '',
      department: profileData.department || '',
      role: profileData.role || 'founder',
      status: profileData.status || 'active',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(processedData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
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
export const getMessages = async (userId1, userId2, page = 1, pageSize = 20) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return { 
      messages: data.map(msg => ({
        ...msg,
        created_at: new Date(msg.created_at).toISOString()
      })), 
      totalCount: count,
      hasMore: count > (page * pageSize)
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (senderId, receiverId, content) => {
  try {
    const messageData = {
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
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

// Resend email verification
export const resendVerificationEmail = async (email) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, message: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, message: error.message };
  }
};

// Upload file/image to Supabase Storage
export const uploadFileToStorage = async (file, userId) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `chat/${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
  const { data, error } = await supabase.storage.from('chat-uploads').upload(filePath, file);
  if (error) throw error;
  // Get public URL
  const { publicURL } = supabase.storage.from('chat-uploads').getPublicUrl(filePath).data;
  return publicURL;
};

// Event helper functions
export const createEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
};

export const joinEvent = async (eventId, userId) => {
  // Fetch current attendees
  const { data: event, error: fetchError } = await supabase
    .from('events')
    .select('attendees')
    .eq('id', eventId)
    .single();
  if (fetchError) throw fetchError;
  const attendees = event.attendees || [];
  if (attendees.includes(userId)) return event; // Already joined
  const updated = [...attendees, userId];
  const { data, error } = await supabase
    .from('events')
    .update({ attendees: updated })
    .eq('id', eventId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const leaveEvent = async (eventId, userId) => {
  // Fetch current attendees
  const { data: event, error: fetchError } = await supabase
    .from('events')
    .select('attendees')
    .eq('id', eventId)
    .single();
  if (fetchError) throw fetchError;
  const attendees = event.attendees || [];
  const updated = attendees.filter((id) => id !== userId);
  const { data, error } = await supabase
    .from('events')
    .update({ attendees: updated })
    .eq('id', eventId)
    .select()
    .single();
  if (error) throw error;
  return data;
}; 