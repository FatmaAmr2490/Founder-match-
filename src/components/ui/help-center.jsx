import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HelpCircle, X, Send, Bot, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  }
];

const HelpCenter = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredQuestions = commonQuestions.filter(q =>
    q.q.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = inputValue.trim();
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setInputValue('');

      // First, check if the question matches any common questions
      const matchingQuestion = commonQuestions.find(q => 
        q.q.toLowerCase().includes(userMessage.toLowerCase()) ||
        userMessage.toLowerCase().includes(q.q.toLowerCase())
      );

      if (matchingQuestion) {
        // If there's a matching pre-defined question, use its answer
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: matchingQuestion.a }]);
          setIsLoading(false);
        }, 500);
        return;
      }

      // If no matching question, use the open-source AI model
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: {
              text: `You are a helpful assistant for FounderMatch, a platform that helps entrepreneurs find co-founders. 
              Please provide a helpful answer about ${userMessage}. 
              Keep the response focused on entrepreneurship, co-founder matching, and startup-related topics.`,
              max_length: 150
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      let aiMessage = data.generated_text || data[0]?.generated_text;

      // Clean up the response
      aiMessage = aiMessage
        .replace(/^(bot:|human:|assistant:|user:)/gi, '')
        .trim();

      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try asking one of the common questions above.",
        variant: "destructive"
      });
      // Fallback to a generic response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting to the AI service right now. Please try asking one of the common questions above or try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
                    AI Help Center
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
                          placeholder="Search common questions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {searchTerm && (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
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
                      )}

                      <div className="h-[300px] overflow-y-auto border rounded-lg p-4 space-y-4">
                        {messages.map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {message.content}
                            </div>
                          </motion.div>
                        ))}
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                          </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Ask any question..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1"
                            disabled={isLoading}
                          />
                          <Button 
                            className="gradient-bg text-white"
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputValue.trim()}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Type your question or search common topics above
                        </p>
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