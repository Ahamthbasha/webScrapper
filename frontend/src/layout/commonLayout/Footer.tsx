import {Globe, Mail, } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-400">
              © {currentYear} WebScraper Pro. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Smart data extraction for the modern web
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Built</span>
            <span>by</span>
            <span className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Ahamathbasha
            </span>
          </div>

          <div className="flex space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-emerald-400 transition-all duration-200 transform hover:scale-110"
              aria-label="GitHub"
            >
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-emerald-400 transition-all duration-200 transform hover:scale-110"
              aria-label="LinkedIn"
            >
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-emerald-400 transition-all duration-200 transform hover:scale-110"
              aria-label="Twitter"
            >
            </a>

            <a
              href="mailto:contact@webscraperpro.com"
              className="text-gray-400 hover:text-emerald-400 transition-all duration-200 transform hover:scale-110"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-6">
            <a href="/privacy" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">
              Terms of Service
            </a>
            <a href="/docs" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">
              API Documentation
            </a>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Globe className="h-3 w-3" />
            <span>Supporting 1000+ websites</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;