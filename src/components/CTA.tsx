import React from 'react';
import { ArrowRight, Heart, MessageCircle } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              You Don't Have to Face This Alone
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Join thousands of families who have found comfort, guidance, and hope 
              with Neomate. Start your journey with compassionate AI support today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center space-x-3 group font-semibold">
              <MessageCircle className="h-5 w-5" />
              <span>Start Chatting Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center space-x-3 group font-semibold">
              <Heart className="h-5 w-5" />
              <span>Learn More</span>
            </button>
          </div>

          <div className="pt-8">
            <p className="text-blue-200 text-sm">
              Free to start • No credit card required • HIPAA compliant
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}