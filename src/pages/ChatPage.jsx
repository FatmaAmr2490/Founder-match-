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
import { getMessages, sendMessage, subscribeToMessages, getProfiles, deleteConversation } from '@/lib/supabase';

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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const messagesEndRef = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const chatContainerRef = useRef(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadContacts();
    
    // Subscribe to new messages
    const subscription = subscribeToMessages(currentUser.id, (payload) => {
      const newMessage = payload.new;
      if (newMessage.sender_id === selectedUserId || newMessage.receiver_id === selectedUserId) {
        setMessages(prev => [...prev, {
          ...newMessage,
          sender_name: contacts.find(c => c.id === newMessage.sender_id)?.name || 'Unknown User',
          receiver_name: contacts.find(c => c.id === newMessage.receiver_id)?.name || 'Unknown User'
        }]);
      }
      // Update last message in contacts
      setContacts(prev => prev.map(contact => {
        if (contact.id === newMessage.sender_id) {
          return {
            ...contact,
            lastMessage: newMessage.content,
            lastMessageTime: newMessage.created_at
          };
        }
        return contact;
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, selectedUserId, contacts]);

  useEffect(() => {
    if (selectedUserId) {
      setPage(1);
      setHasMore(true);
      setMessages([]);
      loadMessages(selectedUserId, 1, true);
    }
  }, [selectedUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      const profiles = await getProfiles();
      // Filter out current user and get only matched users
      const matchedProfiles = profiles.filter(profile => 
        profile.id !== currentUser.id && 
        !profile.is_admin
      );
      
      setContacts(matchedProfiles.map(profile => ({
        id: profile.id,
        name: profile.name || profile.email,
        email: profile.email,
        lastMessage: '',
        timestamp: new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadMessages = async (userId, pageNum, isNewChat = false) => {
    try {
      setLoadingMessages(true);
      const { messages: messageData, hasMore: more } = await getMessages(currentUser.id, userId, pageNum);
      
      if (pageNum === 1) {
        setMessages(messageData);
      } else {
        setMessages(prev => [...messageData, ...prev]);
      }
      
      setHasMore(more);
      setPage(pageNum);

      // If this is a new chat, scroll to bottom after messages load
      if (isNewChat) {
        setTimeout(() => {
          scrollToBottom();
          setInitialScrollDone(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingMessages(false);
      setIsLoadingMore(false);
    }
  };

  const handleScroll = async (e) => {
    if (!initialScrollDone) return;
    
    const element = e.target;
    if (element.scrollTop === 0 && hasMore && !isLoadingMore && !loadingMessages) {
      setIsLoadingMore(true);
      await loadMessages(selectedUserId, page + 1);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      await sendMessage(currentUser.id, selectedUserId, newMessage.trim());
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

  const selectContact = (contact) => {
    setSelectedUserId(contact.id);
    setSelectedContact(contact);
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(currentUser.id, conversationId);

      if (selectedUserId === conversationId) {
        setSelectedUserId(null);
        setMessages([]);
      }

      toast({
        title: 'Conversation Deleted',
        description: 'The chat history has been removed.',
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
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                  onClick={() => selectContact(contact)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-red-500 font-semibold">
                        {contact.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{contact.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {contact.lastMessage || 'No messages yet'}
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
          {selectedUserId && selectedContact ? (
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
                  {selectedContact.name.substring(0, 2).toUpperCase()}
                </div>
                <h2 className="text-lg font-semibold">{selectedContact.name}</h2>
              </div>
              
              {/* Messages area */}
              <div 
                className="flex-1 overflow-y-auto p-6 space-y-4"
                ref={chatContainerRef}
                onScroll={handleScroll}
              >
                {isLoadingMore && (
                  <div className="text-center py-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading more messages...</span>
                  </div>
                )}
                {messages.map((msg) => (
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
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    className="flex-1 resize-none"
                    rows={1}
                  />
                  <Button 
                    type="submit"
                    className="gradient-bg text-white"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
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
