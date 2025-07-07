
import React from 'react';
import { 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

export const ModerationDashboard = () => {
  const stats = [
    {
      title: 'Pending Reviews',
      value: '127',
      change: '+12%',
      trend: 'up',
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20'
    },
    {
      title: 'Flagged Content',
      value: '43',
      change: '-8%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/20'
    },
    {
      title: 'Active Users',
      value: '8,432',
      change: '+24%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20'
    },
    {
      title: 'Resolved Today',
      value: '89',
      change: '+15%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20'
    }
  ];

  const recentActivity = [
    {
      type: 'warning',
      action: 'Content Flagged',
      target: 'Character "Dark Knight"',
      time: '2 min ago',
      priority: 'high'
    },
    {
      type: 'success',
      action: 'User Verified',
      target: 'user@example.com',
      time: '5 min ago',
      priority: 'low'
    },
    {
      type: 'error',
      action: 'Rule Violation',
      target: 'Inappropriate content',
      time: '8 min ago',
      priority: 'high'
    },
    {
      type: 'info',
      action: 'Review Completed',
      target: 'Message thread #1284',
      time: '12 min ago',
      priority: 'medium'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Moderation Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor and manage platform activity</p>
        </div>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-6 h-6 ${stat.color}`} />
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#1A1D23] border border-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-[#0A0B0F] rounded-lg border border-gray-700/30">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'warning' ? 'bg-yellow-400' :
                  item.type === 'success' ? 'bg-green-400' :
                  item.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{item.action}</p>
                  <p className="text-gray-400 text-sm truncate">{item.target}</p>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.priority}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1A1D23] border border-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 bg-[#FF7A00]/10 border border-[#FF7A00]/20 rounded-lg text-left hover:bg-[#FF7A00]/20 transition-colors">
              <Eye className="w-5 h-5 text-[#FF7A00]" />
              <div>
                <p className="text-white font-medium">Review Flagged Content</p>
                <p className="text-gray-400 text-sm">12 items pending review</p>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left hover:bg-red-500/20 transition-colors">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">High Priority Reports</p>
                <p className="text-gray-400 text-sm">3 urgent items</p>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-left hover:bg-blue-500/20 transition-colors">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">User Management</p>
                <p className="text-gray-400 text-sm">Manage user accounts</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
