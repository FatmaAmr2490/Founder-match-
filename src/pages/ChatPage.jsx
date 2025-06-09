import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Users, MessageSquare, Send, ArrowLeft, Search, UserCircle2, Trash2, CornerDownLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { currentUser, logout } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(location.state?.selectedUserId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadContacts();
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [currentUser, selectedUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUserId]);

  const loadContacts = () => {
    try {
      // Sample contacts for demo
      const sampleContacts = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          lastMessage: 'Hey, would love to connect!',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          lastMessage: 'Great idea! Let\'s discuss more.',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          lastMessage: 'Thanks for reaching out!',
          timestamp: new Date().toISOString()
        }
      ];
      setContacts(sampleContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadMessages = (userId) => {
    try {
      const storedChats = JSON.parse(localStorage.getItem(`founderMatchChats_${currentUser.id}`) || '{}');
      const chatMessages = storedChats[userId] || [];
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      const message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender_id: currentUser.id,
        receiver_id: selectedUserId,
        created_at: new Date().toISOString()
      };

      // Store message in localStorage
      const storedChats = JSON.parse(localStorage.getItem(`founderMatchChats_${currentUser.id}`) || '{}');
      if (!storedChats[selectedUserId]) {
        storedChats[selectedUserId] = [];
      }
      storedChats[selectedUserId].push(message);
      localStorage.setItem(`founderMatchChats_${currentUser.id}`, JSON.stringify(storedChats));

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const selectContact = (userId) => {
    setSelectedUserId(userId);
    loadMessages(userId);
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      // Delete all messages in the conversation
      const storedChats = JSON.parse(localStorage.getItem(`founderMatchChats_${currentUser.id}`) || '{}');
      const updatedChats = { ...storedChats };
      delete updatedChats[conversationId];
      localStorage.setItem(`founderMatchChats_${currentUser.id}`, JSON.stringify(updatedChats));

      if (selectedUserId === conversationId) {
        setSelectedUserId(null);
      }

      toast({
        title: 'Conversation Deleted',
        description: 'The chat history has been removed.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <motion.header 
        className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-gray-100 sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <div className="flex items-center">
          <MessageSquare className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">Your Chats</span>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with conversation list */}
        <motion.aside 
          className={cn(
            "w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white p-4 flex flex-col transition-all duration-300 ease-in-out",
            selectedUserId && "hidden md:flex" 
          )}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredContacts.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet.</p>
                <p className="text-sm">Start a chat from a user's profile.</p>
              </div>
            )}
            {filteredContacts.map(contact => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={cn(
                    "p-3 hover:bg-red-50 cursor-pointer transition-colors",
                    selectedUserId === contact.id && "bg-red-100 border-red-300"
                  )}
                  onClick={() => selectContact(contact.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-red-500 font-semibold">
                         {contact.name.substring(0, 2)}
                       </div>
                       <div>
                         <p className="font-semibold text-sm">{contact.name}</p>
                         <p className="text-xs text-gray-500 truncate max-w-[150px]">
                           {contact.lastMessage}
                         </p>
                       </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-red-500 h-7 w-7" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteConversation(contact.id); }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.aside>

        {/* Main chat area */}
        <motion.main 
          className={cn(
            "flex-1 flex flex-col bg-gray-50 transition-all duration-300 ease-in-out",
            !selectedUserId && "hidden md:flex md:items-center md:justify-center" 
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3 sticky top-16 md:top-0 z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden" 
                  onClick={() => setSelectedUserId(null)}
                >
                  <CornerDownLeft className="h-5 w-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-red-500 font-semibold">
                  {selectedUserId.substring(0, 2)}
                </div>
                <h2 className="text-lg font-semibold">{selectedUserId}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.sender_id === currentUser.id ? "justify-end" : "justify-start"
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div 
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow",
                        msg.sender_id === currentUser.id 
                          ? "bg-red-500 text-white rounded-br-none" 
                          : "bg-white text-gray-800 rounded-bl-none border"
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.sender_id === currentUser.id ? "text-red-200" : "text-gray-400",
                        "text-right"
                      )}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                 {messages.length === 0 && (
                    <div className="text-center text-gray-400 pt-10">
                        <MessageSquare size={48} className="mx-auto mb-2 opacity-50"/>
                        <p>No messages in this conversation yet.</p>
                        <p className="text-sm">Send a message to start chatting!</p>
                    </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
                <div className="flex items-center space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    className="flex-1 resize-none"
                    rows={1}
                  />
                  <Button 
                    onClick={sendMessage} 
                    className="gradient-bg text-white"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <MessageSquare className="h-24 w-24 mx-auto mb-4 opacity-30" />
              <p className="text-xl">Select a conversation to start chatting</p>
              <p className="text-sm">or find a new match on your dashboard.</p>
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
};

export default ChatPage;
