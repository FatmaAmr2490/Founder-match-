import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Users, MessageSquare, Send, ArrowLeft, Search, UserCircle2, Trash2, CornerDownLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, loading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (loading || !currentUser) return;

    const storedConversations = JSON.parse(localStorage.getItem(`founderMatchChats_${currentUser.id}`) || '{}');
    
    const allUsers = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
    
    const formattedConversations = Object.entries(storedConversations).map(([otherUserId, messages]) => {
      const otherUser = allUsers.find(u => u.id === otherUserId);
      return {
        id: otherUserId,
        name: otherUser ? otherUser.name : 'Unknown User',
        avatarFallback: otherUser ? otherUser.name.charAt(0).toUpperCase() : 'U',
        messages: messages,
        lastMessage: messages.length > 0 ? messages[messages.length - 1] : { text: 'No messages yet', timestamp: '' },
      };
    }).sort((a, b) => new Date(b.lastMessage.timestamp || 0) - new Date(a.lastMessage.timestamp || 0));

    setConversations(formattedConversations);
  }, [currentUser, loading]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return { ...conv, messages: [...conv.messages, message], lastMessage: message };
      }
      return conv;
    });
    setConversations(updatedConversations.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)));
    
    const storedChats = JSON.parse(localStorage.getItem(`founderMatchChats_${currentUser.id}`) || '{}');
    const currentChatHistory = storedChats[selectedConversation.id] || [];
    storedChats[selectedConversation.id] = [...currentChatHistory, message];
    localStorage.setItem(`founderMatchChats_${currentUser.id}`, JSON.stringify(storedChats));

    // Simulate receiving a reply for demo purposes
    setTimeout(() => {
      const replyMessage = {
        id: (Date.now() + 1).toString(),
        text: `Thanks for your message! I'll get back to you.`,
        senderId: selectedConversation.id,
        timestamp: new Date().toISOString(),
      };
       const updatedConversationsWithReply = updatedConversations.map(conv => {
        if (conv.id === selectedConversation.id) {
          return { ...conv, messages: [...conv.messages, replyMessage], lastMessage: replyMessage };
        }
        return conv;
      });
      setConversations(updatedConversationsWithReply.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)));
      
      const storedChatsReply = JSON.parse(localStorage.getItem(`founderMatchChats_${currentUser.id}`) || '{}');
      const currentChatHistoryReply = storedChatsReply[selectedConversation.id] || [];
      storedChatsReply[selectedConversation.id] = [...currentChatHistoryReply, replyMessage];
      localStorage.setItem(`founderMatchChats_${currentUser.id}`, JSON.stringify(storedChatsReply));
      
      setSelectedConversation(prev => prev ? {...prev, messages: [...prev.messages, replyMessage]} : null);

    }, 1500);


    setNewMessage('');
    toast({
      title: 'Message Sent!',
      description: `Your message to ${selectedConversation.name} has been sent.`,
    });
  };

  const handleDeleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);

    const storedChats = JSON.parse(localStorage.getItem(`founderMatchChats_${currentUser.id}`) || '{}');
    delete storedChats[conversationId];
    localStorage.setItem(`founderMatchChats_${currentUser.id}`, JSON.stringify(storedChats));

    if (selectedConversation && selectedConversation.id === conversationId) {
      setSelectedConversation(null);
    }
    toast({
      title: 'Conversation Deleted',
      description: 'The chat history has been removed.',
      variant: 'destructive',
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !currentUser) {
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
            selectedConversation && "hidden md:flex" 
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
            {filteredConversations.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet.</p>
                <p className="text-sm">Start a chat from a user's profile.</p>
              </div>
            )}
            {filteredConversations.map(conv => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={cn(
                    "p-3 hover:bg-red-50 cursor-pointer transition-colors",
                    selectedConversation?.id === conv.id && "bg-red-100 border-red-300"
                  )}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-red-500 font-semibold">
                         {conv.avatarFallback}
                       </div>
                       <div>
                         <p className="font-semibold text-sm">{conv.name}</p>
                         <p className="text-xs text-gray-500 truncate max-w-[150px]">
                           {conv.lastMessage.senderId === currentUser.id ? "You: " : ""}
                           {conv.lastMessage.text}
                         </p>
                       </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-red-500 h-7 w-7" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
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
            !selectedConversation && "hidden md:flex md:items-center md:justify-center" 
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3 sticky top-16 md:top-0 z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden" 
                  onClick={() => setSelectedConversation(null)}
                >
                  <CornerDownLeft className="h-5 w-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-red-500 font-semibold">
                  {selectedConversation.avatarFallback}
                </div>
                <h2 className="text-lg font-semibold">{selectedConversation.name}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedConversation.messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.senderId === currentUser.id ? "justify-end" : "justify-start"
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div 
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow",
                        msg.senderId === currentUser.id 
                          ? "bg-red-500 text-white rounded-br-none" 
                          : "bg-white text-gray-800 rounded-bl-none border"
                      )}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.senderId === currentUser.id ? "text-red-200" : "text-gray-400",
                        "text-right"
                      )}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                 {selectedConversation.messages.length === 0 && (
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
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 resize-none"
                    rows={1}
                  />
                  <Button 
                    onClick={handleSendMessage} 
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