import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/neomate_logo.png" 
                alt="Neomate" 
                className="h-8 w-8"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-script text-teal-400">Neomate</span>
                <span className="text-xs text-teal-300 uppercase tracking-wider font-light -mt-1">
                  Neonatal AI Assistant
                </span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Providing compassionate AI support for families navigating 
              neonatal care and hospitalization.
            </p>
            <div className="flex space-x-4">
              <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <img src="/neomate_logo.png" alt="Heart" className="h-5 w-5" />
              </div>
              <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <Mail className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <a href="#features" className="block text-gray-400 hover:text-teal-400 transition-colors">Features</a>
              <a href="#about" className="block text-gray-400 hover:text-teal-400 transition-colors">About Us</a>
              <a href="#testimonials" className="block text-gray-400 hover:text-teal-400 transition-colors">Success Stories</a>
              <a href="#contact" className="block text-gray-400 hover:text-teal-400 transition-colors">Contact</a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <div className="space-y-2">
              <a href="https://www.mmhla.org/nicu-resources-for-parents" target="_blank" className="block text-gray-400 hover:text-teal-400 transition-colors">Support Groups</a>
              <a href="https://nicuconnections.com/wp-content/uploads/2023/12/nicu-family-guide-en.pdf" target="_blank" className="block text-gray-400 hover:text-teal-400 transition-colors">NICU Guide</a>
              <a href="https://www.marchofdimes.org/" target="_blank" className="block text-gray-400 hover:text-teal-400 transition-colors">Give Back</a>
              <a href="#about" className="block text-gray-400 hover:text-teal-400 transition-colors">FAQ</a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4" id='contact'>
            <h3 className="text-lg font-semibold">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-teal-400" />
                <span className="text-gray-400">support@neomate.ai</span>
              </div>
             
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-teal-400" />
                <span className="text-gray-400">Available Nationwide</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Neomate. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}