import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, ArrowLeft, CheckCircle, KeyRound, Eye, EyeOff, UserPlus, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ROLES = ['Founder', 'Co-founder', 'Mentor', 'Investor', 'Looking for Team'];
const STATUSES = ['Active', 'Looking', 'Open to Ideas'];

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    major: '',
    department: '',
    role: ROLES[0],
    status: STATUSES[0],
    availability: '',
    skills: '',
    interests: '',
    bio: '',
    portfolio_links: ['']
  });
  const [showPassword, setShowPassword] = useState(false);

  // Profile completion logic
  const totalFields = 10;
  const completedFields = [
    formData.name,
    formData.email,
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
      if (!formData.email || !formData.password || !formData.name) {
        toast({ title: 'Missing Information', description: 'Please fill in all required fields.', variant: 'destructive' });
        return;
      }
      const result = await signup({
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
        portfolio_links: formData.portfolio_links.filter(link => link.trim() !== '')
      });
      if (result.success) {
        toast({ title: 'Account Created!', description: 'Welcome to FounderMatch! Please check your email for a verification link before logging in.' });
        const destination = location.state?.from?.pathname || (result.isAdmin ? '/admin' : '/dashboard');
        setTimeout(() => { navigate(destination, { replace: true }); }, 1500);
      } else {
        toast({ title: 'Signup Failed', description: result.message || 'Failed to create account. Please try again.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({ title: 'Error', description: error.message || 'An unexpected error occurred. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
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
          Back
        </Button>
        <div className="flex items-center">
          <Users className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">FounderMatch</span>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold mb-4">
                Join FounderMatch
              </CardTitle>
              <p className="text-gray-600">
                Create your account and start connecting with potential co-founders.
              </p>
            </CardHeader>
            
            <CardContent>
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
                  {/* Name Field */}
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="h-12"
                      required
                    />
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="h-12"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="h-12 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* University Field */}
                  <div>
                    <Label htmlFor="university" className="text-sm font-semibold">
                      University
                    </Label>
                    <Input
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="Your university"
                      className="h-12"
                    />
                  </div>

                  {/* Major Field */}
                  <div>
                    <Label htmlFor="major" className="text-sm font-semibold">
                      Major
                    </Label>
                    <Input
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      placeholder="Your major (e.g., Computer Science)"
                      className="h-12"
                    />
                  </div>

                  {/* Department Field */}
                  <div>
                    <Label htmlFor="department" className="text-sm font-semibold">
                      Department
                    </Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Your department (e.g., Engineering)"
                      className="h-12"
                    />
                  </div>

                  {/* Role Field */}
                  <div>
                    <Label htmlFor="role" className="text-sm font-semibold">
                      Role
                    </Label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Status Field */}
                  <div>
                    <Label htmlFor="status" className="text-sm font-semibold">
                      Status
                    </Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Availability Field */}
                  <div>
                    <Label htmlFor="availability" className="text-sm font-semibold">
                      Availability
                    </Label>
                    <select
                      id="availability"
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

                  {/* Skills Field */}
                  <div>
                    <Label htmlFor="skills" className="text-sm font-semibold">
                      Skills
                    </Label>
                    <Input
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., JavaScript, React, Marketing (comma-separated)"
                      className="h-12"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate skills with commas
                    </p>
                  </div>

                  {/* Interests Field */}
                  <div>
                    <Label htmlFor="interests" className="text-sm font-semibold">
                      Interests
                    </Label>
                    <Input
                      id="interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      placeholder="e.g., AI, Blockchain, E-commerce (comma-separated)"
                      className="h-12"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate interests with commas
                    </p>
                  </div>

                  {/* Portfolio Links */}
                  <div>
                    <Label className="text-sm font-semibold">Portfolio Links</Label>
                    {formData.portfolio_links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <Input value={link} onChange={e => handlePortfolioLinkChange(idx, e.target.value)} placeholder="https://yourportfolio.com" />
                        <Button type="button" variant="ghost" onClick={() => removePortfolioLink(idx)} disabled={formData.portfolio_links.length === 1}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addPortfolioLink} className="mt-2"><LinkIcon className="h-4 w-4 mr-1" /> Add Link</Button>
                  </div>

                  {/* Bio Field */}
                  <div>
                    <Label htmlFor="bio" className="text-sm font-semibold">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      rows={4}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 gradient-bg text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Creating Account...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Create Account
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-red-600 hover:underline">
                    Log In
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;