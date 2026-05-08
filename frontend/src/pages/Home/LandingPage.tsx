import { Link } from "react-router-dom";
import { ArrowRight, Rss, Star, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { type RootState } from "../../redux/store";

const LandingPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const isLoggedIn = !!user.userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white">

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-8">
          <Rss className="h-8 w-8 text-emerald-400" />
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          Hacker News,{" "}
          <span className="text-emerald-400">scraped & saved</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
          Top stories from the tech community — fetched, stored, and ready to read. Bookmark what matters, revisit anytime.
        </p>

        {/* CTAs */}
        {isLoggedIn ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/stories"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Browse Stories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/bookmarks"
              className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-semibold rounded-lg transition-colors duration-200"
            >
              <Star className="mr-2 h-4 w-4 text-emerald-400" />
              Your Bookmarks
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/stories"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Browse Stories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-semibold rounded-lg transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>
        )}
      </section>

      {/* How it works — 3 steps */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              icon: <Rss className="h-5 w-5 text-emerald-400" />,
              title: "Scrape",
              desc: "Top 10 HN stories are fetched and stored in MongoDB automatically on server start or on demand.",
            },
            {
              step: "02",
              icon: <Zap className="h-5 w-5 text-emerald-400" />,
              title: "Browse",
              desc: "Stories sorted by points. Paginated, fast, and clean — no ads, no noise.",
            },
            {
              step: "03",
              icon: <Star className="h-5 w-5 text-emerald-400" />,
              title: "Bookmark",
              desc: "Save stories to your personal list. Accessible any time from your Bookmarks page.",
            },
          ].map(({ step, icon, title, desc }) => (
            <div
              key={step}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-emerald-500/40 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {step}
                </span>
                {icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;