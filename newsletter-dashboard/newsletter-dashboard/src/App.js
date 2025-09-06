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
      'AI/ML': 'bg-blue-100 text-blue-800',
      'Security': 'bg-red-100 text-red-800',
      'Quantum': 'bg-purple-100 text-purple-800',
      'CleanTech': 'bg-green-100 text-green-800',
      'Space': 'bg-indigo-100 text-indigo-800',
      'Tech': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clientInfo.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Next publication: {clientInfo.nextPublish}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {selectedArticles.size} of {articles.length} selected
                </div>
                <button
                  onClick={handleGenerateNewsletter}
                  disabled={selectedArticles.size === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Generate Newsletter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Clock className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
            <p className="text-gray-600">Articles will appear here once your automation runs.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const isSelected = selectedArticles.has(article.id);
              return (
                <div
                  key={article.id}
                  className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleArticle(article.id)}
                >
                  <div className="p-6">
                    {/* Selection Indicator & Category */}
                    <div className="flex items-start justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {article.category || 'General'}
                      </span>
                      {isSelected ? (
                        <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Headline */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                      {article.headline}
                    </h3>

                    {/* Summary */}
                    {article.summary && (
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {article.summary}
                      </p>
                    )}

                    {/* Key Takeaway */}
                    {article.keyTakeaway && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-yellow-800 mb-1">KEY TAKEAWAY</p>
                        <p className="text-sm text-yellow-900">{article.keyTakeaway}</p>
                      </div>
                    )}

                    {/* TL;DR */}
                    {article.tldr && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-green-800 mb-1">TL;DR</p>
                        <p className="text-sm text-green-900">{article.tldr}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(article.createdTime)}
                      </div>
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
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
