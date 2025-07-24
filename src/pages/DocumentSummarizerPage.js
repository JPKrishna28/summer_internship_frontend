import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Upload, 
  FileText, 
  BookOpen,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  Brain,
  Sparkles,
  Eye,
  Copy,
  Check,
  Filter,
  Clock,
  Target,
  List,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { pdfQaService } from '../services';

const DocumentSummarizerPage = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [summaryType, setSummaryType] = useState('comprehensive');
  const [focusArea, setFocusArea] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch uploaded documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery(
    'pdf-documents',
    pdfQaService.getDocuments
  );

  // Fetch user summaries
  const { data: summaries = [], isLoading: summariesLoading } = useQuery(
    'user-summaries',
    pdfQaService.getSummaries
  );

  // Upload mutation
  const uploadMutation = useMutation(pdfQaService.uploadPdf, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('pdf-documents');
      toast.success('Document uploaded successfully!');
      // Handle backend response structure
      if (data.document_id) {
        const documentObj = {
          _id: data.document_id,
          filename: data.filename,
          num_chunks: data.num_chunks,
          text_preview: data.text_preview
        };
        setSelectedDocument(documentObj);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to upload document');
    }
  });

  // Delete summary mutation
  const deleteSummaryMutation = useMutation(pdfQaService.deleteSummary, {
    onSuccess: () => {
      queryClient.invalidateQueries('user-summaries');
      toast.success('Summary deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete summary');
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

    uploadMutation.mutate(file);
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

  // Generate summary
  const handleGenerateSummary = async () => {
    if (!selectedDocument) {
      toast.error('Please select a document first');
      return;
    }

    setIsGenerating(true);
    try {
      const options = {
        type: summaryType,
        focus_area: focusArea
      };

      const response = await pdfQaService.summarizeDocument(selectedDocument._id, options);
      
      setGeneratedSummary({
        ...response,
        document_name: selectedDocument.filename,
        created_at: new Date().toISOString()
      });

      queryClient.invalidateQueries('user-summaries');
      toast.success('Summary generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate summary');
    }
    setIsGenerating(false);
  };

  // Copy summary to clipboard
  const handleCopySummary = async (summaryText, summaryId) => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(summaryId);
      toast.success('Summary copied to clipboard!');
      setTimeout(() => setCopiedSummary(null), 2000);
    } catch (err) {
      toast.error('Failed to copy summary');
    }
  };

  // Summary type options
  const summaryTypes = [
    {
      value: 'comprehensive',
      label: 'Comprehensive',
      description: 'Detailed overview with all key points',
      icon: BookOpen,
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800'
    },
    {
      value: 'brief',
      label: 'Brief',
      description: 'Quick 3-4 sentence summary',
      icon: Clock,
      borderColor: 'border-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-800'
    },
    {
      value: 'bullet_points',
      label: 'Bullet Points',
      description: 'Organized list format for easy reading',
      icon: List,
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800'
    },
    {
      value: 'key_concepts',
      label: 'Key Concepts',
      description: 'Important terms and definitions',
      icon: Lightbulb,
      borderColor: 'border-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      badgeBg: 'bg-yellow-100',
      badgeText: 'text-yellow-800'
    },
    {
      value: 'exam_prep',
      label: 'Exam Preparation',
      description: 'Study guide with potential questions',
      icon: GraduationCap,
      borderColor: 'border-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800'
    }
  ];

  const getTypeColors = (type) => {
    const typeObj = summaryTypes.find(t => t.value === type);
    return typeObj || {
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-800'
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Summarizer</h1>
            <p className="text-gray-600 mt-1">
              Upload PDFs and generate AI-powered summaries for efficient studying
            </p>
          </div>
          <Brain className="h-8 w-8 text-primary-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Upload & Documents */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>
              
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
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Documents</h2>
              
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
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedDocument?._id === doc._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm truncate">
                            {doc.filename}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary Configuration */}
          <div className="space-y-6">
            {/* Summary Configuration */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary Configuration</h2>
              
              {/* Summary Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {summaryTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        summaryType === type.value
                          ? `${type.borderColor} ${type.bgColor}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="summaryType"
                        value={type.value}
                        checked={summaryType === type.value}
                        onChange={(e) => setSummaryType(e.target.value)}
                        className="sr-only"
                      />
                      <type.icon className={`h-5 w-5 mr-3 ${type.textColor}`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Focus Area */}
              <div className="mb-4">
                <label htmlFor="focusArea" className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Area (Optional)
                </label>
                <input
                  type="text"
                  id="focusArea"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g., 'machine learning algorithms', 'historical events'..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specify a topic to focus the summary on specific content
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateSummary}
                disabled={!selectedDocument || isGenerating}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Summary
                  </>
                )}
              </button>
            </div>

            {/* Generated Summary */}
            {generatedSummary && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Generated Summary</h3>
                  <button
                    onClick={() => handleCopySummary(generatedSummary.summary, 'current')}
                    className="flex items-center text-gray-500 hover:text-gray-700 text-sm"
                  >
                    {copiedSummary === 'current' ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copy
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColors(generatedSummary.summary_type).badgeBg} ${getTypeColors(generatedSummary.summary_type).badgeText}`}>
                      {summaryTypes.find(t => t.value === generatedSummary.summary_type)?.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {generatedSummary.summary}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Previous Summaries */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Previous Summaries</h2>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>

        {summariesLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading summaries...</p>
          </div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No summaries generated yet</p>
            <p className="text-sm text-gray-500">Upload a document and generate your first summary</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries.map((summary) => (
              <div key={summary._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                      {summary.document_name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColors(summary.summary_type).badgeBg} ${getTypeColors(summary.summary_type).badgeText}`}>
                      {summaryTypes.find(t => t.value === summary.summary_type)?.label}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleCopySummary(summary.summary_text, summary._id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Copy Summary"
                    >
                      {copiedSummary === summary._id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this summary?')) {
                          deleteSummaryMutation.mutate(summary._id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete Summary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                  {summary.summary_text.substring(0, 150)}...
                </p>
                
                <p className="text-xs text-gray-500">
                  {new Date(summary.created_at).toLocaleDateString()} at{' '}
                  {new Date(summary.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSummarizerPage;
