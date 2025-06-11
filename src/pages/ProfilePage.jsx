import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Users, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/supabase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    university: '',
    availability: '',
    skills: '',
    interests: ''
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Initialize form with current user data
    setFormData({
      name: currentUser.name || '',
      bio: currentUser.bio || '',
      university: currentUser.university || '',
      availability: currentUser.availability || '',
      skills: Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : '',
      interests: Array.isArray(currentUser.interests) ? currentUser.interests.join(', ') : ''
    });
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
      };

      await updateProfile(currentUser.id, updatedData);
      await refreshUser();

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header 
        className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-gray-100 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center">
          <Users className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">Edit Profile</span>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Name
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Bio
                    </label>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      University
                    </label>
                    <Input
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="Your university"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Availability
                    </label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      <option value="">Select availability</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Skills (comma-separated)
                    </label>
                    <Input
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate skills with commas
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Interests (comma-separated)
                    </label>
                    <Input
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      placeholder="e.g., AI, Blockchain, E-commerce"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate interests with commas
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-bg text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 