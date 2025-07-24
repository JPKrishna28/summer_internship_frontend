import React, { useState, useEffect } from 'react';
import { pdfQaService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import AudioPlayer from '../components/AudioPlayer';

const PodcastGeneratorPage = () => {
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState('');
    const [podcastType, setPodcastType] = useState('summary');
    const [customScript, setCustomScript] = useState('');
    const [voiceSettings, setVoiceSettings] = useState({
        voice_gender: 'NEUTRAL',
        language_code: 'en-US',
        speaking_rate: 1.0,
        pitch: 0.0
    });
    const [podcasts, setPodcasts] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [audioUrls, setAudioUrls] = useState({}); // Store audio blob URLs
    const [loadingAudio, setLoadingAudio] = useState({}); // Track audio loading state

    useEffect(() => {
        fetchDocuments();
        fetchPodcasts();
    }, []);

    const fetchDocuments = async () => {
        try {
            const documents = await pdfQaService.getDocuments();
            setDocuments(documents || []);
            console.log('Fetched documents:', documents); // Debug log
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Failed to load documents');
        }
    };

    const fetchPodcasts = async () => {
        try {
            const response = await pdfQaService.getPodcasts();
            setPodcasts(response.podcasts || []);
        } catch (error) {
            console.error('Error fetching podcasts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePodcast = async (e) => {
        e.preventDefault();
        
        if (!selectedDocument) {
            setError('Please select a document');
            return;
        }

        if (podcastType === 'custom' && !customScript.trim()) {
            setError('Please enter a custom script');
            return;
        }

        setIsGenerating(true);
        setError('');
        setSuccess('');

        try {
            const podcastData = {
                type: podcastType,
                custom_script: customScript,
                ...voiceSettings
            };

            const response = await pdfQaService.generatePodcast(selectedDocument, podcastData);
            
            if (response.audio_filename) {
                setSuccess(`Podcast generated successfully! Duration: ~${Math.round(response.duration_estimate)} minutes`);
            } else {
                setSuccess(`Podcast script generated successfully! ${response.note || 'Audio generation unavailable.'}`);
            }
            
            // Refresh podcasts list
            await fetchPodcasts();
            
            // Reset form
            setCustomScript('');
            setPodcastType('summary');
            
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to generate podcast');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPodcast = async (podcastId, filename) => {
        try {
            const audioBlob = await pdfQaService.downloadPodcastAudio(podcastId);
            
            // Create download link
            const url = window.URL.createObjectURL(audioBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Download error:', error);
            setError('Failed to download podcast');
        }
    };

    const handleDeletePodcast = async (podcastId) => {
        if (!window.confirm('Are you sure you want to delete this podcast?')) {
            return;
        }

        try {
            await pdfQaService.deletePodcast(podcastId);
            setPodcasts(podcasts.filter(p => p._id !== podcastId));
            
            // Clean up audio URL if it exists
            if (audioUrls[podcastId]) {
                URL.revokeObjectURL(audioUrls[podcastId]);
                setAudioUrls(prev => {
                    const newUrls = { ...prev };
                    delete newUrls[podcastId];
                    return newUrls;
                });
            }
            
            setSuccess('Podcast deleted successfully');
        } catch (error) {
            setError('Failed to delete podcast');
        }
    };

    const loadAudioForPlayback = async (podcastId) => {
        // If audio URL already exists, don't reload
        if (audioUrls[podcastId]) return;

        setLoadingAudio(prev => ({ ...prev, [podcastId]: true }));
        
        try {
            const audioBlob = await pdfQaService.getPodcastAudioBlob(podcastId);
            const audioUrl = URL.createObjectURL(audioBlob);
            
            setAudioUrls(prev => ({ ...prev, [podcastId]: audioUrl }));
        } catch (error) {
            console.error('Failed to load audio for playback:', error);
            setError('Failed to load audio for playback');
        } finally {
            setLoadingAudio(prev => ({ ...prev, [podcastId]: false }));
        }
    };

    // Clean up audio URLs on unmount
    useEffect(() => {
        return () => {
            Object.values(audioUrls).forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [audioUrls]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (minutes) => {
        if (minutes < 1) return '< 1 min';
        return `~${Math.round(minutes)} min`;
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Podcast Generator</h1>
                <p className="text-gray-600">
                    Convert your documents into AI-generated podcasts for audio learning
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Podcast Generation Form */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-3 mr-4">
                            <span className="text-white text-2xl">🎙️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Generate New Podcast</h2>
                    </div>
                    
                    <form onSubmit={handleGeneratePodcast} className="space-y-4">
                        {/* Document Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Document ({documents.length} available)
                            </label>
                            <select
                                value={selectedDocument}
                                onChange={(e) => setSelectedDocument(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Choose a document...</option>
                                {documents.map((doc) => (
                                    <option key={doc._id} value={doc._id}>
                                        {doc.filename}
                                    </option>
                                ))}
                            </select>
                            {documents.length === 0 && (
                                <p className="mt-1 text-sm text-red-600">
                                    No documents found. Please upload a PDF document first in the PDF Q&A section.
                                </p>
                            )}
                        </div>

                        {/* Podcast Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Podcast Type
                            </label>
                            <select
                                value={podcastType}
                                onChange={(e) => setPodcastType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="summary">AI Summary (Recommended)</option>
                                <option value="full_text">Full Document</option>
                                <option value="custom">Custom Script</option>
                            </select>
                        </div>

                        {/* Custom Script */}
                        {podcastType === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom Script
                                </label>
                                <textarea
                                    value={customScript}
                                    onChange={(e) => setCustomScript(e.target.value)}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your custom podcast script..."
                                />
                            </div>
                        )}

                        {/* Voice Settings */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-3">Voice Settings</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Voice Gender
                                    </label>
                                    <select
                                        value={voiceSettings.voice_gender}
                                        onChange={(e) => setVoiceSettings({
                                            ...voiceSettings,
                                            voice_gender: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="NEUTRAL">Neutral</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Language
                                    </label>
                                    <select
                                        value={voiceSettings.language_code}
                                        onChange={(e) => setVoiceSettings({
                                            ...voiceSettings,
                                            language_code: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="en-US">English (US)</option>
                                        <option value="en-GB">English (UK)</option>
                                        <option value="en-AU">English (AU)</option>
                                        <option value="fr-FR">French</option>
                                        <option value="es-ES">Spanish</option>
                                        <option value="de-DE">German</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Speaking Rate: {voiceSettings.speaking_rate}x
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={voiceSettings.speaking_rate}
                                        onChange={(e) => setVoiceSettings({
                                            ...voiceSettings,
                                            speaking_rate: parseFloat(e.target.value)
                                        })}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pitch: {voiceSettings.pitch > 0 ? '+' : ''}{voiceSettings.pitch}
                                    </label>
                                    <input
                                        type="range"
                                        min="-10"
                                        max="10"
                                        step="1"
                                        value={voiceSettings.pitch}
                                        onChange={(e) => setVoiceSettings({
                                            ...voiceSettings,
                                            pitch: parseFloat(e.target.value)
                                        })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isGenerating || !selectedDocument}
                            className={`
                                w-full py-3 px-6 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center
                                ${isGenerating 
                                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed' 
                                    : !selectedDocument
                                        ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:shadow-xl transform hover:scale-105 active:scale-100'
                                }
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    <span>🎙️ Generating Podcast...</span>
                                </>
                            ) : (
                                <>
                                    <span className="mr-2">🎙️</span>
                                    Generate Podcast
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Podcasts List */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-3 mr-4">
                            <span className="text-white text-2xl">🎧</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Your Podcasts</h2>
                    </div>
                    
                    {podcasts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎧</div>
                            <p className="text-gray-500 text-lg mb-2">No podcasts generated yet</p>
                            <p className="text-gray-400">Create your first podcast from a document!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {podcasts.map((podcast) => (
                                <div key={podcast._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            📄 {podcast.document_name}
                                        </h3>
                                        <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                            {podcast.podcast_type}
                                        </span>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                                        <p>⏱️ Duration: {formatDuration(podcast.duration_estimate)}</p>
                                        <p>🎤 Voice: {podcast.voice_settings.voice_gender.toLowerCase()}, {podcast.voice_settings.language_code}</p>
                                        <p>📅 Created: {formatDate(podcast.created_at)}</p>
                                        {!podcast.audio_filename && (
                                            <p className="text-amber-600 font-medium">📝 Script only - Audio generation unavailable</p>
                                        )}
                                    </div>

                                    {/* Audio Player Section */}
                                    {podcast.audio_filename && (
                                        <div className="mb-4">
                                            {audioUrls[podcast._id] ? (
                                                <AudioPlayer 
                                                    audioUrl={audioUrls[podcast._id]}
                                                    title={`🎙️ ${podcast.document_name}`}
                                                    className="mb-2"
                                                />
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    <button
                                                        onClick={() => loadAudioForPlayback(podcast._id)}
                                                        disabled={loadingAudio[podcast._id]}
                                                        className={`
                                                            w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                                                            ${loadingAudio[podcast._id] 
                                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                                                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg'
                                                            }
                                                        `}
                                                    >
                                                        {loadingAudio[podcast._id] ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                                                                Loading Audio...
                                                            </>
                                                        ) : (
                                                            <>
                                                                🎵 Load Audio Player
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex space-x-3">
                                        {podcast.audio_filename ? (
                                            <button
                                                onClick={() => handleDownloadPodcast(podcast._id, podcast.audio_filename)}
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                                            >
                                                📥 Download Audio
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(podcast.script_text || 'Script not available');
                                                    setSuccess('Script copied to clipboard!');
                                                }}
                                                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                                            >
                                                📋 Copy Script
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeletePodcast(podcast._id)}
                                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PodcastGeneratorPage;
