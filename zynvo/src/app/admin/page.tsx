'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Settings, Users, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
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

export default function AdminPanel() {
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchClubMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          router.push('/auth/signin');
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/clubMembers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setClubData(response.data as ClubData);
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error('Access denied. Only club founders can access this page.');
          router.push('/dashboard');
        } else {
          toast.error('Failed to fetch club members');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClubMembers();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!clubData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg text-white">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Manage your club members and activities</p>
        </div>

        {/* Club Overview Card */}
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

        {/* Members Section */}
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {clubData.members.map((member, index) => (
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

        {/* Footer Actions */}
        <div className="mt-8 flex justify-self-end items-center">
          
          <div className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
