import React from 'react';
import { ArrowRight, Baby, Heart, Shield } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <Shield className="h-4 w-4" />
                <span>Trusted Healthcare AI</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Caring
                <span className="text-blue-600 block">AI Companion</span>
                for Neonatal Care
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Neomate provides 24/7 therapeutic support and evidence-based information 
                to help you navigate the challenging journey of neonatal hospitalization 
                with confidence and peace of mind.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <span className="font-semibold">Start Your Journey</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                Watch Demo
              </button>
            </div>

            {/* Powered by Bolt Badge */}
            <div className="flex justify-center sm:justify-start">
              <a 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors group border border-gray-200"
              >
                <img 
                  src="/white_circle_360x360.png" 
                  alt="Powered by Bolt" 
                  className="w-6 h-6"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 font-medium">
                  Powered by Bolt
                </span>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-600">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Baby className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">NICU Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">Evidence-Based</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-8 relative overflow-hidden">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Neomate AI</p>
                      <p className="text-sm text-gray-600">Always here for you</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      "I understand this is a difficult time. Your baby's vital signs 
                      are stable, and the medical team is taking excellent care. 
                      Would you like me to explain what the monitors mean?"
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                      Tell me more
                    </button>
                    <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
                      I need support
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg">
                <Baby className="h-6 w-6 text-blue-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}