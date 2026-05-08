import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import { getAllStories, toggleBookmark, scrapeStories, getBookmarks, type Story } from '../../api/action/userAction';
import { toast } from 'react-toastify';
import { RefreshCw, ExternalLink, Clock, User, Star, Loader } from 'lucide-react';

const StoriesPage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarkedStories, setBookmarkedStories] = useState<Set<string>>(new Set());

  const isLoggedIn = useSelector((state: RootState) => !!state.user.userId);
  const navigate = useNavigate();
  
  const ITEMS_PER_PAGE = 10; // Changed from 20 to 10

  // Effect 1 — load paginated stories (public, no auth needed)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const response = await getAllStories(page, ITEMS_PER_PAGE);
        if (!cancelled && response.success) {
          setStories(response.data.stories);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching stories:', error);
          toast.error('Failed to load stories');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [page]);

  // Combined effect — fetch bookmarked IDs when logged in OR clear when logged out
  useEffect(() => {
    let cancelled = false;

    const loadBookmarkStatuses = async () => {
      // If user is not logged in, clear bookmarks and return early
      if (!isLoggedIn) {
        setBookmarkedStories(new Set());
        return;
      }

      try {
        const response = await getBookmarks(1, 100);
        if (!cancelled && response.success) {
          const ids = new Set<string>(response.data.stories.map((s: Story) => s._id));
          setBookmarkedStories(ids);
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching bookmark statuses:', error);
      }
    };

    loadBookmarkStatuses();
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  const handleScrape = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to scrape stories');
      return;
    }
    
    try {
      setScraping(true);
      const response = await scrapeStories();
      if (response.success) {
        toast.success(response.message);
        setPage(1);
      }
    } catch (error) {
      console.error('Error scraping stories:', error);
      toast.error('Failed to scrape stories');
    } finally {
      setScraping(false);
    }
  };

  const handleBookmark = async (storyId: string) => {
    // Not logged in — redirect to login instead of showing a toast
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const response = await toggleBookmark(storyId);
      if (response.success) {
        if (response.data.bookmarked) {
          setBookmarkedStories(prev => new Set([...prev, storyId]));
          toast.success('Story bookmarked');
        } else {
          setBookmarkedStories(prev => {
            const next = new Set(prev);
            next.delete(storyId);
            return next;
          });
          toast.success('Bookmark removed');
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to toggle bookmark');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Hacker News Stories</h1>
            <p className="text-gray-400">Top stories from the tech community</p>
          </div>

          {/* Scrape button — only for logged-in users */}
          {isLoggedIn && (
            <button
              onClick={handleScrape}
              disabled={scraping}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {scraping ? (
                <Loader className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-5 w-5 mr-2" />
              )}
              {scraping ? 'Scraping...' : 'Scrape Latest'}
            </button>
          )}
        </div>

        {/* Guest notice */}
        {!isLoggedIn && (
          <div className="mb-6 px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-gray-400 flex items-center justify-between">
            <span>Login to bookmark stories and scrape the latest updates.</span>
            <a
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-medium ml-4 whitespace-nowrap"
            >
              Sign in →
            </a>
          </div>
        )}

        {/* Stories List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              {isLoggedIn
                ? 'No stories yet. Click "Scrape Latest" to load stories.'
                : 'No stories available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {stories.map((story, index) => (
                <div
                  key={story._id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 hover:border-emerald-500/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-bold text-emerald-500">
                          #{index + 1 + (page - 1) * ITEMS_PER_PAGE}
                        </span>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                          {story.points} points
                        </span>
                      </div>

                      <a
                        href={story.url || `https://news.ycombinator.com/item?id=${story.storyId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold text-white hover:text-emerald-400 transition-colors inline-flex items-center group"
                      >
                        {story.title}
                        <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>

                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{story.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(story.postedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bookmark button — visible to all, redirects guests to login */}
                    <button
                      onClick={() => handleBookmark(story._id)}
                      className="ml-4 p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                      title={isLoggedIn
                        ? (bookmarkedStories.has(story._id) ? 'Remove bookmark' : 'Bookmark story')
                        : 'Login to bookmark'}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          isLoggedIn && bookmarkedStories.has(story._id)
                            ? 'fill-emerald-500 text-emerald-500'
                            : 'text-gray-500 group-hover:text-emerald-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoriesPage;