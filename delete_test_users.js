import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Set global fetch for Supabase client
globalThis.fetch = fetch;

// Initialize Supabase client
const supabase = createClient(
  'https://fdmahumwxiqxfooxlukw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbWFodW13eGlxeGZvb3hsdWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTYxMjQsImV4cCI6MjA2NDk5MjEyNH0.108KhstVFWZa1c_Ni9amca5KdTc9750Ky5YaQsBdk1k'
);

async function listAllProfiles() {
  try {
    console.log('Fetching all profiles...');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found in the database');
      return;
    }

    console.log('Found profiles:', JSON.stringify(profiles, null, 2));
    console.log('Total number of profiles:', profiles.length);
  } catch (error) {
    console.error('Error:', error);
  }
}

listAllProfiles(); 