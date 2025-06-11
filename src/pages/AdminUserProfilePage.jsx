import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, ArrowLeft, Mail, Briefcase, School, Star, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminUserProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin, if not redirect to dashboard
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
    fetchUser();
  }, [isAdmin, navigate, userId]);

  const fetchUser = () => {
    try {
      setLoading(true);
      console.log('Fetching user:', userId);
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
      const foundUser = storedUsers.find(u => u.id === userId);
      
      if (!foundUser) {
        toast({
          title: "User Not Found",
          description: "The requested user profile could not be found.",
          variant: "destructive"
        });
        navigate('/admin/users');
        return;
      }

      console.log('Found user:', foundUser);
      setUser(foundUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = () => {
    try {
      if (user.is_admin) {
        toast({
          title: "Cannot Delete Admin",
          description: "The admin user cannot be deleted.",
          variant: "destructive"
        });
        return;
      }

      const storedUsers = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
      const updatedUsers = storedUsers.filter(u => u.id !== userId);
      localStorage.setItem('founderMatchUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
      
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header 
        className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/users')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div className="flex items-center">
          <Users className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">User Profile</span>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-2xl">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-1">{user.name}</CardTitle>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>
                {!user.is_admin && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteUser}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {user.skills && user.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-red-600" />
                    Skills & Expertise
                  </h3>
                  <p className="text-gray-600">
                    {Array.isArray(user.skills) ? user.skills.join(', ') : 'Not specified'}
                  </p>
                </div>
              )}

              {user.university && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <School className="h-5 w-5 mr-2 text-red-600" />
                    Education
                  </h3>
                  <p className="text-gray-600">{user.university}</p>
                </div>
              )}

              {user.interests && user.interests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-red-600" />
                    Interests
                  </h3>
                  <p className="text-gray-600">
                    {Array.isArray(user.interests) ? user.interests.join(', ') : ''}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  Member Since
                </h3>
                <p className="text-gray-600">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUserProfilePage; 