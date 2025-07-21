import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Circle, 
  Edit, 
  Trash2, 
  Calendar,
  Tag,
  AlertCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { todoService } from '../services';
import { formatDate, isToday } from '../utils/helpers';

const TodosPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch todos
  const { data: todos = [], isLoading } = useQuery(
    ['todos', filter, selectedTag],
    () => todoService.getTodos({ 
      status: filter === 'all' ? undefined : filter,
      tag: selectedTag || undefined
    })
  );

  const { data: stats } = useQuery('todoStats', todoService.getTodoStats);

  // Form setup
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Mutations
  const createTodoMutation = useMutation(todoService.createTodo, {
    onSuccess: () => {
      queryClient.invalidateQueries(['todos', 'todoStats']);
      toast.success('Todo created successfully!');
      reset();
      setShowAddForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create todo');
    }
  });

  const updateTodoMutation = useMutation(
    ({ id, data }) => todoService.updateTodo(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['todos', 'todoStats']);
        toast.success('Todo updated successfully!');
        setEditingTodo(null);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update todo');
      }
    }
  );

  const deleteTodoMutation = useMutation(todoService.deleteTodo, {
    onSuccess: () => {
      queryClient.invalidateQueries(['todos', 'todoStats']);
      toast.success('Todo deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete todo');
    }
  });

  // Filter todos based on search
  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    todo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique tags
  const allTags = [...new Set(todos.flatMap(todo => todo.tags || []))];

  const onSubmit = (data) => {
    const todoData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      due_date: data.due_date || null
    };

    if (editingTodo) {
      updateTodoMutation.mutate({ id: editingTodo._id, data: todoData });
    } else {
      createTodoMutation.mutate(todoData);
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setValue('title', todo.title);
    setValue('description', todo.description);
    setValue('priority', todo.priority);
    setValue('tags', todo.tags?.join(', ') || '');
    setValue('due_date', todo.due_date ? todo.due_date.split('T')[0] : '');
    setShowAddForm(true);
  };

  const handleToggleComplete = (todo) => {
    updateTodoMutation.mutate({
      id: todo._id,
      data: { completed: !todo.completed }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteTodoMutation.mutate(id);
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setShowAddForm(false);
    reset();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !isToday(dueDate);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">To-Do List</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Todo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Circle className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completed || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingTodo ? 'Edit Todo' : 'Add New Todo'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter todo title"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter description (optional)"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  {...register('due_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  {...register('tags')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter tags (comma separated)"
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
                disabled={createTodoMutation.isLoading || updateTodoMutation.isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {editingTodo ? 'Update' : 'Create'} Todo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Todo List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading todos...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="p-6 text-center">
            <Circle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No todos found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTodos.map((todo) => (
              <div key={todo._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => handleToggleComplete(todo)}
                    className={`mt-1 ${todo.completed ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                  >
                    {todo.completed ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-lg font-medium ${
                          todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p className={`mt-1 ${
                            todo.completed ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {todo.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(todo)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(todo._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(todo.priority)}`}>
                        {todo.priority} priority
                      </span>
                      
                      {todo.due_date && (
                        <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          isOverdue(todo.due_date) && !todo.completed
                            ? 'text-red-600 bg-red-50'
                            : isToday(todo.due_date)
                            ? 'text-orange-600 bg-orange-50'
                            : 'text-blue-600 bg-blue-50'
                        }`}>
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(todo.due_date)}
                          {isOverdue(todo.due_date) && !todo.completed && ' (Overdue)'}
                          {isToday(todo.due_date) && ' (Today)'}
                        </span>
                      )}
                      
                      {todo.tags?.map((tag) => (
                        <span key={tag} className="flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-full">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodosPage;
