import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Users, Eye, Edit, Trash2, ArrowLeft, UserPlus, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
    setUsers(storedUsers);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.skills && user.skills.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteUser = (userId) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('founderMatchUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "User Deleted",
      description: "User has been successfully removed from the platform.",
    });
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('founderMatchUsers', JSON.stringify(updatedUsers));
    setEditingUser(null);
    
    toast({
      title: "User Updated",
      description: "User profile has been successfully updated.",
    });
  };

  const generateMatches = (targetUser) => {
    const otherUsers = users.filter(u => u.id !== targetUser.id);
    return otherUsers.map(user => ({
      ...user,
      matchScore: Math.floor(Math.random() * 40) + 60 
    })).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  };

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
          <Users className="h-8 w-8 text-red-600 mr-2" />
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
            <Button 
              onClick={() => navigate('/signup')}
              className="gradient-bg text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
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
                    <p className="text-sm text-gray-500 mb-1">Potential Matches</p>
                    <p className="text-3xl font-bold text-blue-600">{users.length > 1 ? users.length * (users.length - 1) : 0}</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">{user.name} - Profile Details</DialogTitle>
                            </DialogHeader>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Profile Information</h3>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                  </div>
                                  {user.university && (
                                    <div>
                                      <p className="text-sm text-gray-500">University</p>
                                      <p className="font-medium">{user.university}</p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm text-gray-500">Skills</p>
                                    <p className="font-medium">{user.skills}</p>
                                  </div>
                                  {user.interests && (
                                    <div>
                                      <p className="text-sm text-gray-500">Interests</p>
                                      <p className="font-medium">{user.interests}</p>
                                    </div>
                                  )}
                                  {user.availability && (
                                    <div>
                                      <p className="text-sm text-gray-500">Availability</p>
                                      <p className="font-medium">{user.availability}</p>
                                    </div>
                                  )}
                                  {user.bio && (
                                    <div>
                                      <p className="text-sm text-gray-500">Bio</p>
                                      <p className="text-gray-700">{user.bio}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Potential Matches</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {generateMatches(user).map((match) => (
                                    <div key={match.id} className="flex items-center justify-between p-2 border rounded">
                                      <div>
                                        <p className="font-medium">{match.name}</p>
                                        <p className="text-sm text-gray-500">{match.skills}</p>
                                      </div>
                                      <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                                        {match.matchScore}%
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={editingUser?.id === user.id} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit User Profile</DialogTitle>
                            </DialogHeader>
                            {editingUser && editingUser.id === user.id && (
                              <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={editingUser.name}
                                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                      id="edit-email"
                                      value={editingUser.email}
                                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-university">University</Label>
                                    <Input
                                      id="edit-university"
                                      value={editingUser.university || ''}
                                      onChange={(e) => setEditingUser({...editingUser, university: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-availability">Availability</Label>
                                    <Input
                                      id="edit-availability"
                                      value={editingUser.availability || ''}
                                      onChange={(e) => setEditingUser({...editingUser, availability: e.target.value})}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="edit-skills">Skills</Label>
                                  <Input
                                    id="edit-skills"
                                    value={editingUser.skills}
                                    onChange={(e) => setEditingUser({...editingUser, skills: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-interests">Interests</Label>
                                  <Input
                                    id="edit-interests"
                                    value={editingUser.interests || ''}
                                    onChange={(e) => setEditingUser({...editingUser, interests: e.target.value})}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSaveEdit} className="gradient-bg text-white">
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
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

export default AdminPage;