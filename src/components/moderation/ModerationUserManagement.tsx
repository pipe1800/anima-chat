
import React, { useState } from 'react';
import { Search, Users, AlertTriangle, Ban, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const ModerationUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      status: 'active',
      reports: 0,
      joinDate: '2024-01-15',
      lastActivity: '2 hours ago',
      tier: 'whale'
    },
    {
      id: 2,
      username: 'user123',
      email: 'user123@example.com',
      status: 'warned',
      reports: 2,
      joinDate: '2024-02-20',
      lastActivity: '1 day ago',
      tier: 'free'
    },
    {
      id: 3,
      username: 'flagged_user',
      email: 'flagged@example.com',
      status: 'suspended',
      reports: 5,
      joinDate: '2024-03-01',
      lastActivity: '5 days ago',
      tier: 'premium'
    },
    {
      id: 4,
      username: 'new_user',
      email: 'new@example.com',
      status: 'active',
      reports: 0,
      joinDate: '2024-07-01',
      lastActivity: '10 min ago',
      tier: 'free'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'warned': return 'text-yellow-400 bg-yellow-400/10';
      case 'suspended': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'whale': return 'text-purple-400 bg-purple-400/10';
      case 'premium': return 'text-blue-400 bg-blue-400/10';
      case 'free': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Monitor and manage user accounts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1D23] border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">8,432</p>
              <p className="text-sm text-gray-400">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1A1D23] border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">23</p>
              <p className="text-sm text-gray-400">Warned Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1A1D23] border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Ban className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">7</p>
              <p className="text-sm text-gray-400">Suspended</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1A1D23] border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">342</p>
              <p className="text-sm text-gray-400">New This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1A1D23] border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FF7A00]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1A1D23] border border-gray-700/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700/50 hover:bg-gray-800/50">
              <TableHead className="text-gray-300 font-semibold">User</TableHead>
              <TableHead className="text-gray-300 font-semibold">Status</TableHead>
              <TableHead className="text-gray-300 font-semibold">Tier</TableHead>
              <TableHead className="text-gray-300 font-semibold">Reports</TableHead>
              <TableHead className="text-gray-300 font-semibold">Last Activity</TableHead>
              <TableHead className="text-gray-300 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-gray-700/50 hover:bg-gray-800/30">
                <TableCell>
                  <div>
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(user.tier)}`}>
                    {user.tier}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    user.reports > 3 ? 'text-red-400' : 
                    user.reports > 0 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {user.reports}
                  </span>
                </TableCell>
                <TableCell className="text-gray-400">{user.lastActivity}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <Mail className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                    {user.status !== 'suspended' && (
                      <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10">
                        <Ban className="w-3 h-3 mr-1" />
                        Suspend
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
