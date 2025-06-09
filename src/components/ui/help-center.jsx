import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HelpCircle, X, Search, Bot } from 'lucide-react';

const commonQuestions = [
  {
    q: "How do I find the right co-founder?",
    a: "Focus on complementary skills, shared values, and vision alignment. Use our matching algorithm to find potential co-founders with compatible skills and interests."
  },
  {
    q: "What makes a good founder profile?",
    a: "A strong profile includes detailed skills, clear goals, industry interests, and availability. Be specific about what you bring to the table and what you're looking for in a co-founder."
  },
  {
    q: "How does the matching system work?",
    a: "Our algorithm considers multiple factors including skills compatibility, shared interests, experience level, and availability to suggest potential matches."
  },
  {
    q: "Tips for reaching out to potential co-founders?",
    a: "Be professional, specific about why you're interested in connecting, and highlight potential synergies. Share your vision and ask thoughtful questions about their experience and goals."
  },
  {
    q: "What are the key elements of a successful startup?",
    a: "Key elements include a strong team, a clear value proposition, a large addressable market, a scalable business model, and effective execution."
  },
  {
    q: "How to validate my startup idea?",
    a: "Validate your idea by conducting market research, creating a Minimum Viable Product (MVP), gathering user feedback, and iterating based on that feedback. Talk to potential customers early and often."
  },
  {
    q: "Common mistakes to avoid when starting a business?",
    a: "Avoid mistakes like not doing enough market research, underestimating capital needs, hiring too quickly or poorly, lacking a clear business plan, and ignoring customer feedback."
  },
  {
    q: "Resources for early-stage founders?",
    a: "Look for resources like startup incubators/accelerators, mentorship programs, online courses, industry blogs, networking events, and government grants or support schemes."
  },
  {
    q: "How to write a compelling founder bio?",
    a: "Focus on your unique experiences, skills, and achievements. Highlight your passion for entrepreneurship, relevant industry expertise, and what drives you to build a startup."
  },
  {
    q: "What should I look for in a co-founder?",
    a: "Look for complementary skills, shared values, commitment level, communication style, and problem-solving abilities. Ensure your potential co-founder shares your vision and work ethic."
  },
  {
    q: "How to prepare for co-founder meetings?",
    a: "Research their background, prepare specific questions about their experience and goals, be clear about your own vision and expectations, and be ready to discuss potential roles and responsibilities."
  },
  {
    q: "What makes a strong startup team?",
    a: "A strong startup team has diverse skills, clear communication, shared values, mutual respect, adaptability, and a commitment to the company's mission and vision."
  }
];

const HelpCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const filteredQuestions = commonQuestions.filter(q =>
    q.q.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          className="w-14 h-14 rounded-full gradient-bg text-white shadow-xl hover:shadow-2xl"
          onClick={() => setIsOpen(true)}
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Help Center Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Help Center Card */}
            <motion.div
              className="fixed bottom-24 right-6 w-full max-w-md z-50"
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Card className="shadow-2xl border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center">
                    <Bot className="w-6 h-6 text-red-600 mr-2" />
                    Help Center
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {selectedQuestion ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <Button
                        variant="ghost"
                        className="mb-2"
                        onClick={() => setSelectedQuestion(null)}
                      >
                        ← Back to questions
                      </Button>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">{selectedQuestion.q}</h3>
                        <p className="text-gray-600">{selectedQuestion.a}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search help topics..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {filteredQuestions.map((q, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-3 px-4"
                              onClick={() => setSelectedQuestion(q)}
                            >
                              <span className="line-clamp-2">{q.q}</span>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpCenter;