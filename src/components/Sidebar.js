import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  BookOpen, 
  Timer, 
  FileText, 
  Brain,
  Mic,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'To-Do List', href: '/todos', icon: CheckSquare },
  { name: 'Habits', href: '/habits', icon: Target },
  { name: 'Notes', href: '/notes', icon: BookOpen },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer },
  { name: 'PDF Q&A', href: '/pdf-qa', icon: FileText },
  { name: 'Document Summarizer', href: '/document-summarizer', icon: Brain },
  { name: 'Podcast Generator', href: '/podcast-generator', icon: Mic },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${isCollapsed ? 'md:w-16' : 'md:w-64'} 
        fixed inset-y-0 left-0 z-50 md:z-auto
        flex flex-col transition-all duration-300 ease-in-out
        w-64 md:flex
      `}>
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-lg md:shadow-none">
          {/* Collapse button for desktop */}
          <div className="hidden md:block absolute -right-3 top-5 z-10">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-white shadow-lg rounded-full p-1 hover:bg-gray-50 transition-colors border border-gray-200"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>

          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Logo/Header */}
            <div className={`flex items-center flex-shrink-0 px-4 ${isCollapsed ? 'justify-center' : ''}`}>
              <Brain className="h-8 w-8 text-primary-600" />
              {!isCollapsed && (
                <span className="ml-2 text-xl font-bold text-gray-900">AI Study Suite</span>
              )}
            </div>

            {/* Navigation */}
            <nav className={`mt-8 flex-1 ${isCollapsed ? 'px-1' : 'px-2'} bg-white space-y-1`}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)} // Close mobile menu on navigation
                    className={`${
                      isActive
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2'} text-sm font-medium border-l-4 rounded-r-md transition-colors duration-200`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } ${isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'}`}
                    />
                    {!isCollapsed && item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className={`flex-shrink-0 group block ${isCollapsed ? 'w-full' : ''}`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-500">
                  <span className="text-sm font-medium leading-none text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {user?.name || 'User'}
                    </p>
                    <button
                      onClick={logout}
                      className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      <LogOut className="mr-1 h-3 w-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
              {isCollapsed && (
                <div className="mt-2 text-center">
                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-gray-700"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed sidebar on desktop */}
      <div className={`hidden md:block ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-shrink-0`} />
    </>
  );
};

export default Sidebar;
