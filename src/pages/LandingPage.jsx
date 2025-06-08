import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, MessageCircle, ArrowRight, Star, CheckCircle, LogIn, UserPlus, Shield, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <motion.header 
        className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-100 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/90"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <Users className="h-6 w-6 text-red-600 mr-2" />
          <span className="text-xl font-bold gradient-text">FounderMatch</span>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <Button 
            variant="ghost"
            className="text-gray-600 hover:text-red-600"
            onClick={() => {
              const element = document.getElementById('about');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            About
          </Button>
          <Button 
            variant="ghost"
            className="text-gray-600 hover:text-red-600"
            onClick={() => {
              const element = document.getElementById('how-it-works');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How It Works
          </Button>
          
          {currentUser ? (
            <>
              {isAdmin ? (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/admin')}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Shield className="h-4 w-4 mr-2" /> Admin
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-red-600"
                >
                  Dashboard
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={logout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-red-600"
              >
                <LogIn className="h-4 w-4 mr-2" /> Login
              </Button>
              <Button 
                variant="default"
                className="gradient-bg text-white"
                onClick={() => navigate('/signup')}
              >
                <UserPlus className="h-4 w-4 mr-2" /> Sign Up
              </Button>
            </>
          )}
        </nav>
      </motion.header>

      <section className="relative overflow-hidden animated-bg">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold mb-6"
              variants={fadeInUp}
            >
              Find Your Perfect
              <span className="gradient-text block mt-2">Co-Founder</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Connect with ambitious entrepreneurs and build the next generation of successful startups together
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex justify-center gap-4">
              <Button 
                size="lg" 
                className="gradient-bg text-white px-8 py-6 text-lg font-semibold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/signup')}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">About FounderMatch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're dedicated to connecting visionary entrepreneurs with complementary skills and shared ambitions. 
              Our platform uses advanced matching algorithms to help you find the perfect co-founder for your startup journey.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to find your co-founder</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-red-600">1</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Create Profile</h3>
                  <p className="text-gray-600">
                    Share your expertise, vision, and what you're looking for in a co-founder
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-red-600">2</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Get Matched</h3>
                  <p className="text-gray-600">
                    Our algorithm finds potential co-founders who complement your skills and share your vision
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-red-600">3</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Connect & Build</h3>
                  <p className="text-gray-600">
                    Start conversations, meet your matches, and begin building your startup together
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Find Your Co-Founder?
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who are building the future together
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="px-8 py-6 text-lg font-semibold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/signup')}
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-xl font-bold">FounderMatch</span>
              </div>
              <p className="text-gray-400">
                Connecting visionary entrepreneurs to build the next generation of startups.
              </p>
              <div className="mt-4 flex items-center">
                <Mail className="h-4 w-4 text-red-500 mr-2" />
                <a href="mailto:foundermatch13@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                  foundermatch13@gmail.com
                </a>
              </div>
            </div>
            <div>
              <span className="text-lg font-semibold mb-4 block">Legal</span>
              <div className="flex flex-col space-y-2">
                <a href="mailto:foundermatch13@gmail.com" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Contact</a>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</Link>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© {new Date().getFullYear()} FounderMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;