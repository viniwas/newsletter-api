import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ExternalLink, Clock, Tag, Zap } from 'lucide-react';

const API_BASE_URL = 'https://newsletter-api-production-fa88.up.railway.app';

const NewsletterDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientInfo, setClientInfo] = useState({
    name: "Tech Weekly",
    nextPublish: "Friday, Sep 8, 2025"
  });

  // Fetch real articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/articles/tech_weekly`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.articles) {
          // Transform the data to match our component's expected format
          const transformedArticles = data.articles.map(article => ({
            id: article.id,
            headline: article.headline,
            summary: article.summary,
            keyTakeaway: article.key_takeaway,
            tldr: article.tldr,
            category: article.category,
            url: article.url,
            createdTime: article.created_time
          }));
          setArticles(transformedArticles);
        } else {
          setArticles([]);
        }
        setError(null);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        setError('Failed to load articles. Please try again later.');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const toggleArticle = (articleId) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const handleGenerateNewsletter = async () => {
    if (selectedArticles.size === 0) {
      alert('Please select at least one article before generating the newsletter.');
      return;
    }

    const selectedIds = Array.from(selectedArticles);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'tech_weekly',
          selected_article_ids: selectedIds,
          webhook_url: 'YOUR_MAKE_WEBHOOK_URL' // You'll replace this with your actual Make.com webhook
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Newsletter generation started with ${selectedIds.length} articles!`);
        // Optionally clear selections after successful submission
        setSelectedArticles(new Set());
      } else {
        alert('Failed to generate newsletter. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter generation error:', error);
      alert('Error generating newsletter. Please check your connection.');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'AI/ML': 'bg-blue-100 text-blue-800 border-blue-200',
      'Security': 'bg-red-100 text-red-800 border-red-200',
      'Quantum': 'bg-purple-100 text-purple-800 border-purple-200',
      'CleanTech': 'bg-green-100 text-green-800 border-green-200',
      'Space': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Tech': 'bg-gray-100 text-gray-800 border-gray-200',
      'General': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Unknown time';
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      return 'Unknown time';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Articles</h3>
          <p className="text-gray-600">Fetching the latest content for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 mb-4">
            <Clock className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{clientInfo.name}</h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Next publication: {clientInfo.nextPublish}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedArticles.size}</div>
                  <div className="text-xs text-gray-500">of {articles.length} selected</div>
                </div>
                <button
                  onClick={handleGenerateNewsletter}
                  disabled={selectedArticles.size === 0}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  <Zap className="w-5 h-5" />
                  <span>Generate Newsletter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <div className="text-gray-400 mb-6">
                <Clock className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Articles Yet</h3>
              <p className="text-gray-600">Articles will appear here once your automation runs and processes new content.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const isSelected = selectedArticles.has(article.id);
              return (
                <div
                  key={article.id}
                  className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-2xl transform hover:-translate-y-2 ${
                    isSelected ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-2xl scale-105' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleArticle(article.id)}
                >
                  <div className="p-6">
                    {/* Selection Indicator & Category */}
                    <div className="flex items-start justify-between mb-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getCategoryColor(article.category)}`}>
                        <Tag className="w-3 h-3 mr-1.5" />
                        {article.category || 'General'}
                      </span>
                      <div className={`p-1 rounded-full transition-all duration-200 ${isSelected ? 'bg-blue-500' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        {isSelected ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight hover:text-blue-700 transition-colors">
                      {article.headline}
                    </h3>

                    {/* Summary */}
                    {article.summary && (
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    )}

                    {/* Key Takeaway */}
                    {article.keyTakeaway && (
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 rounded-lg p-4 mb-4">
                        <p className="text-xs font-bold text-yellow-800 mb-2 uppercase tracking-wide">💡 Key Takeaway</p>
                        <p className="text-sm text-yellow-900 font-medium">{article.keyTakeaway}</p>
                      </div>
                    )}

                    {/* TL;DR */}
                    {article.tldr && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400 rounded-lg p-4 mb-4">
                        <p className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wide">⚡ TL;DR</p>
                        <p className="text-sm text-green-900 font-medium">{article.tldr}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {formatTime(article.createdTime)}
                      </div>
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center hover:underline transition-colors"
                        >
                          Read source
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterDashboard;
