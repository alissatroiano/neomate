import React from 'react';
import { ArrowRight, Baby, Shield, Stethoscope } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-warm-500 via-primary-500 to-accent-600 py-20 relative overflow-hidden">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-warm-400/20 via-transparent to-accent-500/20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/90 text-warm-800 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                <span>Trusted Healthcare AI</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-light text-white leading-tight">
                Your Caring
                <span className="text-white/95 block font-script text-5xl lg:text-7xl">
                  AI Companion
                </span>
                for Neonatal Care
              </h1>
              <p className="text-xl text-white/90 font-light leading-relaxed">
                Neomate provides 24/7 therapeutic support and evidence-based information
                to help you navigate the challenging journey of neonatal hospitalization
                with confidence and peace of mind.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="bg-white text-warm-700 px-8 py-4 rounded-lg hover:bg-white/95 transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl font-semibold"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => window.location.href = '#about'}
                className="border-2 border-white/80 text-white px-8 py-4 rounded-lg hover:bg-white/10 hover:border-white transition-colors font-semibold backdrop-blur-sm"
              >
                Learn More
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-white/80" />
                <span className="text-sm text-white/80 font-bold">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Baby className="h-5 w-5 text-white/80" />
                <span className="text-sm font-bold text-white/80">NICU Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-white/80" />
                <span className="text-sm text-white/80 font-bold">Evidence-Based</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-white/95 to-white/85 rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm shadow-2xl">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/favicon.png"
                      alt="Neomate AI"
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-warm-800 font-script text-lg">Neomate AI</p>
                      <p className="text-sm text-warm-600">Always here for you</p>
                    </div>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-4 border border-warm-200">
                    <p className="text-warm-800 text-sm leading-relaxed">
                      "I understand this is a difficult time. Your baby's vital signs
                      are stable, and the medical team is taking excellent care.
                      Would you like me to explain what the monitors mean?"
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => window.location.href = '#about'}
                      className="bg-gradient-to-r from-warm-500 to-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:from-warm-600 hover:to-primary-700 transition-all duration-300"
                    >
                      Tell me more
                    </button>
                    <button 
                      onClick={onGetStarted}
                      className="bg-warm-100 text-warm-700 px-4 py-2 rounded-lg text-sm hover:bg-warm-200 transition-colors"
                    >
                      I need support
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg">
                <Baby className="h-6 w-6 text-warm-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg">
                <img
                  src="/favicon.png"
                  alt="Heart"
                  className="h-6 w-6 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}