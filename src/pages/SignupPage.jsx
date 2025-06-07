import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    skills: '',
    interests: '',
    availability: '',
    bio: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.skills) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Email, Skills).",
        variant: "destructive"
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
    const newUser = {
      id: Date.now().toString(), // Ensure ID is a string for consistency if needed
      ...formData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('founderMatchUsers', JSON.stringify(users));
    
    // Determine if admin based on email
    const isAdminUser = newUser.email === 'admin@foundermatch.com';
    login(newUser, isAdminUser); // Pass isAdmin status to login

    toast({
      title: "Profile Created!",
      description: "Welcome to FounderMatch! Let's find your co-founder.",
    });

    setTimeout(() => {
      if (isAdminUser) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }, 1500);
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
                Tell us about yourself to find the perfect co-founder match. <br/>
                (Use <code className="bg-gray-200 px-1 rounded">admin@foundermatch.com</code> to access Admin panel)
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
                    placeholder="e.g., Software Development, Marketing, Finance, Design"
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
                    placeholder="e.g., FinTech, HealthTech, AI, E-commerce, SaaS"
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
                    placeholder="e.g., Full-time, Part-time, Weekends only"
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
                    placeholder="Tell us about your entrepreneurial journey, what you're passionate about, and what kind of co-founder you're looking for..."
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
                    Create Profile & Login
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;