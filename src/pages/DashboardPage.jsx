
import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Users, MessageCircle, User, Mail, GraduationCap, Briefcase, Heart, Clock, ArrowLeft, LogOut, MessageSquare as ChatIcon } from 'lucide-react'; // Added ChatIcon
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, loading } = useAuth();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (loading) return; 

    if (!currentUser) {
      navigate('/signup');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id && u.name && u.skills && u.interests);
    
    const userMatches = otherUsers.map(otherUser => ({
      ...otherUser,
      matchScore: calculateMatchScore(currentUser, otherUser)
    })).sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);

    setMatches(userMatches);
  }, [navigate, currentUser, loading]);

  const calculateMatchScore = (user1, user2) => {
    let score = 0;
    
    if (!user1 || !user2) return 0;
    if (!user1.skills || !user2.skills) return 0;
    if (!user1.interests || !user2.interests) return 0;

    const user1Skills = user1.skills.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
    const user2Skills = user2.skills.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
    
    const user1Interests = user1.interests.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
    const user2Interests = user2.interests.toLowerCase().split(',').map(s => s.trim()).filter(s => s);

    if (user1Skills.length === 0 || user1Interests.length === 0) return 0;

    const sharedInterests = user1Interests.filter(interest => 
      user2Interests.some(otherInterest => otherInterest.includes(interest) || interest.includes(otherInterest))
    );
    score += sharedInterests.length * 25;

    const user1UniqueSkills = user1Skills.filter(skill => !user2Skills.includes(skill));
    const user2UniqueSkills = user2Skills.filter(skill => !user1Skills.includes(skill));
    
    if (user1UniqueSkills.length > 0 && user2UniqueSkills.length > 0) {
        score += 35;
    } else if (user1UniqueSkills.length > 0 || user2UniqueSkills.length > 0) {
        score += 15;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const handleInitiateChat = (matchUser) => {
    if (!currentUser) return;
    
    const storedChats = JSON.parse(localStorage.getItem(`founderMatchChats_${currentUser.id}`) || '{}');
    
    if (!storedChats[matchUser.id]) {
      storedChats[matchUser.id] = []; 
      localStorage.setItem(`founderMatchChats_${currentUser.id}`, JSON.stringify(storedChats));
    }

    navigate('/chat', { state: { selectedUserId: matchUser.id } });
    
    toast({
      title: "Chat Started!",
      description: `You can now message ${matchUser.name} in the Chats tab.`,
    });
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header 
        className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-gray-100 sticky top-0 z-20"
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
          Home
        </Button>
        <div className="flex items-center">
          <Users className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">FounderMatch</span>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" onClick={() => navigate('/chat')} className="text-gray-600 hover:text-red-600">
            <ChatIcon className="h-5 w-5 mr-0 sm:mr-2"/>
            <span className="hidden sm:inline">Chats</span>
          </Button>
          <span className="text-gray-600 hidden sm:inline">Welcome, {currentUser.name}!</span>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-8">
            Welcome, <span className="gradient-text">{currentUser.name}</span>!
          </h1>

          <Card className="mb-8 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <User className="mr-2 h-6 w-6 text-red-600" />
                Your Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                </div>
                {currentUser.university && (
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Education</p>
                      <p className="font-medium">{currentUser.university}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Skills</p>
                    <p className="font-medium">{currentUser.skills}</p>
                  </div>
                </div>
                {currentUser.availability && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="font-medium">{currentUser.availability}</p>
                    </div>
                  </div>
                )}
              </div>
              {currentUser.interests && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Interests</p>
                  <p className="font-medium">{currentUser.interests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <Heart className="mr-3 h-8 w-8 text-red-600" />
              Your Matches
            </h2>
            
            {matches.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                  <p className="text-gray-600">
                    We're working on finding the perfect co-founders for you. <br/>
                    Ensure your profile has skills and interests filled out for best results!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{match.name}</CardTitle>
                          <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">
                            {match.matchScore}% match
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {match.university && (
                          <div className="flex items-center text-sm text-gray-600">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            {match.university}
                          </div>
                        )}
                        <div className="flex items-start text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2 mt-0.5" />
                          <span>{match.skills}</span>
                        </div>
                        {match.interests && (
                          <div className="flex items-start text-sm text-gray-600">
                            <Heart className="h-4 w-4 mr-2 mt-0.5" />
                            <span>{match.interests}</span>
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                View Profile
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">{match.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="font-medium">{match.email}</p>
                                  </div>
                                  {match.university && (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-1">Education</p>
                                      <p className="font-medium">{match.university}</p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Skills</p>
                                    <p className="font-medium">{match.skills}</p>
                                  </div>
                                  {match.availability && (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-1">Availability</p>
                                      <p className="font-medium">{match.availability}</p>
                                    </div>
                                  )}
                                </div>
                                {match.interests && (
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Interests</p>
                                    <p className="font-medium">{match.interests}</p>
                                  </div>
                                )}
                                {match.bio && (
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">About</p>
                                    <p className="text-gray-700">{match.bio}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            size="sm" 
                            className="flex-1 gradient-bg text-white"
                            onClick={() => handleInitiateChat(match)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
