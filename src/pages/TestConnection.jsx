import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const TestConnection = () => {
  const testConnection = async () => {
    try {
      // Test database connection
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Database Error:', error);
        return;
      }
      
      console.log('Successfully connected to Supabase!');
      console.log('Test query result:', data);
      
    } catch (error) {
      console.error('Connection Error:', error);
    }
  };

  // Run test on component mount
  useEffect(() => {
    testConnection();
  }, []);

  return null;
};

export default TestConnection; 