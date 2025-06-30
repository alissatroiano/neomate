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
                  <div className="radial-timer-half"></div>
                  <div className="radial-timer-half"></div>
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
                    <div className="data-bar" style={{ animationDelay: '0s' }}></div>
                    <div className="data-bar" style={{ animationDelay: '0.2s' }}></div>
                    <div className="data-bar" style={{ animationDelay: '0.4s' }}></div>
                    <div className="data-bar" style={{ animationDelay: '0.6s' }}></div>
                    <div className="data-bar" style={{ animationDelay: '0.8s' }}></div>
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

      <style jsx>{`
        .radial-timer {
          position: relative;
          height: 120px;
          width: 120px;
          overflow: hidden;
        }

        .radial-timer-half {
          height: 120px;
          width: 60px;
          border-radius: 60px 0 0 60px;
          background: linear-gradient(135deg, #14b8a6, #06b6d4);
          position: absolute;
          animation: radial-spin 8s linear infinite;
        }

        .radial-timer-half:nth-of-type(2) {
          z-index: 2;
          transform-origin: center right;
          transform: rotate(180deg);
          animation-delay: 4s;
        }

        .radial-timer-half:before {
          content: "";
          position: absolute;
          top: 12px;
          left: 12px;
          height: 96px;
          width: 48px;
          border-radius: 48px 0 0 48px;
          background: white;
        }

        .radial-timer-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          background: white;
          border-radius: 50%;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        @keyframes radial-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }

        .data-visualization {
          position: relative;
          height: 120px;
          width: 120px;
          display: flex;
          align-items: end;
          justify-content: center;
          padding: 20px;
        }

        .data-bars {
          display: flex;
          align-items: end;
          gap: 4px;
          height: 60px;
        }

        .data-bar {
          width: 8px;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border-radius: 4px 4px 0 0;
          animation: data-pulse 2s ease-in-out infinite;
        }

        .data-bar:nth-child(1) { height: 20px; }
        .data-bar:nth-child(2) { height: 35px; }
        .data-bar:nth-child(3) { height: 50px; }
        .data-bar:nth-child(4) { height: 30px; }
        .data-bar:nth-child(5) { height: 40px; }

        .data-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 50%;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        @keyframes data-pulse {
          0%, 100% { 
            transform: scaleY(1);
            opacity: 0.7;
          }
          50% { 
            transform: scaleY(1.3);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}