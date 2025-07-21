import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/todos': return 'To-Do List';
      case '/habits': return 'Habit Tracker';
      case '/notes': return 'Notes & Summaries';
      case '/pomodoro': return 'Pomodoro Timer';
      case '/pdf-qa': return 'PDF Q&A';
      default: return 'AI Study Suite';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-2 text-2xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
