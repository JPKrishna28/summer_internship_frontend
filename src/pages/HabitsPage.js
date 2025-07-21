import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Check,
  X,
  Flame,
  Award,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { habitService } from '../services';
import { formatDate, isToday, getTodayISO } from '../utils/helpers';

const HabitsPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch habits and stats
  const { data: habits = [], isLoading } = useQuery('habits', habitService.getHabits);
  const { data: stats } = useQuery('habitStats', habitService.getHabitStats);

  // Form setup
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Mutations
  const createHabitMutation = useMutation(habitService.createHabit, {
    onSuccess: () => {
      queryClient.invalidateQueries(['habits', 'habitStats']);
      toast.success('Habit created successfully!');
      reset();
      setShowAddForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create habit');
    }
  });

  const updateHabitMutation = useMutation(
    ({ id, data }) => habitService.updateHabit(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['habits', 'habitStats']);
        toast.success('Habit updated successfully!');
        setEditingHabit(null);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update habit');
      }
    }
  );

  const deleteHabitMutation = useMutation(habitService.deleteHabit, {
    onSuccess: () => {
      queryClient.invalidateQueries(['habits', 'habitStats']);
      toast.success('Habit deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete habit');
    }
  });

  const addEntryMutation = useMutation(
    ({ id, data }) => habitService.addHabitEntry(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['habits', 'habitStats']);
        toast.success('Habit entry added!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add entry');
      }
    }
  );

  const onSubmit = (data) => {
    const habitData = {
      ...data,
      target_value: parseFloat(data.target_value) || 1,
      color: data.color || '#3B82F6'
    };

    if (editingHabit) {
      updateHabitMutation.mutate({ id: editingHabit._id, data: habitData });
    } else {
      createHabitMutation.mutate(habitData);
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setValue('name', habit.name);
    setValue('description', habit.description);
    setValue('frequency', habit.frequency);
    setValue('target_value', habit.target_value);
    setValue('unit', habit.unit);
    setValue('category', habit.category);
    setValue('color', habit.color);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      deleteHabitMutation.mutate(id);
    }
  };

  const cancelEdit = () => {
    setEditingHabit(null);
    setShowAddForm(false);
    reset();
  };

  const handleMarkComplete = (habit, value = 1) => {
    const today = getTodayISO();
    addEntryMutation.mutate({
      id: habit._id,
      data: {
        date: today,
        value: value,
        notes: ''
      }
    });
  };

  const hasEntryToday = (habit) => {
    const today = getTodayISO();
    return habit.entries?.some(entry => entry.date.split('T')[0] === today);
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-green-600';
    if (streak >= 7) return 'text-blue-600';
    if (streak >= 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    if (rate >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Generate calendar grid for last 30 days
  const generateCalendarGrid = (habit) => {
    const grid = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const entry = habit.entries?.find(e => e.date.split('T')[0] === dateStr);
      const hasEntry = !!entry;
      const value = entry?.value || 0;
      const target = habit.target_value || 1;
      const completion = hasEntry ? Math.min(value / target, 1) : 0;
      
      grid.push({
        date: dateStr,
        hasEntry,
        completion,
        value,
        dayOfWeek: date.getDay()
      });
    }
    
    return grid;
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Habit
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Total Habits</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.total_habits || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Active Habits</p>
                <p className="text-2xl font-bold text-green-600">{stats?.active_habits || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-orange-600">Today's Progress</p>
                <p className="text-2xl font-bold text-orange-600">{Math.round(stats?.today_completion_rate || 0)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="h-6 w-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Completed Today</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.entries_today || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingHabit ? 'Edit Habit' : 'Add New Habit'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
                <input
                  {...register('name', { required: 'Habit name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Drink 8 glasses of water"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="health">Health & Fitness</option>
                  <option value="learning">Learning</option>
                  <option value="productivity">Productivity</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the habit"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  {...register('frequency')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                <input
                  {...register('target_value')}
                  type="number"
                  min="1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  {...register('unit')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="glasses, pages, minutes"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  {...register('color')}
                  type="color"
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createHabitMutation.isLoading || updateHabitMutation.isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {editingHabit ? 'Update' : 'Create'} Habit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Habits Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading habits...</p>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No habits yet. Start building better habits today!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {habits.map((habit) => {
            const completedToday = hasEntryToday(habit);
            const calendarGrid = generateCalendarGrid(habit);
            
            return (
              <div key={habit._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: habit.color }}
                        ></div>
                        <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                      </div>
                      {habit.description && (
                        <p className="text-gray-600 text-sm mb-2">{habit.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {habit.frequency}
                        </span>
                        <span>{habit.target_value} {habit.unit}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {habit.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`flex items-center justify-center mb-1 ${getStreakColor(habit.current_streak)}`}>
                        <Flame className="h-4 w-4 mr-1" />
                        <span className="text-lg font-bold">{habit.current_streak}</span>
                      </div>
                      <p className="text-xs text-gray-500">Current Streak</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center text-orange-600 mb-1">
                        <Award className="h-4 w-4 mr-1" />
                        <span className="text-lg font-bold">{habit.best_streak}</span>
                      </div>
                      <p className="text-xs text-gray-500">Best Streak</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCompletionRateColor(habit.recent_completion_rate)}`}>
                        {Math.round(habit.recent_completion_rate)}%
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="mb-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <div key={index} className="text-center text-xs font-medium text-gray-500 p-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {calendarGrid.map((day, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-sm border-2 ${
                            day.hasEntry
                              ? `opacity-${Math.max(30, Math.floor(day.completion * 100))} border-green-300`
                              : 'border-gray-200'
                          }`}
                          style={{
                            backgroundColor: day.hasEntry 
                              ? `${habit.color}${Math.floor(day.completion * 255).toString(16).padStart(2, '0')}`
                              : 'transparent'
                          }}
                          title={`${day.date}: ${day.hasEntry ? `${day.value} ${habit.unit}` : 'No entry'}`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    {completedToday ? (
                      <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                        <Check className="h-5 w-5 mr-2" />
                        Completed Today
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkComplete(habit)}
                        disabled={addEntryMutation.isLoading}
                        className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HabitsPage;
