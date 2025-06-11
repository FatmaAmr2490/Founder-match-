import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, MessageCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfiles, createMatch } from '@/lib/supabase';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchMatches();
  }, [user, navigate]);

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
      setLoading(true);
      
      // Get all profiles except current user
      const profiles = await getProfiles();
      const otherProfiles = profiles.filter(profile => 
        profile.id !== user.id && 
        profile.email !== user.email && 
        !profile.is_admin // Exclude admin users from matches
      );

      // Calculate match scores
      const matchesWithScores = await Promise.all(
        otherProfiles.map(async (profile) => {
          const score = calculateMatchScore(user, profile);
          
          // Create or update match in database if score is above threshold
          if (score > 0) {  // Only create matches if there's some compatibility
            try {
              await createMatch(user.id, profile.id, score);
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
        .filter(match => match.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);

      setMatches(topMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
                  <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>

                <div className="space-y-4">
                  {/* Skills */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, index) => (
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
                      {user.interests && user.interests.length > 0 ? (
                        user.interests.map((interest, index) => (
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

                  {/* University */}
                  {user.university && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">University</h3>
                      <p className="text-gray-600">{user.university}</p>
                    </div>
                  )}

                  {/* Availability */}
                  {user.availability && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Availability</h3>
                      <p className="text-gray-600">{user.availability}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matches Section */}
          <div className="md:col-span-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {matches.length > 0 ? (
                matches.map((match) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="shadow-lg border-0 h-full">
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-red-100 mx-auto mb-3 flex items-center justify-center">
                            <User className="w-8 h-8 text-red-600" />
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{match.name}</h3>
                          {match.university && (
                            <p className="text-sm text-gray-500 mb-2">{match.university}</p>
                          )}
                          <div className="inline-flex items-center bg-red-100 text-red-600 rounded-full px-3 py-1 text-sm">
                            {match.matchScore}% Match
                          </div>
                        </div>

                        {/* Skills */}
                        {match.skills && match.skills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-1">
                              {match.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                              {match.skills.length > 3 && (
                                <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">
                                  +{match.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Interests */}
                        {match.interests && match.interests.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Interests</h4>
                            <div className="flex flex-wrap gap-1">
                              {match.interests.slice(0, 3).map((interest, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                                >
                                  {interest}
                                </span>
                              ))}
                              {match.interests.length > 3 && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                                  +{match.interests.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <Button
                          className="w-full gradient-bg text-white"
                          onClick={() => navigate(`/chat/${match.id}`)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Start Chat
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="md:col-span-3 text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Matches Yet</h3>
                  <p className="text-gray-500">
                    We're still looking for your perfect co-founder match.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
