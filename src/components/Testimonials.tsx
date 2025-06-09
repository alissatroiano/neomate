import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Mother of Emma (32 weeks)',
    content: 'Neomate was there for me during the scariest time of my life. The AI helped me understand what was happening and gave me the emotional support I needed when I couldn\'t sleep at 3 AM.',
    rating: 5,
    location: 'Boston, MA'
  },
  {
    name: 'Michael Chen',
    role: 'Father of twins (28 weeks)',
    content: 'As a first-time dad in the NICU, I had so many questions. Neomate provided clear, honest answers and helped me feel more confident in my role as a parent.',
    rating: 5,
    location: 'San Francisco, CA'
  },
  {
    name: 'Dr. Amanda Rodriguez',
    role: 'Neonatologist',
    content: 'I recommend Neomate to all my families. It provides accurate information while offering the emotional support that complements our medical care beautifully.',
    rating: 5,
    location: 'Children\'s Hospital'
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Stories of Hope and Healing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real families share how Neomate has supported them through their 
            neonatal journey and helped them find strength in difficult moments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-2xl relative group hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <Quote className="h-8 w-8 text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300" />
              
              <div className="space-y-6">
                <p className="text-gray-800 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}