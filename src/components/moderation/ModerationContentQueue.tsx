
import React, { useState } from 'react';
import { AlertTriangle, Clock, User, MessageSquare, CheckCircle, XCircle, Filter, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface QueueItem {
  id: number;
  contentType: 'character' | 'message' | 'profile';
  reportedUser: string;
  reportedBy: string;
  reason: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-review' | 'resolved';
  content?: string;
  details?: string;
}

export const ModerationContentQueue = () => {
  const [sortColumn, setSortColumn] = useState<keyof QueueItem>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);

  const queueItems: QueueItem[] = [
    {
      id: 1,
      contentType: 'character',
      reportedUser: 'darkassassin92',
      reportedBy: 'user123',
      reason: 'Inappropriate content',
      date: '2024-01-15 14:30',
      priority: 'high',
      status: 'pending',
      content: 'Character: "Dark Assassin" with inappropriate backstory',
      details: 'Character contains explicit violent content unsuitable for platform'
    },
    {
      id: 2,
      contentType: 'message',
      reportedUser: 'spammer001',
      reportedBy: 'moderator',
      reason: 'Spam/Advertisement',
      date: '2024-01-15 14:15',
      priority: 'medium',
      status: 'pending',
      content: 'Message: "Check out my website for amazing deals!!!"',
      details: 'User posting promotional content in chat channels'
    },
    {
      id: 3,
      contentType: 'profile',
      reportedUser: 'john_doe',
      reportedBy: 'user456',
      reason: 'Fake account',
      date: '2024-01-15 13:00',
      priority: 'low',
      status: 'in-review',
      content: 'Profile with suspicious activity patterns',
      details: 'Account created recently with unusual engagement patterns'
    },
    {
      id: 4,
      contentType: 'character',
      reportedUser: 'evilqueen88',
      reportedBy: 'user789',
      reason: 'Copyright violation',
      date: '2024-01-15 12:45',
      priority: 'high',
      status: 'resolved',
      content: 'Character: "Evil Queen" using copyrighted material',
      details: 'Character uses Disney copyrighted imagery without permission'
    },
    {
      id: 5,
      contentType: 'message',
      reportedUser: 'toxicuser',
      reportedBy: 'user999',
      reason: 'Harassment',
      date: '2024-01-15 12:30',
      priority: 'high',
      status: 'pending',
      content: 'Message containing threatening language',
      details: 'User sending threatening messages to other community members'
    }
  ];

  const handleSort = (column: keyof QueueItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: keyof QueueItem) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const filteredAndSortedItems = queueItems
    .filter(item => {
      const contentTypeMatch = contentTypeFilter === 'all' || item.contentType === contentTypeFilter;
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      return contentTypeMatch && statusMatch;
    })
    .sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }
      return 0;
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'in-review': return 'text-blue-400 bg-blue-400/10';
      case 'resolved': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'character': return User;
      case 'message': return MessageSquare;
      case 'profile': return User;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Queue</h1>
          <p className="text-gray-400 mt-1">Review and moderate flagged content</p>
        </div>
        <div className="text-sm text-gray-400">
          {filteredAndSortedItems.length} items in queue
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 p-4 bg-[#1A1D23] border border-gray-700/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">Filters:</span>
        </div>
        
        <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
          <SelectTrigger className="w-40 bg-[#0A0B0F] border-gray-600 text-white">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1D23] border-gray-600">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="character">Character</SelectItem>
            <SelectItem value="message">Message</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-[#0A0B0F] border-gray-600 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1D23] border-gray-600">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#1A1D23] border border-gray-700/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700/50 hover:bg-gray-800/50">
              <TableHead 
                className="text-gray-300 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('contentType')}
              >
                <div className="flex items-center gap-2">
                  Content Type
                  {getSortIcon('contentType')}
                </div>
              </TableHead>
              <TableHead 
                className="text-gray-300 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('reportedUser')}
              >
                <div className="flex items-center gap-2">
                  Reported User
                  {getSortIcon('reportedUser')}
                </div>
              </TableHead>
              <TableHead 
                className="text-gray-300 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('reportedBy')}
              >
                <div className="flex items-center gap-2">
                  Reported By
                  {getSortIcon('reportedBy')}
                </div>
              </TableHead>
              <TableHead 
                className="text-gray-300 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('reason')}
              >
                <div className="flex items-center gap-2">
                  Reason
                  {getSortIcon('reason')}
                </div>
              </TableHead>
              <TableHead 
                className="text-gray-300 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  {getSortIcon('date')}
                </div>
              </TableHead>
              <TableHead className="text-gray-300">Priority</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.map((item) => {
              const Icon = getContentTypeIcon(item.contentType);
              return (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <TableRow 
                      className="border-gray-700/50 hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedItem(item)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-white capitalize">{item.contentType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#FF7A00] font-medium">{item.reportedUser}</span>
                      </TableCell>
                      <TableCell className="text-gray-300">{item.reportedBy}</TableCell>
                      <TableCell className="text-gray-300">{item.reason}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{item.date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 border-green-600 text-green-400 hover:bg-green-600/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle approve action
                            }}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 border-red-600 text-red-400 hover:bg-red-600/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle reject action
                            }}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </DialogTrigger>
                  
                  {/* Detailed Review Modal */}
                  <DialogContent className="bg-[#1A1D23] border-gray-700 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Content Review Details</DialogTitle>
                    </DialogHeader>
                    
                    {selectedItem && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-400">Content Type</label>
                            <p className="text-white font-medium capitalize">{selectedItem.contentType}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Priority</label>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedItem.priority)}`}>
                              {selectedItem.priority}
                            </span>
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Reported User</label>
                            <p className="text-[#FF7A00] font-medium">{selectedItem.reportedUser}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Reported By</label>
                            <p className="text-white">{selectedItem.reportedBy}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Reason</label>
                            <p className="text-white">{selectedItem.reason}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Date</label>
                            <p className="text-white">{selectedItem.date}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-400">Content</label>
                          <div className="mt-2 p-4 bg-[#0A0B0F] border border-gray-700/50 rounded-lg">
                            <p className="text-white">{selectedItem.content}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-400">Details</label>
                          <div className="mt-2 p-4 bg-[#0A0B0F] border border-gray-700/50 rounded-lg">
                            <p className="text-gray-300">{selectedItem.details}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                          <Button 
                            variant="outline"
                            className="border-green-600 text-green-400 hover:bg-green-600/10"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Content
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Remove Content
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
