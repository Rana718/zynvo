'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Settings, Users, Mail, Calendar, CheckCircle, XCircle, Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ClubMember {
  id: string;
  name: string;
  email: string;
  collegeName: string;
  bio: string;
  course: string;
  year: string;
  tags: string[];
  twitter: string;
  linkedin: string;
  instagram: string;
  createdAt: string;
  isVerified: boolean;
}

interface ClubData {
  clubName: string;
  totalMembers: number;
  members: ClubMember[];
}

interface EventAttendee {
  id: string;
  name: string;
  email: string;
  course: string;
  year: string;
  joinedAt: string;
  status: string;
}

interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  description: string;
  totalAttendees: number;
  attendees?: EventAttendee[];
}

interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  course: string;
  year: string;
  collegeName: string;
  submittedAt: string;
  idImage: string;
  status: string;
}

interface VerificationsData {
  clubName: string;
  totalPending: number;
  verifications: VerificationRequest[];
}

interface EventsData {
  clubName: string;
  totalEvents: number;
  events: Event[];
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'verifications'>('events');
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [verificationsData, setVerificationsData] = useState<VerificationsData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          router.push('/auth/signin');
          return;
        }

        // Fetch events data
        const eventsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/events`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEventsData(eventsResponse.data as EventsData);

        // Fetch verifications data
        const verificationsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/verifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVerificationsData(verificationsResponse.data as VerificationsData);

        // Fetch club members data
        const membersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/clubMembers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClubData(membersResponse.data as ClubData);

      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error('Access denied. Only club founders can access this page.');
          router.push('/dashboard');
        } else {
          toast.error('Failed to fetch data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCreateEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/events`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success('Event created successfully!');
      
      // Refresh events data
      const eventsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEventsData(eventsResponse.data as EventsData);
      
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleVerificationAction = async (verificationId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/verifications/${verificationId}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success(`Verification ${action}d successfully!`);
      
      // Refresh verifications data
      const verificationsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/verifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVerificationsData(verificationsResponse.data as VerificationsData);
      
    } catch (error) {
      toast.error(`Failed to ${action} verification`);
    }
  };

  const handleViewEventDetails = (eventId: string) => {
    router.push(`/admin/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!eventsData && !clubData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg text-white">No data available</div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Manage your club events and members</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveTab('events')}
            variant={activeTab === 'events' ? 'default' : 'outline'}
            className={activeTab === 'events' ? 'bg-yellow-400 text-black' : 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </Button>
          <Button
            onClick={() => setActiveTab('verifications')}
            variant={activeTab === 'verifications' ? 'default' : 'outline'}
            className={activeTab === 'verifications' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verifications
          </Button>
          <Button
            onClick={() => setActiveTab('members')}
            variant={activeTab === 'members' ? 'default' : 'outline'}
            className={activeTab === 'members' ? 'bg-yellow-400 text-black' : 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'}
          >
            <Users className="w-4 h-4 mr-2" />
            Members
          </Button>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && eventsData && (
          <>
            {/* Events Overview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{eventsData.clubName} Events</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Total Events: {eventsData.totalEvents}</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                      Active Club
                    </Badge>
                  </div>
                </div>
                <Button onClick={handleCreateEvent} className="bg-yellow-400 text-black hover:bg-yellow-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>

            {/* Events List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  All Events
                </h3>
              </div>
              
              <div className="grid gap-4 p-6">
                {eventsData.events.map((event) => (
                  <div key={event.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2">{event.name}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <Badge variant="outline" className="ml-2 border-gray-600 text-gray-300">
                              {event.type}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-400">Date:</span>
                            <span className="text-white ml-2">{event.date}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Venue:</span>
                            <span className="text-white ml-2">{event.venue}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Attendees:</span>
                            <span className="text-yellow-400 ml-2 font-semibold">{event.totalAttendees}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 mt-2">{event.description}</p>
                      </div>
                      <Button
                        onClick={() => handleViewEventDetails(event.id)}
                        variant="outline"
                        size="sm"
                        className="border-yellow-400 bg-yellow-400 text-black hover:bg-yellow-500"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    {selectedEvent.name} - Attendees
                  </h3>
                  <Button
                    onClick={() => setSelectedEvent(null)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300"
                  >
                    Close
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Course</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Year</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {selectedEvent.attendees?.map((attendee) => (
                        <tr key={attendee.id} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4 text-white">{attendee.name}</td>
                          <td className="px-6 py-4 text-gray-300">{attendee.email}</td>
                          <td className="px-6 py-4 text-gray-300">{attendee.course}</td>
                          <td className="px-6 py-4 text-gray-300">{attendee.year}</td>
                          <td className="px-6 py-4 text-gray-300">{attendee.joinedAt}</td>
                          <td className="px-6 py-4">
                            <Badge
                              className={
                                attendee.status === 'confirmed'
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }
                            >
                              {attendee.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && verificationsData && (
          <>
            {/* Verifications Overview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Pending Verifications</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Pending Requests: {verificationsData.totalPending}</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                      Verification Queue
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">{verificationsData.totalPending}</div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
              </div>
            </div>

            {/* Verification Requests */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-yellow-400" />
                  Verification Requests
                </h3>
              </div>
              
              <div className="grid gap-6 p-6">
                {verificationsData.verifications.map((verification) => (
                  <div key={verification.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* User Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
                            {verification.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">{verification.name}</h4>
                            <p className="text-gray-400">{verification.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Course:</span>
                            <span className="text-white">{verification.course}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Year:</span>
                            <span className="text-white">{verification.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">College:</span>
                            <span className="text-white">{verification.collegeName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Submitted:</span>
                            <span className="text-white">{verification.submittedAt}</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleVerificationAction(verification.id, 'approve')}
                            className="bg-green-500 hover:bg-green-600 text-white flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleVerificationAction(verification.id, 'reject')}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>

                      {/* ID Image */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-3">Student ID Card</h5>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <img
                            src={verification.idImage}
                            alt="Student ID"
                            className="w-full h-48 object-cover rounded-lg border border-gray-600"
                          />
                          <p className="text-xs text-gray-400 mt-2 text-center">
                            Click to view full size
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && clubData && (
          <>
            {/* Club Overview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{clubData.clubName}</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Total Members: {clubData.totalMembers}</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                      Active Club
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">{clubData.totalMembers}</div>
                  <div className="text-sm text-gray-400">Members</div>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  Club Members
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Member</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Academic Info</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {clubData.members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold">
                              {member.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{member.name}</div>
                              <div className="text-sm text-gray-400 max-w-xs truncate">{member.bio}</div>
                              {member.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {member.tags.slice(0, 2).map((tag, i) => (
                                    <Badge key={i} variant="outline" className="text-xs border-gray-600 text-gray-300">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {member.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                      +{member.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Mail className="w-4 h-4" />
                              {member.email}
                            </div>
                            <div className="text-sm text-gray-400">{member.collegeName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-white">{member.course}</div>
                            <div className="text-sm text-gray-400">Year: {member.year}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {member.isVerified ? (
                              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                                <XCircle className="w-3 h-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(member.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 flex justify-self-end items-center">
          
          <div className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
