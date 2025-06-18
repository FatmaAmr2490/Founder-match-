import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, MessageCircle, User, LogOut, Link as LinkIcon, Award, Briefcase, School, Star, BadgeCheck, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    major: '',
    department: '',
    role: '',
    status: '',
    skill: '',
    interest: ''
  });
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchMatches();
    fetchEvents();
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // Get all profiles except current user
      const profiles = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Founder', status: 'Active', skills: ['JavaScript', 'React'], interests: ['Technology', 'Entrepreneurship'], university: 'Harvard University', availability: 'Full-time' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Co-founder', status: 'Looking', skills: ['Python', 'Machine Learning'], interests: ['Artificial Intelligence', 'Blockchain'], university: 'Stanford University', availability: 'Part-time' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Mentor', status: 'Open to Ideas', skills: ['Entrepreneurship', 'Marketing'], interests: ['Technology', 'Entrepreneurship'], university: 'Yale University', availability: 'Full-time' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Investor', status: 'Active', skills: ['Venture Capital', 'Finance'], interests: ['Technology', 'Entrepreneurship'], university: 'Columbia University', availability: 'Full-time' },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Looking for Team', status: 'Active', skills: ['Software Development', 'Blockchain'], interests: ['Technology', 'Entrepreneurship'], university: 'Princeton University', availability: 'Full-time' }
      ];
      let otherProfiles = profiles.filter(profile => 
        profile.id !== user.id && 
        profile.email !== user.email && 
        !profile.is_admin // Exclude admin users from matches
      );

      // Apply filters
      if (filters.major) otherProfiles = otherProfiles.filter(p => (p.major || '').toLowerCase().includes(filters.major.toLowerCase()));
      if (filters.department) otherProfiles = otherProfiles.filter(p => (p.department || '').toLowerCase().includes(filters.department.toLowerCase()));
      if (filters.role) otherProfiles = otherProfiles.filter(p => (p.role || '').toLowerCase() === filters.role.toLowerCase());
      if (filters.status) otherProfiles = otherProfiles.filter(p => (p.status || '').toLowerCase() === filters.status.toLowerCase());
      if (filters.skill) otherProfiles = otherProfiles.filter(p => (p.skills || []).some(s => s.toLowerCase().includes(filters.skill.toLowerCase())));
      if (filters.interest) otherProfiles = otherProfiles.filter(p => (p.interests || []).some(i => i.toLowerCase().includes(filters.interest.toLowerCase())));

      // Calculate match scores
      const matchesWithScores = await Promise.all(
        otherProfiles.map(async (profile) => {
          const score = calculateMatchScore(user, profile);
          
          // Create or update match in database if score is above threshold
          if (score > 0) {  // Only create matches if there's some compatibility
            try {
              // Placeholder for database operation
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

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const data = [
        { id: 1, title: 'Startup Pitch Competition', date: '2024-05-15T18:00:00', location: 'Online', attendees: [1, 2, 3] },
        { id: 2, title: 'Tech Meetup', date: '2024-05-20T19:00:00', location: 'Silicon Valley', attendees: [1, 4] },
        { id: 3, title: 'Venture Capital Panel', date: '2024-05-25T20:00:00', location: 'New York', attendees: [1, 5] },
        { id: 4, title: 'Blockchain Workshop', date: '2024-06-01T18:00:00', location: 'San Francisco', attendees: [2, 4] },
        { id: 5, title: 'AI and Ethics', date: '2024-06-05T19:00:00', location: 'Online', attendees: [3, 5] }
      ];
      setEvents(data);
    } catch (e) {
      // ignore for now
    } finally {
      setEventsLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    // Placeholder for joining event
  };

  const handleLeaveEvent = async (eventId) => {
    // Placeholder for leaving event
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
            variant="ghost"
            onClick={() => navigate('/events')}
            className="text-gray-600 hover:text-red-600"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Events
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
                  {/* Role and Status Badges */}
                  <div className="flex justify-center gap-2 mt-2">
                    {user.role && <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Award className="h-3 w-3 mr-1" />{user.role}</span>}
                    {user.status && <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><BadgeCheck className="h-3 w-3 mr-1" />{user.status}</span>}
                  </div>
                  {/* Major and Department */}
                  <div className="flex flex-col items-center mt-2">
                    {user.major && <span className="text-sm text-gray-600"><Briefcase className="h-4 w-4 inline mr-1" />{user.major}</span>}
                    {user.department && <span className="text-sm text-gray-600"><School className="h-4 w-4 inline mr-1" />{user.department}</span>}
                  </div>
                  {/* Portfolio Links */}
                  {user.portfolio_links && user.portfolio_links.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-gray-500 mb-1">Portfolio</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {user.portfolio_links.map((link, idx) => (
                          <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs hover:underline"><LinkIcon className="h-3 w-3 mr-1" />{link.replace(/^https?:\/\//, '').slice(0, 20)}...</a>
                        ))}
                      </div>
                    </div>
                  )}
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
            <div className="mb-6 p-4 bg-white rounded-lg shadow flex flex-wrap gap-4 items-center">
              <input type="text" name="major" value={filters.major} onChange={handleFilterChange} placeholder="Filter by major" className="border rounded px-2 py-1 text-sm" />
              <input type="text" name="department" value={filters.department} onChange={handleFilterChange} placeholder="Department" className="border rounded px-2 py-1 text-sm" />
              <select name="role" value={filters.role} onChange={handleFilterChange} className="border rounded px-2 py-1 text-sm">
                <option value="">Role</option>
                <option value="Founder">Founder</option>
                <option value="Co-founder">Co-founder</option>
                <option value="Mentor">Mentor</option>
                <option value="Investor">Investor</option>
                <option value="Looking for Team">Looking for Team</option>
              </select>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="border rounded px-2 py-1 text-sm">
                <option value="">Status</option>
                <option value="Active">Active</option>
                <option value="Looking">Looking</option>
                <option value="Open to Ideas">Open to Ideas</option>
              </select>
              <input type="text" name="skill" value={filters.skill} onChange={handleFilterChange} placeholder="Skill" className="border rounded px-2 py-1 text-sm" />
              <input type="text" name="interest" value={filters.interest} onChange={handleFilterChange} placeholder="Interest" className="border rounded px-2 py-1 text-sm" />
              <button onClick={() => setFilters({ major: '', department: '', role: '', status: '', skill: '', interest: '' })} className="ml-2 text-xs text-red-500 underline">Clear</button>
            </div>
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
                          {/* Role and Status Badges */}
                          <div className="flex justify-center gap-2 mb-2">
                            {match.role && <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Award className="h-3 w-3 mr-1" />{match.role}</span>}
                            {match.status && <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><BadgeCheck className="h-3 w-3 mr-1" />{match.status}</span>}
                        </div>
                          {/* Major and Department */}
                          <div className="flex flex-col items-center mb-2">
                            {match.major && <span className="text-xs text-gray-600"><Briefcase className="h-3 w-3 inline mr-1" />{match.major}</span>}
                            {match.department && <span className="text-xs text-gray-600"><School className="h-3 w-3 inline mr-1" />{match.department}</span>}
                          </div>
                          <div className="inline-flex items-center bg-red-100 text-red-600 rounded-full px-3 py-1 text-sm">{match.matchScore}% Match</div>
                          {/* Portfolio Links */}
                          {match.portfolio_links && match.portfolio_links.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {match.portfolio_links.map((link, idx) => (
                                  <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs hover:underline"><LinkIcon className="h-3 w-3 mr-1" />{link.replace(/^https?:\/\//, '').slice(0, 16)}...</a>
                                ))}
                              </div>
                          </div>
                        )}
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

      {eventsLoading ? null : events && events.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-2">Upcoming Events</h3>
              {events.slice(0, 2).map(event => {
                const joined = event.attendees?.includes(user.id);
                return (
                  <div key={event.id} className="mb-2">
                    <span className="font-semibold">{event.title}</span> &mdash; {new Date(event.date).toLocaleString()}<br />
                    <span className="text-xs text-gray-500">{event.location}</span>
                    {joined ? (
                      <Button size="sm" variant="outline" className="ml-2" onClick={() => handleLeaveEvent(event.id)}>Leave</Button>
                    ) : (
                      <Button size="sm" variant="default" className="ml-2" onClick={() => handleJoinEvent(event.id)}>Join</Button>
                    )}
                  </div>
                );
              })}
            </div>
            <Button variant="link" onClick={() => navigate('/events')}>See all events</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
