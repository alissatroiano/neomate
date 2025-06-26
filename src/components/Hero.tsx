import React from 'react';
import { ArrowRight, Baby, Shield, Stethoscope } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="bg-gradient-to-r from-teal-600 to-cyan-700 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium">
                <Shield className="h-4 w-4" />
                <span>Trusted Healthcare AI</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-light text-gray-900 leading-tight">
                Your Caring
                <span className="text-white bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600 block font-script">
                  AI Companion
                </span>
                for Neonatal Care
              </h1>
              <p className="text-xl text-gray-200 font-light leading-relaxed">
                Neomate provides 24/7 therapeutic support and evidence-based information
                to help you navigate the challenging journey of neonatal hospitalization
                with confidence and peace of mind.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-4 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl"
              >
                <span className="font-semibold">Start Your Journey</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => window.location.href = '#about'}
                className="border border-gray-300 text-gray-300 px-8 py-4 rounded-lg hover:bg-gray-50 hover:text-gray-600 transition-colors font-semibold"
              >
                Learn More
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-cyan-200" />
                <span className="text-sm text-gray-200 font-bold">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Baby className="h-5 w-5 text-teal-200" />
                <span className="text-sm font-bold text-gray-200">NICU Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-cyan-200" />
                <span className="text-sm text-gray-200 font-bold">Evidence-Based</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-teal-100 to-cyan-200 rounded-3xl p-8 relative overflow-hidden">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/favicon.png"
                      alt="Neomate AI"
                      className="h-8 w-8"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 font-script text-lg">Neomate AI</p>
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
                    <button 
                    onClick={() => window.location.href = '#about'}
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm">
                      Tell me more
                    </button>
                    <button 
                    onClick={onGetStarted}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
                      I need support
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg">
                <Baby className="h-6 w-6 text-teal-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg">
                <img
                  src="/favicon.png"
                  alt="Heart"
                  className="h-6 w-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}