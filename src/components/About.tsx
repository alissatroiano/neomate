import React from 'react';
import { Award, Users, Stethoscope, Timer, Brain, Database } from 'lucide-react';

const stats = [
  { number: '10,000+', label: 'Families Supported', icon: Users },
  { number: '24/7', label: 'Available Support', icon: Timer},
  { number: '95%', label: 'Satisfaction Rate', icon: Award },
  { number: '50+', label: 'Medical Experts', icon: Stethoscope }
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-teal-100 to-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Built by Experts,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600 block font-script">
                  Designed for Families
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Neomate AI assistant provides guidance, advice, and resources for families during neonatal hospitalization. Neomate's advanced AI technology is designed to be a compassionate companion, offering personalized support and evidence-based information tailored to the unique needs of each family.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-cyan-500 to-teal-600 p-2 rounded-lg flex-shrink-0">
                  <img src="/favicon.png" alt="logo" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Empathetic Technology</h3>
                  <p className="text-gray-600">
                    Our AI is trained specifically to understand and respond to the emotional 
                    needs of families in neonatal care situations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-cyan-500 to-teal-600 p-2 rounded-lg flex-shrink-0">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Medical Accuracy</h3>
                  <p className="text-gray-600">
                    All information is reviewed by board-certified neonatologists 
                    and updated with the latest medical research.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-500 p-2 rounded-lg flex-shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Community Support</h3>
                  <p className="text-gray-600">
                    Connect with other families and share experiences in a safe, 
                    moderated environment when you're ready.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-1 gap-8">
            {/* 24/7 Support with Radial Timer */}
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center group hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="radial-timer">
                  <svg width="120" height="120">
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <circle 
                      className="radial-timer-circle"
                      cx="60" 
                      cy="60" 
                      r="52"
                    />
                    <circle 
                      className="radial-timer-progress"
                      cx="60" 
                      cy="60" 
                      r="52"
                    />
                  </svg>
                  <div className="radial-timer-center">
                    <Timer className="h-8 w-8 text-teal-600" />
                  </div>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600 font-medium mb-2">Always Available Support</div>
              <div className="text-sm text-gray-500">Text & Voice Chat Ready</div>
            </div>

            {/* AI/Data with Animated Data Visualization */}
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center group hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="data-visualization">
                  <div className="data-bars">
                    <div className="data-bar"></div>
                    <div className="data-bar"></div>
                    <div className="data-bar"></div>
                    <div className="data-bar"></div>
                    <div className="data-bar"></div>
                  </div>
                  <div className="data-center">
                    <Brain className="h-8 w-8 text-cyan-600" />
                  </div>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">AI</div>
              <div className="text-gray-600 font-medium mb-2">Evidence-Based Intelligence</div>
              <div className="text-sm text-gray-500">Powered by Medical Research</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}