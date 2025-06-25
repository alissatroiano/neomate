import React from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onGetStarted: () => void;
}

export default function Header({ isMobileMenuOpen, setIsMobileMenuOpen, onGetStarted }: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/favicon.png" 
              alt="Neomate" 
              className="h-12 w-12"
            />
            <div className="flex flex-col">
              <span className="text-4xl font-script text-teal-600">Neomate</span>
            
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Features</a>
            <a href="#about" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">About</a>
            <a href="#testimonials" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Stories</a>
            <a href="#contact" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Contact</a>
            <button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </nav>

          {/* Bolt Logo - Desktop/Tablet (right side) */}
          <div className="hidden md:block">
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img 
                src="/white_circle_360x360.png" 
                alt="Powered by Bolt" 
                className="w-12 h-12"
              />
            </a>
          </div>

          {/* Mobile: Bolt Logo and Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Bolt Logo - Mobile (top right) */}
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img 
                src="/white_circle_360x360.png" 
                alt="Powered by Bolt" 
                className="w-10 h-10"
              />
            </a>
            
            {/* Mobile Menu Button */}
            <button
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Features</a>
              <a href="#about" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">About</a>
              <a href="#testimonials" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Stories</a>
              <a href="#contact" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Contact</a>
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 w-full font-medium"
              >
                Get Started
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}