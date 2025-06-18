import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Send, ArrowLeft, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import HelpCenter from '@/components/ui/help-center';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const LOCAL_MESSAGES_KEY = 'founderMatchMessages';
const LOCAL_USERS_KEY = 'founderMatchUsers';

const ChatPage = () => {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [receiverProfile, setReceiverProfile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies] = useState(['👍', 'Thanks!', '😊', "Let's connect!"]);
  const [uploading, setUploading] = useState(false);

  // Fetch receiver profile from localStorage
  useEffect(() => {
    if (!user || !receiverId) return;
    setLoading(true);
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const found = users.find(u => String(u.id) === String(receiverId));
    setReceiverProfile(found || { name: 'User', university: '' });
    setLoading(false);
  }, [user, receiverId]);

  // Load messages from localStorage
  useEffect(() => {
    if (!user || !receiverId) return;
    setLoading(true);
    const allMessages = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '[]');
    const chatMessages = allMessages.filter(
      m =>
        (String(m.sender_id) === String(user.id) && String(m.receiver_id) === String(receiverId)) ||
        (String(m.sender_id) === String(receiverId) && String(m.receiver_id) === String(user.id))
    );
    setMessages(chatMessages);
    setLoading(false);
  }, [user, receiverId]);

  // Save message to localStorage
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const allMessages = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '[]');
    const msg = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: receiverId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };
    const updatedMessages = [...allMessages, msg];
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updatedMessages));
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  // Typing indicator logic (simple demo)
  let typingTimeout;
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    setIsTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => setIsTyping(false), 1500);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by sender
  const groupMessages = (messages) => {
    const groups = [];
    let lastSender = null;
    let currentGroup = null;
    messages.forEach((msg, idx) => {
      if (msg.sender_id !== lastSender) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { sender_id: msg.sender_id, messages: [msg] };
        lastSender = msg.sender_id;
      } else {
        currentGroup.messages.push(msg);
      }
      if (idx === messages.length - 1 && currentGroup) {
        groups.push(currentGroup);
      }
    });
    return groups;
  };

  if (!user || !receiverProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Help Center at the very top */}
      <div className="sticky top-0 z-40 bg-gray-50">
        <HelpCenter />
      </div>
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="mr-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">{receiverProfile.name || 'Chat'}</h2>
          <p className="text-sm text-gray-500">{receiverProfile.university || 'No university listed'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {groupMessages(messages).map((group, idx) => {
              const isCurrentUser = String(group.sender_id) === String(user.id);
              const senderProfile = isCurrentUser ? user : receiverProfile;
              const avatarLetter = senderProfile?.name ? senderProfile.name.charAt(0).toUpperCase() : 'U';
              return (
                <div key={idx} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center mb-1 gap-2">
                    {!isCurrentUser && (
                      <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-lg">
                        {avatarLetter}
                      </div>
                    )}
                    <span className="font-semibold text-xs text-gray-500">
                      {isCurrentUser ? 'You' : senderProfile?.name || 'User'}
                    </span>
                  </div>
                  {group.messages.map((message, mIdx) => (
                    <motion.div
                      key={message.id || mIdx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`max-w-[70%] rounded-lg p-3 mb-1 ${
                        isCurrentUser
                          ? 'bg-red-500 text-white self-end'
                          : 'bg-white shadow-md self-start'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {dayjs(message.created_at).fromNow()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              );
            })}
            {isTyping && (
              <div className="flex items-center gap-2 mt-2 text-gray-400 text-xs">
                <span className="animate-pulse">{receiverProfile?.name || 'User'} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Replies */}
      <div className="flex gap-2 px-4 pb-2">
        {quickReplies.map((reply, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="rounded-full px-3"
            onClick={() => setNewMessage(reply)}
          >
            {reply}
          </Button>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 bg-white flex space-x-2 items-center border-t relative">
        <Input
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1"
          disabled={uploading}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSend(e);
            }
          }}
        />
        <Button type="submit" disabled={uploading || !newMessage.trim()} className="p-2">
          <Send className="h-6 w-6" />
        </Button>
      </form>
    </div>
  );
};

export default ChatPage;
