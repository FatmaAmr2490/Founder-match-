import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, getMessages, sendMessage, uploadFileToStorage } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Send, ArrowLeft, Smile, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import HelpCenter from '@/components/ui/help-center';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
dayjs.extend(relativeTime);

const ChatPage = () => {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [receiverProfile, setReceiverProfile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies] = useState(['��', 'Thanks!', '😊', "Let's connect!"]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || !receiverId) return;

    const fetchReceiverProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', receiverId)
          .single();

        if (error) throw error;
        setReceiverProfile(data);
      } catch (error) {
        console.error('Error fetching receiver profile:', error);
        toast({
          title: 'Error',
          description: 'Could not load contact information.',
          variant: 'destructive',
        });
      }
    };

    fetchReceiverProfile();
    loadMessages(true);

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === user.id && msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId && msg.receiver_id === user.id)
          ) {
            handleNewMessage(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, receiverId]);

  const loadMessages = async (reset = false) => {
    if (!user || !receiverId) return;

    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const { messages: newMessages, hasMore: moreMessages } = await getMessages(
        user.id,
        receiverId,
        currentPage
      );

      if (reset) {
        setMessages(newMessages);
      } else {
        setMessages((prev) => [...prev, ...newMessages]);
      }

      setHasMore(moreMessages);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Could not load messages. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (payload) => {
    const newMsg = payload.new;
    if (!newMsg) return;

    setMessages((prev) => {
      const exists = prev.some((msg) => msg.id === newMsg.id);
      if (exists) return prev;

      return [
        ...prev,
        {
          ...newMsg,
          sender_name: newMsg.sender_id === user.id ? 'You' : receiverProfile?.name || 'User',
          receiver_name: newMsg.receiver_id === user.id ? 'You' : receiverProfile?.name || 'User',
        },
      ];
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(user.id, receiverId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    toast({
        title: 'Error',
        description: 'Could not send message. Please try again.',
      variant: 'destructive',
    });
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFileToStorage(file, user.id);
      // Send as image or file message
      let content = url;
      if (file.type.startsWith('image/')) {
        content = `[image]${url}`;
      }
      await sendMessage(user.id, receiverId, content);
      toast({ title: 'File sent!' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper for grouping messages
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

  // Typing indicator logic (simple demo)
  let typingTimeout;
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    setIsTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => setIsTyping(false), 1500);
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
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => loadMessages()}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
            {/* Grouped messages with avatars */}
            {groupMessages(messages).map((group, idx) => {
              const isCurrentUser = group.sender_id === user.id;
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
                  {group.messages.map((message, mIdx) => {
                    let isImage = false;
                    let fileUrl = '';
                    if (message.content.startsWith('[image]')) {
                      isImage = true;
                      fileUrl = message.content.replace('[image]', '');
                    } else if (/^https?:\/\//.test(message.content) && (message.content.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
                      isImage = true;
                      fileUrl = message.content;
                    } else if (/^https?:\/\//.test(message.content)) {
                      fileUrl = message.content;
                    }
                    return (
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
                        {isImage ? (
                          <img src={fileUrl} alt="sent file" className="rounded-lg max-w-xs max-h-60 mb-2" />
                        ) : fileUrl ? (
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 break-all">Download file</a>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        <span className="text-xs opacity-70 mt-1 block">
                          {dayjs(message.created_at).fromNow()}
                        </span>
                      </motion.div>
                    );
                  })}
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

      {/* Message Input with Emoji Picker and Upload */}
      <form onSubmit={handleSend} className="p-4 bg-white flex space-x-2 items-center border-t relative">
        <Button
          type="button"
          variant="ghost"
          className="p-2"
          onClick={() => setShowEmojiPicker((v) => !v)}
        >
          <Smile className="h-6 w-6 text-gray-400" />
        </Button>
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 bg-white border rounded-lg shadow-lg p-2 z-50">
            <Picker
              onEmojiSelect={emoji => setNewMessage(newMessage + emoji.native)}
              theme="light"
              perLine={8}
              emojiSize={24}
              showPreview={false}
              showSkinTones={false}
            />
          </div>
        )}
        {/* Upload button */}
        <label className="p-2 cursor-pointer">
          <input type="file" accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar" className="hidden" onChange={handleFileChange} disabled={uploading} />
          <Paperclip className={`h-6 w-6 text-gray-400 ${uploading ? 'animate-pulse' : ''}`} />
        </label>
        <Input
          value={newMessage}
          onChange={handleInputChange}
          placeholder={uploading ? 'Uploading file...' : 'Type your message...'}
          className="flex-1"
          disabled={sending || uploading}
        />
        <Button 
          type="submit"
          disabled={!newMessage.trim() || sending || uploading}
          className="gradient-bg text-white"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatPage;
