import { useState, useEffect } from 'react';
import { getBookmarks, type Story, toggleBookmark } from '../../api/action/userAction';
import { toast } from 'react-toastify';
import { ExternalLink, Clock, User, Star, Bookmark as BookmarkIcon, Loader } from 'lucide-react';

const BookmarksPage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Route is already protected by UserPrivateRoute — no isLoggedIn check needed
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const response = await getBookmarks(page, 10);
        if (!cancelled && response.success) {
          setStories(response.data.stories);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching bookmarks:', error);
          toast.error('Failed to load bookmarks');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [page]);

  const handleRemoveBookmark = async (storyId: string) => {
    try {
      setRemovingId(storyId);
      const response = await toggleBookmark(storyId);
      if (response.success && !response.data.bookmarked) {
        setStories(prev => prev.filter(s => s._id !== storyId));
        toast.success('Bookmark removed');
        // If this was the last item on a non-first page, go back
        if (stories.length === 1 && page > 1) {
          setPage(p => p - 1);
        }
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    } finally {
      setRemovingId(null);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Bookmarks</h1>
          <p className="text-gray-400">Stories you've saved for later reading</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <BookmarkIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No bookmarks yet</h3>
            <p className="text-gray-400">Start bookmarking stories from the Stories page</p>
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
                          #{index + 1 + (page - 1) * 10}
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

                    <button
                      onClick={() => handleRemoveBookmark(story._id)}
                      disabled={removingId === story._id}
                      className="ml-4 p-2 rounded-lg hover:bg-red-500/10 transition-colors group disabled:opacity-50"
                      title="Remove bookmark"
                    >
                      {removingId === story._id ? (
                        <Loader className="h-6 w-6 animate-spin text-gray-400" />
                      ) : (
                        <Star className="h-6 w-6 fill-emerald-500 text-emerald-500 group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
                      )}
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

export default BookmarksPage;