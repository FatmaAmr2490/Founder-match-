import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, Eye, ArrowLeft, LogOut, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin, if not redirect to dashboard
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = () => {
    try {
      setLoading(true);
      // Get users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
    setUsers(storedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
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
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <div className="flex items-center">
          <Settings className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">FounderMatch Admin</span>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout Admin
          </Button>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-red-600">{users.length}</p>
                  </div>
                  <Users className="h-12 w-12 text-red-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Profiles</p>
                    <p className="text-3xl font-bold text-green-600">{users.length}</p>
                  </div>
                  <Eye className="h-12 w-12 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Chats</p>
                    <p className="text-3xl font-bold text-blue-600">{Math.floor(users.length / 2)}</p>
                  </div>
                  <MessageSquare className="h-12 w-12 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              onClick={() => navigate('/admin/users')}
            >
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                    <Users className="h-8 w-8 text-red-600" />
                          <div>
                      <h3 className="text-xl font-semibold mb-1">Manage Users</h3>
                      <p className="text-gray-600">View, edit, and manage user accounts</p>
                          </div>
                        </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              onClick={() => navigate('/chat')}
            >
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                                  <div>
                      <h3 className="text-xl font-semibold mb-1">View Chats</h3>
                      <p className="text-gray-600">Monitor active conversations</p>
                                </div>
                              </div>
            </CardContent>
          </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;