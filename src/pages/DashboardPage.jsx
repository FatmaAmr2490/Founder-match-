import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Users, MessageCircle, User, Mail, GraduationCap, Briefcase, Heart, Clock, ArrowLeft, LogOut, MessageSquare as ChatIcon, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfiles, createMatch, getMatches } from '@/lib/supabase';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, loading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchMatches();
  }, [navigate, currentUser, loading]);

  const calculateMatchScore = (user1, user2) => {
    let score = 0;

    // Don't match users with themselves or with admins
    if (user1.id === user2.id || user1.email === user2.email || user2.is_admin) {
      return 0;
    }

    // Compare skills (35 points max)
    if (user1.skills && user2.skills) {
      const skills1 = Array.isArray(user1.skills) ? user1.skills : [];
      const skills2 = Array.isArray(user2.skills) ? user2.skills : [];
      
      // Find unique skills each user has
      const uniqueSkills1 = skills1.filter(s => !skills2.includes(s.toLowerCase()));
      const uniqueSkills2 = skills2.filter(s => !skills1.includes(s.toLowerCase()));
      
      if (uniqueSkills1.length > 0 && uniqueSkills2.length > 0) {
        // Both users have complementary skills
        score += 35;
      } else if (uniqueSkills1.length > 0 || uniqueSkills2.length > 0) {
        // One user has unique skills
        score += 15;
      }
    }

    // Compare interests (25 points max)
    if (user1.interests && user2.interests) {
      const interests1 = Array.isArray(user1.interests) ? user1.interests : [];
      const interests2 = Array.isArray(user2.interests) ? user2.interests : [];
      
      const sharedInterests = interests1.filter(i => 
        interests2.some(j => j.toLowerCase() === i.toLowerCase())
      );
      score += Math.min(sharedInterests.length * 25, 25);
    }

    // Add availability match (15 points)
    if (user1.availability && user2.availability && 
        user1.availability.toLowerCase() === user2.availability.toLowerCase()) {
      score += 15;
    }

    // Add education match (10 points)
    if (user1.university && user2.university && 
        user1.university.toLowerCase() === user2.university.toLowerCase()) {
      score += 10;
    }

    // Add profile completeness (15 points)
    const profileFields1 = [user1.name, user1.skills, user1.interests, user1.availability, user1.university].filter(Boolean).length;
    const profileFields2 = [user2.name, user2.skills, user2.interests, user2.availability, user2.university].filter(Boolean).length;
    const avgCompleteness = ((profileFields1 + profileFields2) / 10) * 15;
    score += avgCompleteness;

    return Math.min(Math.round(score), 100);
  };

  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      console.log('Fetching matches for user:', currentUser.id);

      // Get all profiles except current user
      const profiles = await getProfiles();
      const otherProfiles = profiles.filter(profile => 
        profile.id !== currentUser.id && 
        profile.email !== currentUser.email && 
        !profile.is_admin // Exclude admin users from matches
      );
      console.log('Found potential matches:', otherProfiles);

      // Calculate match scores
      const matchesWithScores = await Promise.all(
        otherProfiles.map(async (profile) => {
          const score = calculateMatchScore(currentUser, profile);
          
          // Create or update match in database if score is above threshold
          if (score > 0) {  // Only create matches if there's some compatibility
            try {
              await createMatch(currentUser.id, profile.id, score);
            } catch (error) {
              console.error('Error creating/updating match:', error);
            }
          }
          
          return {
            ...profile,
            matchScore: score
          };
        })
      );

      // Sort by match score and get top matches (exclude zero scores)
      const topMatches = matchesWithScores
        .filter(match => match.matchScore > 0) // Only include matches with positive scores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);

      console.log('Top matches:', topMatches);
      setMatches(topMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingMatches(false);
    }
  };

  if (loading || loadingMatches) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header 
        className="px-4 lg:px-6 h-16 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <Users className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">Dashboard</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost"
            onClick={() => navigate('/chat')}
            className="text-gray-600 hover:text-red-600"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Messages
          </Button>
          <Button 
            variant="outline"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="grid gap-8 md:grid-cols-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* User Profile Section */}
          <div className="md:col-span-4">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                    <User className="w-12 h-12 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{currentUser.name || 'Complete Your Profile'}</h2>
                  <p className="text-gray-500">{currentUser.email}</p>
                </div>

                <div className="space-y-4">
                  {/* Profile Completion */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Profile Completion</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ 
                          width: `${calculateProfileCompletion(currentUser)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.skills && currentUser.skills.length > 0 ? (
                        currentUser.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm">No skills added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.interests && currentUser.interests.length > 0 ? (
                        currentUser.interests.map((interest, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm">No interests added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-3">
                    {currentUser.university && (
                      <div className="flex items-center text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        <span>{currentUser.university}</span>
                      </div>
                    )}
                    {currentUser.availability && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{currentUser.availability}</span>
                      </div>
                    )}
                    {currentUser.bio && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">About</h3>
                        <p className="text-gray-600 text-sm">{currentUser.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Edit Profile Button */}
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matches Section */}
          <div className="md:col-span-8">
            <h2 className="text-2xl font-bold mb-6">Your Matches</h2>
            {matches.length === 0 ? (
              <Card className="shadow-lg border-0">
                <CardContent className="p-6 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No matches found yet. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-lg border-0 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-semibold text-lg">
                                {match.name ? match.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{match.name}</h3>
                              <p className="text-sm text-gray-500">{match.university || 'No university listed'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">{match.matchScore}%</div>
                            <div className="text-sm text-gray-500">Match</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Skills</p>
                            <p className="font-medium">
                              {Array.isArray(match.skills) ? match.skills.join(', ') : 'Not specified'}
                            </p>
                          </div>
                          {match.interests && match.interests.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Interests</p>
                              <p className="font-medium">
                                {Array.isArray(match.interests) ? match.interests.join(', ') : ''}
                              </p>
                            </div>
                          )}
                          {match.availability && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Availability</p>
                              <p className="font-medium">{match.availability}</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex gap-2">
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
                                {match.bio && (
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">About</p>
                                    <p className="font-medium">{match.bio}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate('/chat')}
                          >
                            <ChatIcon className="h-4 w-4 mr-2" />
                            Chat
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

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (user) => {
  const fields = [
    user.name,
    user.skills?.length > 0,
    user.interests?.length > 0,
    user.university,
    user.availability,
    user.bio
  ];
  
  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
};

export default DashboardPage;
