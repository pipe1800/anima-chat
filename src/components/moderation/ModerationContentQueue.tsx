
import React, { useState } from 'react';
import { AlertTriangle, Clock, User, MessageSquare, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ModerationContentQueue = () => {
  const [filter, setFilter] = useState('all');

  const queueItems = [
    {
      id: 1,
      type: 'character',
      title: 'Character: "Dark Assassin"',
      reporter: 'user123',
      reason: 'Inappropriate content',
      priority: 'high',
      timestamp: '2 min ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'message',
      title: 'Chat message in #general',
      reporter: 'moderator',
      reason: 'Spam/Advertisement',
      priority: 'medium',
      timestamp: '15 min ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'profile',
      title: 'User profile: john_doe',
      reporter: 'user456',
      reason: 'Fake account',
      priority: 'low',
      timestamp: '1 hour ago',
      status: 'pending'
    },
    {
      id: 4,
      type: 'character',
      title: 'Character: "Evil Queen"',
      reporter: 'user789',
      reason: 'Copyright violation',
      priority: 'high',
      timestamp: '2 hours ago',
      status: 'in-review'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
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
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-700/50">
        {['all', 'high', 'medium', 'low'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab
                ? 'border-[#FF7A00] text-[#FF7A00]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'high' && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>}
          </button>
        ))}
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {queueItems.map((item) => {
          const Icon = getTypeIcon(item.type);
          return (
            <div key={item.id} className="bg-[#1A1D23] border border-gray-700/50 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.priority === 'high' ? 'bg-red-400/10 border border-red-400/20' :
                    item.priority === 'medium' ? 'bg-yellow-400/10 border border-yellow-400/20' :
                    'bg-gray-400/10 border border-gray-400/20'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      item.priority === 'high' ? 'text-red-400' :
                      item.priority === 'medium' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">{item.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      {item.status === 'in-review' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400">
                          In Review
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-3">
                      <p><span className="text-gray-300">Reported by:</span> {item.reporter}</p>
                      <p><span className="text-gray-300">Reason:</span> {item.reason}</p>
                      <p><span className="text-gray-300">Time:</span> {item.timestamp}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-green-400 hover:bg-green-600/10"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600/10"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
