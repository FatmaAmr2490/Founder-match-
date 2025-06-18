import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { resendVerificationEmail, sendPasswordResetEmail } from '@/lib/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

    if (result.success) {
      toast({
          title: "Welcome back!",
          description: `Redirecting you to the ${result.isAdmin ? 'admin panel' : 'dashboard'}...`,
      });
        
        // Get the redirect path from location state or default to dashboard/admin
        const destination = location.state?.from?.pathname || (result.isAdmin ? '/admin' : '/dashboard');
        
        // Add a small delay before navigation
      setTimeout(() => {
          navigate(destination, { replace: true });
      }, 1500);
    } else {
      toast({
        title: "Login Failed",
        description: result.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await sendPasswordResetEmail(forgotEmail);
      if (result.success) {
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your email for a link to reset your password.',
        });
        setShowForgot(false);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to send password reset email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold mb-4">
                Welcome Back
              </CardTitle>
              <p className="text-gray-600">
                Sign in to continue your co-founder search
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Email Field */}
                  <div>
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="h-12"
                    required
                      disabled={loading}
                  />
                </div>
                
                  {/* Password Field */}
                  <div className="relative">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </Label>
                    <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                        className="h-12 pr-10"
                    required
                        disabled={loading}
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                    </div>
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
                      Signing In...
                    </div>
                  ) : (
                    <>
                    <LogIn className="mr-2 h-5 w-5" />
                      Sign In
                    </>
                  )}
                  </Button>

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-red-600 hover:underline">
                    Create Account
                </Link>
              </p>
              </form>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-red-600 hover:underline text-sm"
                  onClick={() => setShowForgot(!showForgot)}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
              {showForgot && (
                <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !forgotEmail}
                  >
                    {loading ? 'Sending...' : 'Send Password Reset Email'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;