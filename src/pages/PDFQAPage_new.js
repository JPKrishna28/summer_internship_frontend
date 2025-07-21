import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Upload, 
  FileText, 
  MessageCircle, 
  Send, 
  Trash2, 
  Download,
  Search,
  Brain,
  Loader2,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Sparkles,
  Eye,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { pdfQaService } from '../services';

const PDFQAPage = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch uploaded documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery(
    'pdf-documents',
    pdfQaService.getDocuments
  );

  // Upload mutation
  const uploadMutation = useMutation(pdfQaService.uploadDocument, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('pdf-documents');
      toast.success('Document uploaded and processed successfully!');
      setSelectedDocument(data.document);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to upload document');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation(pdfQaService.deleteDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries('pdf-documents');
      toast.success('Document deleted successfully!');
      if (selectedDocument) {
        setSelectedDocument(null);
        setChatHistory([]);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete document');
    }
  });

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    uploadMutation.mutate(formData);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle question submission
  const handleAskQuestion = async () => {
    if (!question.trim() || !selectedDocument || isAsking) return;

    setIsAsking(true);
    const userQuestion = question.trim();
    setQuestion('');

    // Add user message to chat
    const newUserMessage = {
      type: 'user',
      content: userQuestion,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      const response = await pdfQaService.askQuestion(selectedDocument._id, userQuestion);
      
      // Add AI response to chat
      const aiMessage = {
        type: 'ai',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, aiMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to get answer');
      // Remove the user message if the request failed
      setChatHistory(prev => prev.slice(0, -1));
    }

    setIsAsking(false);
  };

  // Sample questions based on document content
  const getSampleQuestions = () => {
    if (!selectedDocument) return [];
    
    return [
      "What is the main topic of this document?",
      "Can you summarize the key points?",
      "What are the important conclusions?",
      "Are there any specific recommendations mentioned?",
      "What methodology was used in this document?"
    ];
  };

  // Generate quiz questions
  const handleGenerateQuiz = async () => {
    if (!selectedDocument) return;

    try {
      const response = await pdfQaService.generateQuiz(selectedDocument._id);
      
      const quizMessage = {
        type: 'quiz',
        content: `Generated Quiz Questions:\n\n${response.questions.map((q, idx) => 
          `${idx + 1}. ${q.question}\n${q.options.map((opt, i) => 
            `   ${String.fromCharCode(97 + i)}) ${opt}`
          ).join('\n')}\n`
        ).join('\n')}`,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, quizMessage]);
      
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      toast.error('Failed to generate quiz questions');
    }
  };

  return (
    <div className="h-full flex relative">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Left Sidebar - Documents */}
      <div className={`
        ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 lg:w-1/3'} 
        fixed lg:relative z-40 h-full w-80 lg:w-auto
        transition-all duration-300 ease-in-out
        bg-white lg:bg-transparent
      `}>
        <div className={`h-full ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-full'} transition-all duration-300`}>
          {/* Collapse Button for Desktop */}
          <div className="hidden lg:block absolute -right-3 top-4 z-50">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="bg-white shadow-lg rounded-full p-1 hover:bg-gray-50 transition-colors border"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Expanded Sidebar Content */}
          <div className={`space-y-6 p-6 h-full overflow-y-auto ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload PDF Document</h2>
              
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your PDF here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {uploadMutation.isLoading && (
                <div className="mt-4 flex items-center text-primary-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing document...
                </div>
              )}
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Documents</h2>
              
              {documentsLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedDocument?._id === doc._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedDocument(doc);
                        setChatHistory([]);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <h3 className="font-medium text-gray-900 text-sm truncate">
                              {doc.filename}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500">
                            {Math.round(doc.file_size / 1024)} KB • {doc.page_count} pages
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this document?')) {
                              deleteMutation.mutate(doc._id);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Info */}
            {selectedDocument && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Document Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pages:</span>
                    <span className="text-gray-900">{selectedDocument.page_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="text-gray-900">{Math.round(selectedDocument.file_size / 1024)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-green-600">Processed</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  className="w-full mt-4 flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Quiz
                </button>
              </div>
            )}
          </div>

          {/* Collapsed Sidebar Icons */}
          {sidebarCollapsed && (
            <div className="hidden lg:flex flex-col items-center py-6 space-y-4">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Expand Sidebar"
              >
                <Upload className="h-6 w-6" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Documents"
              >
                <FileText className="h-6 w-6" />
              </button>
              {selectedDocument && (
                <div className="w-3 h-3 bg-green-500 rounded-full" title="Document Selected" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className={`
        flex-1 bg-white rounded-lg shadow flex flex-col
        ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'}
        transition-all duration-300
      `}>
        {!selectedDocument ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI-Powered PDF Q&A
              </h3>
              <p className="text-gray-600 max-w-md">
                Upload a PDF document to start asking questions. Our AI will analyze the content 
                and provide detailed answers based on the document.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="font-semibold text-gray-900">
                    Chat with: {selectedDocument.filename}
                  </h2>
                </div>
                <button
                  onClick={() => setChatHistory([])}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Clear Chat
                </button>
              </div>
            </div>

            {/* Sample Questions */}
            {chatHistory.length === 0 && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {getSampleQuestions().map((q, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestion(q)}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Start by asking a question about the document</p>
                </div>
              ) : (
                chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3/4 ${message.type === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                      {message.type === 'quiz' ? (
                        <div>
                          <div className="flex items-center mb-2">
                            <Sparkles className="h-4 w-4 mr-2" />
                            <span className="font-medium">Quiz Questions Generated</span>
                          </div>
                          <pre className="whitespace-pre-wrap text-sm">{message.content}</pre>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">Sources:</p>
                              {message.sources.map((source, idx) => (
                                <div key={idx} className="text-xs text-gray-600">
                                  Page {source.page}: "{source.text.substring(0, 100)}..."
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {isAsking && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Question Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Ask a question about the document..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isAsking}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isAsking}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAsking ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PDFQAPage;
