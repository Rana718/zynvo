'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle, XCircle, Mail, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventAttendee {
  id: string;
  name: string;
  email: string;
  course: string;
  year: string;
  joinedAt: string;
  status: string;
}

interface EventDetails {
  id: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  description: string;
  totalAttendees: number;
  attendees: EventAttendee[];
}

export default function EventDetailsPage() {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          router.push('/auth/signin');
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEvent((response.data as { event: EventDetails }).event);
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error('Access denied. Admin only.');
          router.push('/dashboard');
        } else if (error.response?.status === 404) {
          toast.error('Event not found');
          router.push('/admin');
        } else {
          toast.error('Failed to fetch event details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg text-white">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg text-white">Event not found</div>
      </div>
    );
  }

  const confirmedAttendees = event.attendees.filter(a => a.status === 'confirmed').length;
  const pendingAttendees = event.attendees.filter(a => a.status === 'pending').length;

  return (
    <div className="text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {event.name}
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Event details and attendee management</p>
        </div>

        {/* Event Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400">Date</span>
            </div>
            <div className="text-xl font-bold text-white">{event.date}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400">Venue</span>
            </div>
            <div className="text-xl font-bold text-white">{event.venue}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400">Total Attendees</span>
            </div>
            <div className="text-xl font-bold text-yellow-400">{event.totalAttendees}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Confirmed</span>
            </div>
            <div className="text-xl font-bold text-green-400">{confirmedAttendees}</div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Event Information</h2>
            <Badge variant="secondary" className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              {event.type}
            </Badge>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">{event.description}</p>
        </div>

        {/* Attendance Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Attendance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{event.totalAttendees}</div>
              <div className="text-gray-400">Total Registered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{confirmedAttendees}</div>
              <div className="text-gray-400">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">{pendingAttendees}</div>
              <div className="text-gray-400">Pending</div>
            </div>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" />
              Event Attendees ({event.totalAttendees})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Attendee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Registration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {event.attendees.map((attendee, index) => (
                  <tr key={attendee.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold">
                          {attendee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{attendee.name}</div>
                          <div className="text-sm text-gray-400">Attendee #{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="w-4 h-4" />
                        {attendee.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-white">
                          <GraduationCap className="w-4 h-4" />
                          {attendee.course}
                        </div>
                        <div className="text-sm text-gray-400">Year: {attendee.year}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {attendee.joinedAt}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          attendee.status === 'confirmed'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }
                      >
                        {attendee.status === 'confirmed' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {attendee.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-self-end items-center">
          <div className="text-sm text-gray-400">
            Event ID: {event.id}
          </div>
        </div>
      </div>
    </div>
  );
}
