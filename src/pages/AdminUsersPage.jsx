import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Users, Eye, Trash2, ArrowLeft, UserPlus, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
      
      // Add admin user if not present
      const adminExists = storedUsers.some(user => user.email === 'admin@foundermatch.com');
      if (!adminExists) {
        storedUsers.push({
          id: 'admin',
          name: 'Admin User',
          email: 'admin@foundermatch.com',
          skills: 'Administration',
          is_admin: true,
          created_at: new Date().toISOString()
        });
      }

      // Add some sample users if the list is empty
      if (storedUsers.length <= 1) {
        storedUsers.push(
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            university: 'MIT',
            skills: 'React, Node.js',
            interests: 'AI, Blockchain',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            university: 'Stanford',
            skills: 'Python, Data Science',
            interests: 'Machine Learning, Web3',
            created_at: new Date().toISOString()
          }
        );
      }

      localStorage.setItem('founderMatchUsers', JSON.stringify(storedUsers));
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

  const handleDeleteUser = (userId) => {
    try {
      const updatedUsers = users.filter(user => user.id !== userId);
      localStorage.setItem('founderMatchUsers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: "User has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.skills?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={() => navigate('/admin')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
        <div className="flex items-center">
          <Users className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">Manage Users</span>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
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
            <h1 className="text-4xl font-bold">User Management</h1>
            <Button 
              onClick={() => navigate('/signup')}
              className="gradient-bg text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">All Users</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No users found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No users have signed up yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-semibold text-lg">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.skills}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {!user.is_admin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUsersPage; 