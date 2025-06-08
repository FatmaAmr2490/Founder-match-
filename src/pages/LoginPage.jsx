import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, ArrowLeft, LogIn, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      toast({
        title: "Login Successful!",
        description: `Welcome back! Redirecting you to the ${result.isAdmin ? 'admin panel' : 'dashboard'}...`,
      });
      setTimeout(() => {
        if (result.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } else {
      toast({
        title: "Login Failed",
        description: result.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });

      // If the error is about email verification, show a resend verification button
      if (result.message?.includes('verify your email')) {
        toast({
          title: "Email Not Verified",
          description: (
            <div className="space-y-2">
              <p>Please check your email for the verification link.</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={async () => {
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: email,
                  });
                  if (error) {
                    toast({
                      title: "Error",
                      description: "Failed to resend verification email. Please try again.",
                      variant: "destructive"
                    });
                  } else {
                    toast({
                      title: "Verification Email Sent",
                      description: "Please check your inbox for the verification link.",
                    });
                  }
                }}
              >
                Resend Verification Email
              </Button>
            </div>
          ),
          duration: 10000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
          <span className="text-2xl font-bold gradient-text">FounderMatch</span>
        </div>
      </motion.header>

      <div className="flex-1 flex items-center justify-center container mx-auto px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl lg:text-4xl font-bold mb-4">
                Welcome Back!
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Log in to continue your journey.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-12 border-2 focus:border-red-500"
                    required
                  />
                </div>
                
                <div className="space-y-2 relative">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-bg text-white font-semibold text-lg rounded-lg hover:shadow-xl transition-all duration-300"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Log In
                  </Button>
                </motion.div>
              </form>
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-red-600 hover:underline">
                  Sign Up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;