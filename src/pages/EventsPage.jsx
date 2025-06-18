import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getEvents, joinEvent, leaveEvent, createEvent } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';

const EventsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not load events.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleJoin = async (eventId) => {
    try {
      await joinEvent(eventId, user.id);
      fetchEvents();
    } catch (error) {
      toast({ title: 'Error', description: 'Could not join event.', variant: 'destructive' });
    }
  };

  const handleLeave = async (eventId) => {
    try {
      await leaveEvent(eventId, user.id);
      fetchEvents();
    } catch (error) {
      toast({ title: 'Error', description: 'Could not leave event.', variant: 'destructive' });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createEvent({
        ...form,
        date: new Date(form.date),
        created_by: user.id,
        attendees: [user.id]
      });
      setShowCreate(false);
      setForm({ title: '', description: '', date: '', location: '' });
      fetchEvents();
      toast({ title: 'Event created!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not create event.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const isAdminOrMentor = user?.role === 'admin' || user?.role === 'mentor';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Events & Meetups</h1>
          {isAdminOrMentor && (
            <Button onClick={() => setShowCreate((v) => !v)} variant="outline">
              <Plus className="h-4 w-4 mr-1" /> New Event
            </Button>
          )}
        </div>
        {showCreate && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  placeholder="Event Title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Location (e.g., GUC Campus, Online)"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
                <Button type="submit" disabled={creating} className="w-full gradient-bg text-white">
                  {creating ? 'Creating...' : 'Create Event'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No events yet.</div>
        ) : (
          <div className="space-y-6">
            {events.map(event => {
              const joined = event.attendees?.includes(user.id);
              return (
                <Card key={event.id} className="shadow border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold mb-1">{event.title}</h2>
                        <div className="flex items-center gap-3 text-gray-500 text-sm mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(event.date).toLocaleString()}
                          <MapPin className="h-4 w-4 ml-4 mr-1" />
                          {event.location}
                        </div>
                        <p className="mb-2 text-gray-700">{event.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {event.attendees?.length || 0} attending
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        {joined ? (
                          <Button variant="outline" onClick={() => handleLeave(event.id)}>
                            Leave Event
                          </Button>
                        ) : (
                          <Button variant="default" onClick={() => handleJoin(event.id)}>
                            Join Event
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage; 