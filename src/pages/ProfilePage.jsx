import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Users, ArrowLeft, Save, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ROLES = ['Founder', 'Co-founder', 'Mentor', 'Investor', 'Looking for Team'];
const STATUSES = ['Active', 'Looking', 'Open to Ideas'];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    university: '',
    major: '',
    department: '',
    role: '',
    status: '',
    availability: '',
    skills: '',
    interests: '',
    portfolio_links: ['']
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      university: user.university || '',
      major: user.major || '',
      department: user.department || '',
      role: user.role || ROLES[0],
      status: user.status || STATUSES[0],
      availability: user.availability || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
      interests: Array.isArray(user.interests) ? user.interests.join(', ') : '',
      portfolio_links: Array.isArray(user.portfolio_links) ? user.portfolio_links : ['']
    });
  }, [user, navigate]);

  // Profile completion logic
  const totalFields = 10;
  const completedFields = [
    formData.name,
    formData.bio,
    formData.university,
    formData.major,
    formData.department,
    formData.role,
    formData.status,
    formData.availability,
    formData.skills,
    formData.interests
  ].filter(Boolean).length;
  const progress = Math.round((completedFields / totalFields) * 100);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePortfolioLinkChange = (idx, value) => {
    setFormData(prev => {
      const links = [...prev.portfolio_links];
      links[idx] = value;
      return { ...prev, portfolio_links: links };
    });
  };

  const addPortfolioLink = () => {
    setFormData(prev => ({ ...prev, portfolio_links: [...prev.portfolio_links, ''] }));
  };

  const removePortfolioLink = (idx) => {
    setFormData(prev => {
      const links = prev.portfolio_links.filter((_, i) => i !== idx);
      return { ...prev, portfolio_links: links.length ? links : [''] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
        portfolio_links: formData.portfolio_links.filter(link => link.trim() !== '')
      };
      // Placeholder for the removed updateProfile function
      await refreshUser();
      toast({ title: 'Success', description: 'Your profile has been updated.' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Error', description: 'Failed to update profile. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header 
        className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-gray-100 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex items-center">
          <Users className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">Edit Profile</span>
        </div>
      </motion.header>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              {/* Profile Completion Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  <span className="text-xs text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                    <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" required />
                  </div>
                  {/* Bio */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
                    <Textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself" rows={4} />
                  </div>
                  {/* University */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">University</label>
                    <Input name="university" value={formData.university} onChange={handleChange} placeholder="Your university" />
                  </div>
                  {/* Major */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Major</label>
                    <Input name="major" value={formData.major} onChange={handleChange} placeholder="Your major (e.g., Computer Science)" />
                  </div>
                  {/* Department */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Department</label>
                    <Input name="department" value={formData.department} onChange={handleChange} placeholder="Your department (e.g., Engineering)" />
                  </div>
                  {/* Role */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-2">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {/* Status */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-2">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Availability */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Availability</label>
                    <select name="availability" value={formData.availability} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-2">
                      <option value="">Select availability</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                  {/* Skills */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Skills (comma-separated)</label>
                    <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., JavaScript, React, Node.js" />
                    <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
                  </div>
                  {/* Interests */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Interests (comma-separated)</label>
                    <Input name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., AI, Blockchain, E-commerce" />
                    <p className="text-sm text-gray-500 mt-1">Separate interests with commas</p>
                  </div>
                  {/* Portfolio Links */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Portfolio Links</label>
                    {formData.portfolio_links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <Input
                          value={link}
                          onChange={e => handlePortfolioLinkChange(idx, e.target.value)}
                          placeholder="https://yourportfolio.com"
                        />
                        <Button type="button" variant="ghost" onClick={() => removePortfolioLink(idx)} disabled={formData.portfolio_links.length === 1}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addPortfolioLink} className="mt-2"><LinkIcon className="h-4 w-4 mr-1" /> Add Link</Button>
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-bg text-white" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Save Changes
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