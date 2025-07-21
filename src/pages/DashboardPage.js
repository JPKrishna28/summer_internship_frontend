import React from 'react';
import { useQuery } from 'react-query';
import { 
  CheckSquare, 
  Target, 
  Timer, 
  TrendingUp, 
  BookOpen,
  Clock,
  Calendar,
  Award
} from 'lucide-react';
import { 
  todoService, 
  habitService, 
  pomodoroService 
} from '../services';
import { formatDate, isToday } from '../utils/helpers';

const DashboardPage = () => {
  // Fetch dashboard data
  const { data: todoStats } = useQuery('todoStats', todoService.getTodoStats);
  const { data: habitStats } = useQuery('habitStats', habitService.getHabitStats);
  const { data: pomodoroStats } = useQuery('pomodoroStats', pomodoroService.getStats);
  const { data: recentTodos } = useQuery('recentTodos', () => 
    todoService.getTodos({ status: 'pending' })
  );

  const statsCards = [
    {
      title: 'Pending Tasks',
      value: todoStats?.pending || 0,
      icon: CheckSquare,
      color: 'blue',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Active Habits',
      value: habitStats?.active_habits || 0,
      icon: Target,
      color: 'green',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Focus Sessions Today',
      value: pomodoroStats?.today?.work || 0,
      icon: Timer,
      color: 'purple',
      change: '+25%',
      changeType: 'increase'
    },
    {
      title: 'Study Streak',
      value: pomodoroStats?.current_streak || 0,
      icon: Award,
      color: 'orange',
      change: '+3 days',
      changeType: 'increase'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-500'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-500'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'bg-orange-500'
      }
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Good morning! 👋</h1>
        <p className="text-primary-100">
          Ready to boost your productivity? You have {todoStats?.pending || 0} pending tasks and 
          {' '}{habitStats?.active_habits || 0} habits to track today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <div key={index} className={`${colors.bg} rounded-lg p-6 card-hover`}>
              <div className="flex items-center">
                <div className={`${colors.icon} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-center">
                    <p className={`text-2xl font-semibold ${colors.text}`}>
                      {stat.value}
                    </p>
                    <span className="ml-2 text-sm text-green-600 font-medium">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <CheckSquare className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentTodos?.slice(0, 5).map((todo) => (
              <div key={todo._id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  todo.priority === 'high' ? 'bg-red-500' : 
                  todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{todo.title}</p>
                  <p className="text-xs text-gray-500">
                    {todo.due_date ? `Due ${formatDate(todo.due_date)}` : 'No due date'}
                  </p>
                </div>
              </div>
            ))}
            {(!recentTodos || recentTodos.length === 0) && (
              <p className="text-gray-500 text-center py-4">No pending tasks</p>
            )}
          </div>
        </div>

        {/* Today's Focus */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Focus</h2>
            <Timer className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Timer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Work Sessions</p>
                  <p className="text-sm text-gray-500">25 min each</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary-600">
                {pomodoroStats?.today?.work || 0}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Break Time</p>
                  <p className="text-sm text-gray-500">5-15 min each</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {(pomodoroStats?.today?.short_break || 0) + (pomodoroStats?.today?.long_break || 0)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Total Focus Time</p>
                  <p className="text-sm text-gray-500">Minutes today</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {pomodoroStats?.today?.total_duration || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <CheckSquare className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">Add Task</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Timer className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">Start Pomodoro</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <BookOpen className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">Take Notes</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Target className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">Track Habit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
