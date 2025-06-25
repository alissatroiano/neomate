import React from 'react';
import { Award, Users, Stethoscope, Timer } from 'lucide-react';

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
                  <img src="/support.png" alt="logo" className="h-5 w-5" />
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

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg text-center group hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  {typeof stat.icon === 'function' ? (
                    <stat.icon />
                  ) : (
                    <stat.icon className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}