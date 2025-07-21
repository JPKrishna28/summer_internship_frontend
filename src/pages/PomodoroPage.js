import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Settings, 
  Clock,
  Coffee,
  Target,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { pomodoroService } from '../services';
import { formatDateTime } from '../utils/helpers';

const PomodoroPage = () => {
  const [sessionType, setSessionType] = useState('work'); // work, short_break, long_break
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const queryClient = useQueryClient();

  // Get settings
  const { data: settings } = useQuery('pomodoroSettings', pomodoroService.getSettings);
  const { data: stats } = useQuery('pomodoroStats', pomodoroService.getStats);
  const { data: sessions } = useQuery('pomodoroSessions', () => 
    pomodoroService.getSessions({ 
      date_from: new Date().toISOString().split('T')[0] 
    })
  );

  // Get session duration based on type and settings
  const getSessionDuration = () => {
    if (!settings) return 25;
    switch (sessionType) {
      case 'work': return settings.work_duration || 25;
      case 'short_break': return settings.short_break_duration || 5;
      case 'long_break': return settings.long_break_duration || 15;
      default: return 25;
    }
  };

  const timer = usePomodoroTimer(getSessionDuration());

  // Mutations
  const startSessionMutation = useMutation(pomodoroService.startSession, {
    onSuccess: (data) => {
      setCurrentSessionId(data.session._id);
      queryClient.invalidateQueries('pomodoroSessions');
      toast.success('Session started!');
    }
  });

  const completeSessionMutation = useMutation(
    ({ id, data }) => pomodoroService.completeSession(id, data),
    {
      onSuccess: () => {
        setCurrentSessionId(null);
        queryClient.invalidateQueries(['pomodoroSessions', 'pomodoroStats']);
        toast.success('Session completed!');
        
        // Auto-switch to break or work
        if (settings?.auto_start_breaks && sessionType === 'work') {
          const workSessions = sessions?.filter(s => s.type === 'work' && s.status === 'completed').length || 0;
          const nextType = (workSessions + 1) % (settings.long_break_interval || 4) === 0 ? 'long_break' : 'short_break';
          setSessionType(nextType);
        } else if (settings?.auto_start_work && sessionType !== 'work') {
          setSessionType('work');
        }
      }
    }
  );

  const cancelSessionMutation = useMutation(pomodoroService.cancelSession, {
    onSuccess: () => {
      setCurrentSessionId(null);
      queryClient.invalidateQueries('pomodoroSessions');
      toast.success('Session cancelled');
    }
  });

  // Handle timer completion
  useEffect(() => {
    if (timer.isFinished && currentSessionId) {
      completeSessionMutation.mutate({ id: currentSessionId, data: {} });
      
      // Play notification sound
      if (settings?.notification_sound) {
        // You can add audio notification here
        new Audio('/notification.mp3').play().catch(() => {});
      }
      
      // Show desktop notification
      if (settings?.notification_desktop && 'Notification' in window) {
        new Notification('Pomodoro Session Complete!', {
          body: `Your ${sessionType.replace('_', ' ')} session is finished.`,
          icon: '/favicon.ico'
        });
      }
    }
  }, [timer.isFinished, currentSessionId, completeSessionMutation, sessionType, settings]);

  const handleStart = () => {
    if (!timer.isActive) {
      startSessionMutation.mutate({
        type: sessionType,
        duration: getSessionDuration(),
        task_title: ''
      });
    }
    timer.start();
  };

  const handlePause = () => {
    timer.pause();
  };

  const handleStop = () => {
    if (currentSessionId) {
      cancelSessionMutation.mutate(currentSessionId);
    }
    timer.stop();
  };

  const handleReset = () => {
    timer.reset(getSessionDuration());
  };

  const getSessionTypeDisplay = () => {
    switch (sessionType) {
      case 'work': return { name: 'Work Session', color: 'text-red-600', bg: 'bg-red-50', icon: Target };
      case 'short_break': return { name: 'Short Break', color: 'text-green-600', bg: 'bg-green-50', icon: Coffee };
      case 'long_break': return { name: 'Long Break', color: 'text-blue-600', bg: 'bg-blue-50', icon: Coffee };
      default: return { name: 'Work Session', color: 'text-red-600', bg: 'bg-red-50', icon: Target };
    }
  };

  const sessionDisplay = getSessionTypeDisplay();

  return (
    <div className="space-y-6">
      {/* Timer Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Session Type */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${sessionDisplay.bg} ${sessionDisplay.color} mb-6`}>
            <sessionDisplay.icon className="h-5 w-5 mr-2" />
            <span className="font-medium">{sessionDisplay.name}</span>
          </div>

          {/* Timer Display */}
          <div className="mb-8">
            <div className={`text-8xl font-bold mb-4 ${timer.isActive && !timer.isPaused ? 'animate-pulse' : ''}`}>
              {timer.formatTime()}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  sessionType === 'work' ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${timer.progress}%` }}
              ></div>
            </div>
            
            <p className="text-gray-600">
              {timer.isActive ? (timer.isPaused ? 'Paused' : 'In Progress') : 'Ready to Start'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            {!timer.isActive ? (
              <button
                onClick={handleStart}
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                disabled={startSessionMutation.isLoading}
              >
                <Play className="h-5 w-5 mr-2" />
                Start
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Pause className="h-5 w-5 mr-2" />
                {timer.isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            
            <button
              onClick={handleStop}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!timer.isActive && !timer.isPaused}
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </button>
          </div>

          {/* Session Type Selector */}
          <div className="flex justify-center space-x-2">
            {[
              { key: 'work', label: 'Work', duration: settings?.work_duration || 25 },
              { key: 'short_break', label: 'Short Break', duration: settings?.short_break_duration || 5 },
              { key: 'long_break', label: 'Long Break', duration: settings?.long_break_duration || 15 }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => {
                  setSessionType(type.key);
                  timer.reset(type.duration);
                }}
                disabled={timer.isActive}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sessionType === type.key
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                } ${timer.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {type.label} ({type.duration}m)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats and Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Stats</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Work Sessions</span>
              <span className="text-2xl font-bold text-red-600">{stats?.today?.work || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Break Sessions</span>
              <span className="text-2xl font-bold text-green-600">
                {(stats?.today?.short_break || 0) + (stats?.today?.long_break || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Focus Time</span>
              <span className="text-2xl font-bold text-purple-600">{stats?.today?.total_duration || 0}m</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Streak</span>
              <span className="text-2xl font-bold text-orange-600">{stats?.current_streak || 0} days</span>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {sessions?.slice(0, 10).map((session) => (
              <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    session.type === 'work' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.type.replace('_', ' ').charAt(0).toUpperCase() + session.type.replace('_', ' ').slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateTime(session.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session.duration}m</p>
                  <p className={`text-xs ${
                    session.status === 'completed' ? 'text-green-600' : 
                    session.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {session.status}
                  </p>
                </div>
              </div>
            ))}
            
            {(!sessions || sessions.length === 0) && (
              <p className="text-gray-500 text-center py-4">No sessions today</p>
            )}
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowSettings(true)}
          className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        >
          <Settings className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default PomodoroPage;
