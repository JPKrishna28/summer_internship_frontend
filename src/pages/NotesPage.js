import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Brain, 
  FileText, 
  Edit, 
  Trash2, 
  Download,
  Copy,
  Sparkles,
  List,
  CreditCard,
  BookmarkCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { noteService } from '../services';
import { formatDateTime, truncateText, downloadFile, copyToClipboard } from '../utils/helpers';

const NotesPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSummarizer, setShowSummarizer] = useState(false);
  const [summaryType, setSummaryType] = useState('concise');
  const [currentContent, setCurrentContent] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery('notes', noteService.getNotes);

  // Form setup
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { register: registerSummary, handleSubmit: handleSummarySubmit, watch: watchSummary } = useForm();

  // Mutations
  const createNoteMutation = useMutation(noteService.createNote, {
    onSuccess: () => {
      queryClient.invalidateQueries('notes');
      toast.success('Note created successfully!');
      reset();
      setShowAddForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create note');
    }
  });

  const updateNoteMutation = useMutation(
    ({ id, data }) => noteService.updateNote(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes');
        toast.success('Note updated successfully!');
        setEditingNote(null);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update note');
      }
    }
  );

  const deleteNoteMutation = useMutation(noteService.deleteNote, {
    onSuccess: () => {
      queryClient.invalidateQueries('notes');
      toast.success('Note deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete note');
    }
  });

  const summarizeMutation = useMutation(noteService.summarizeNote, {
    onSuccess: (data) => {
      toast.success('Summary generated successfully!');
      if (data.note) {
        queryClient.invalidateQueries('notes');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to generate summary');
    }
  });

  const glossaryMutation = useMutation(noteService.generateGlossary, {
    onSuccess: (data) => {
      toast.success('Glossary generated successfully!');
      if (data.note) {
        queryClient.invalidateQueries('notes');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to generate glossary');
    }
  });

  const flashcardsMutation = useMutation(noteService.generateFlashcards, {
    onSuccess: (data) => {
      toast.success('Flashcards generated successfully!');
      if (data.note) {
        queryClient.invalidateQueries('notes');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to generate flashcards');
    }
  });

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(notes.map(note => note.category))];

  const onSubmit = (data) => {
    const noteData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
    };

    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote._id, data: noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
  };

  const onSummarySubmit = (data) => {
    summarizeMutation.mutate({
      content: data.content,
      type: summaryType,
      title: data.title || undefined,
      subject: data.subject || undefined
    });
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setValue('title', note.title);
    setValue('content', note.content);
    setValue('category', note.category);
    setValue('tags', note.tags?.join(', ') || '');
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setShowAddForm(false);
    reset();
  };

  const handleDownload = (note) => {
    const content = `${note.title}\n\n${note.content}\n\n${note.summary ? `Summary:\n${note.summary}` : ''}`;
    downloadFile(content, `${note.title}.txt`, 'text/plain');
  };

  const handleCopy = async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Copied to clipboard!');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const generateGlossary = (content) => {
    glossaryMutation.mutate({
      content,
      title: `Glossary - ${new Date().toLocaleDateString()}`,
      subject: 'general'
    });
  };

  const generateFlashcards = (content) => {
    flashcardsMutation.mutate({
      content,
      num_cards: 10,
      difficulty: 'medium',
      title: `Flashcards - ${new Date().toLocaleDateString()}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notes & Summaries</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSummarizer(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Brain className="h-5 w-5 mr-2" />
              AI Summarizer
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Note
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Summarizer Modal */}
      {showSummarizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">AI Text Summarizer</h2>
                <button
                  onClick={() => setShowSummarizer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSummarySubmit(onSummarySubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content to Summarize
                  </label>
                  <textarea
                    {...registerSummary('content', { required: 'Content is required' })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Paste your text here..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Summary Type
                    </label>
                    <select
                      value={summaryType}
                      onChange={(e) => setSummaryType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="concise">Concise (2-3 sentences)</option>
                      <option value="detailed">Detailed</option>
                      <option value="bullet_points">Bullet Points</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title (optional)
                    </label>
                    <input
                      {...registerSummary('title')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Save as note with title"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={summarizeMutation.isLoading}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {summarizeMutation.isLoading ? 'Summarizing...' : 'Generate Summary'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => generateGlossary(watchSummary('content'))}
                    disabled={glossaryMutation.isLoading || !watchSummary('content')}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <List className="h-5 w-5 mr-2" />
                    {glossaryMutation.isLoading ? 'Generating...' : 'Generate Glossary'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => generateFlashcards(watchSummary('content'))}
                    disabled={flashcardsMutation.isLoading || !watchSummary('content')}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {flashcardsMutation.isLoading ? 'Generating...' : 'Generate Flashcards'}
                  </button>
                </div>
              </form>
              
              {/* Display Results */}
              {summarizeMutation.data && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Generated Summary</h3>
                    <button
                      onClick={() => handleCopy(summarizeMutation.data.summary)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{summarizeMutation.data.summary}</p>
                </div>
              )}
              
              {glossaryMutation.data && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Generated Glossary</h3>
                  <div className="space-y-2">
                    {glossaryMutation.data.glossary.map((item, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3">
                        <dt className="font-medium text-gray-900">{item.term}</dt>
                        <dd className="text-gray-700 text-sm">{item.definition}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {flashcardsMutation.data && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Generated Flashcards</h3>
                  <div className="grid gap-3">
                    {flashcardsMutation.data.flashcards.slice(0, 3).map((card, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900 mb-1">Q: {card.question}</div>
                        <div className="text-gray-700 text-sm">A: {card.answer}</div>
                      </div>
                    ))}
                    {flashcardsMutation.data.flashcards.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{flashcardsMutation.data.flashcards.length - 3} more flashcards saved
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingNote ? 'Edit Note' : 'Add New Note'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter note title"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                {...register('content', { required: 'Content is required' })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Write your note content here..."
              />
              {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  {...register('category')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter category"
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
                disabled={createNoteMutation.isLoading || updateNoteMutation.isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {editingNote ? 'Update' : 'Create'} Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notes found</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{note.title}</h3>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(note)}
                      className="p-1 text-gray-400 hover:text-green-600"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {truncateText(note.content, 150)}
                </p>
                
                {note.summary && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center mb-1">
                      <Brain className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm font-medium text-blue-800">AI Summary</span>
                    </div>
                    <p className="text-blue-700 text-sm line-clamp-2">{note.summary}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {note.category && (
                      <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-full">
                        {note.category}
                      </span>
                    )}
                    {note.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {note.tags?.length > 2 && (
                      <span className="text-xs text-gray-500">+{note.tags.length - 2} more</span>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {formatDateTime(note.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPage;
