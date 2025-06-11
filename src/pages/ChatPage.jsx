import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, getMessages, sendMessage } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Send, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('chat-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${user.id},receiver_id=eq.${receiverId}`,
      }, handleNewMessage)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${receiverId},receiver_id=eq.${user.id}`,
      }, handleNewMessage)
      .subscribe();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [user, receiverId]);

  const loadMessages = async (reset = false) => {
    if (!user || !receiverId) return;

    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const { messages: newMessages, hasMore: moreMessages } = await getMessages(user.id, receiverId, currentPage);

      setMessages(prev => reset ? newMessages : [...prev, ...newMessages]);
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
    setMessages(prev => [...prev, {
      ...newMsg,
      sender_name: newMsg.sender_id === user.id ? user.name : receiverProfile?.name,
      receiver_name: newMsg.receiver_id === user.id ? user.name : receiverProfile?.name
    }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const message = await sendMessage(user.id, receiverId, newMessage.trim());
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user || !receiverProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
          <h2 className="text-lg font-semibold">
            {receiverProfile.name || 'Chat'}
          </h2>
          <p className="text-sm text-gray-500">
            {receiverProfile.university || 'No university listed'}
          </p>
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

            {messages.map((message, index) => (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === user.id
                      ? 'bg-red-500 text-white'
                      : 'bg-white shadow-md'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 bg-white shadow-lg">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="gradient-bg text-white"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
