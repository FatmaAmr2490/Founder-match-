import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, ArrowLeft, CheckCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    skills: '',
    interests: '',
    availability: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.skills) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Email, Password, Skills).",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    const { success, isAdmin } = signup(formData);

    if (success) {
      toast({
        title: "Profile Created!",
        description: "Welcome to FounderMatch! Let's find your co-founder.",
      });

      setTimeout(() => {
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } else {
      toast({
        title: "Signup Failed",
        description: "Could not create your profile. Please try again.",
        variant: "destructive"
      });
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

      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl lg:text-4xl font-bold mb-4">
                Create Your Profile
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Join FounderMatch and start connecting.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="h-12 border-2 focus:border-red-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="h-12 border-2 focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password (min. 6 characters)"
                    className="h-12 border-2 focus:border-red-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-8 h-7 w-7 text-gray-500 hover:text-red-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm font-semibold">
                    University/Education
                  </Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    placeholder="e.g., Stanford University, MIT, Self-taught"
                    className="h-12 border-2 focus:border-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-sm font-semibold">
                    Skills & Expertise *
                  </Label>
                  <Input
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Development, Marketing, Finance"
                    className="h-12 border-2 focus:border-red-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests" className="text-sm font-semibold">
                    Interests & Industry Focus
                  </Label>
                  <Input
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="e.g., FinTech, HealthTech, AI, E-commerce"
                    className="h-12 border-2 focus:border-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-sm font-semibold">
                    Availability
                  </Label>
                  <Input
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g., Full-time, Part-time"
                    className="h-12 border-2 focus:border-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-semibold">
                    About You
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about your entrepreneurial journey..."
                    className="min-h-[120px] border-2 focus:border-red-500"
                  />
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-bg text-white font-semibold text-lg rounded-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Create Profile
                  </Button>
                </motion.div>
              </form>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-red-600 hover:underline">
                  Log In
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;