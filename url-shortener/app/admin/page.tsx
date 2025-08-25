"use client"
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  Link, 
  Settings,
  TrendingUp,
  Eye,
  Calendar,
  Search,
  MousePointer,
  Copy,
  ExternalLink,
  BarChart3,
  Users,
  Clock,
  ArrowLeft,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation'; // Ensure this is included

interface ShortenedLink {
  id: string;
  title: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: Date;
  lastClicked?: Date;
}

interface Analytics {
  totalUrls: number;
  totalClicks: number;
  avgClicks: number;
  todaysUrls: number;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter(); // Initialize router here
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState<Analytics>({ totalUrls: 0, totalClicks: 0, avgClicks: 0, todaysUrls: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch analytics and data from backend
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Determine the backend URL
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        
        // Fetch all URLs from backend
        const response = await fetch(`${backendUrl}/admin/urls`);
        if (!response.ok) {
          throw new Error(`Failed to fetch URLs: ${response.status} ${response.statusText}`);
        }
        
        const fetchedLinks = await response.json();
        
        // Transform the data to match our interface
        const transformedLinks: ShortenedLink[] = fetchedLinks.map((link: any) => ({
          id: link._id,
          title: link.title,
          originalUrl: link.originalUrl,
          shortCode: link.shortCode,
          clicks: link.clicks,
          createdAt: new Date(link.createdAt),
          lastClicked: link.lastClicked ? new Date(link.lastClicked) : undefined
        }));
        
        // Calculate analytics from fetched data
        const calculatedAnalytics: Analytics = {
          totalUrls: transformedLinks.length,
          totalClicks: transformedLinks.reduce((sum, link) => sum + link.clicks, 0),
          avgClicks: transformedLinks.length > 0 ? transformedLinks.reduce((sum, link) => sum + link.clicks, 0) / transformedLinks.length : 0,
          todaysUrls: transformedLinks.filter(link => {
            const today = new Date();
            const linkDate = new Date(link.createdAt);
            return linkDate.toDateString() === today.toDateString();
          }).length
        };

        setLinks(transformedLinks);
        setAnalytics(calculatedAnalytics);
      } catch (error) {
        console.error('Error fetching URLs:', error);
        // Set empty data on error
        setLinks([]);
        setAnalytics({ totalUrls: 0, totalClicks: 0, avgClicks: 0, todaysUrls: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter links based on search term
  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLinks = filteredLinks.slice(startIndex, startIndex + itemsPerPage);

  const copyToClipboard = async (shortCode: string, id?: string) => {
    try {
      // Use the same base URL logic as backend or get from environment
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const shortUrl = `${baseUrl}/${shortCode}`;
      await navigator.clipboard.writeText(shortUrl);
      
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
      
      // Optional: Show a toast notification that URL was copied
      // You can implement a toast system here if needed
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    delay: number;
  }> = ({ title, value, icon, color, delay }) => (
    <div 
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? (
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </div>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-12`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-left duration-500">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-12">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LinkLux</h1>
            <p className="text-sm text-gray-500">Premium URL Shortener</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-right duration-500">
          <button
            onClick={() => router.push('/shorten')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:bg-gray-100 rounded-lg transform hover:scale-105">
            <Link className="w-4 h-4" />
            <span className="font-medium">Shortener</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5">
            <BarChart3 className="w-4 h-4" />
            <span className="font-medium">Admin</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Admin Dashboard</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            Monitor and manage all shortened URLs with comprehensive analytics
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total URLs"
            value={analytics.totalUrls}
            icon={<Link className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            delay={100}
          />
          <StatCard
            title="Total Clicks"
            value={analytics.totalClicks}
            icon={<Eye className="w-6 h-6 text-white" />}
            color="bg-green-500"
            delay={200}
          />
          <StatCard
            title="Avg. Clicks"
            value={analytics.avgClicks.toFixed(1)}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            delay={300}
          />
          <StatCard
            title="Today's URLs"
            value={analytics.todaysUrls}
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="bg-orange-500"
            delay={400}
          />
        </div>

        {/* URLs Management Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom duration-700 delay-500 hover:shadow-2xl transition-all duration-300">
          {/* Section Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-blue-500 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-900">All Shortened URLs</h3>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search URLs..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300 focus:shadow-lg transform focus:scale-[1.02]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
                <Link className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-bounce" />
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No URLs Found</h4>
                <p className="text-gray-500">
                  {searchTerm ? 'No URLs match your search criteria' : 'Start by creating your first shortened URL'}
                </p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-100 bg-gray-50/50 font-semibold text-gray-700 text-sm">
                  <div className="col-span-2">Title</div>
                  <div className="col-span-5">Original URL</div>
                  <div className="col-span-2">Short Code</div>
                  <div className="col-span-1">Clicks</div>
                  <div className="col-span-2">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {paginatedLinks.map((link, index) => (
                    <div
                      key={link.id}
                      className="grid grid-cols-12 gap-4 p-6 hover:bg-blue-50/50 transition-all duration-300 group animate-in fade-in slide-in-from-left"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="col-span-2">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                          {link.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(link.createdAt)}
                        </p>
                      </div>
                      
                      <div className="col-span-5">
                        <p className="text-sm text-gray-600 truncate group-hover:text-gray-800 transition-colors duration-200">
                          {link.originalUrl}
                        </p>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-mono bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors duration-200">
                          /{link.shortCode}
                        </span>
                      </div>
                      
                      <div className="col-span-1">
                        <div className="flex items-center space-x-1">
                          <MousePointer className="w-3 h-3 text-gray-500" />
                          <span className="font-semibold text-gray-900">{link.clicks}</span>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => copyToClipboard(link.shortCode, link.id)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                            title="Copy short URL"
                          >
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => window.open(link.originalUrl, '_blank')}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95 hover:rotate-12"
                            title="Open original URL"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/30">
                    <p className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLinks.length)} of {filteredLinks.length} URLs
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center space-x-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 transform hover:scale-110 ${
                              currentPage === page
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center space-x-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 py-8 border-t border-gray-200 animate-in fade-in duration-700 delay-700">
          <p className="text-gray-500">
            Built with elegance • LinkLux © 2024
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;