import React from 'react';
import { Clock, Heart, MessageCircle, Shield, Brain, Users } from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'Compassionate AI Support',
    description: 'Get emotional support and guidance through empathetic AI conversations designed by healthcare professionals.',
    color: 'bg-blue-500'
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Access support anytime, day or night. Neomate is always ready to help when you need it most.',
    color: 'bg-green-500'
  },
  {
    icon: Brain,
    title: 'Evidence-Based Information',
    description: 'Receive accurate, up-to-date medical information backed by the latest neonatal research and guidelines.',
    color: 'bg-purple-500'
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Your conversations are completely private and secure, meeting the highest healthcare privacy standards.',
    color: 'bg-orange-500'
  },
  {
    icon: Heart,
    title: 'Emotional Wellness',
    description: 'Tools and techniques to help manage stress, anxiety, and emotional challenges during hospitalization.',
    color: 'bg-red-500'
  },
  {
    icon: Users,
    title: 'Family Guidance',
    description: 'Support for the whole family, including siblings and extended family members during this journey.',
    color: 'bg-indigo-500'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Comprehensive Support When You Need It Most
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Neomate combines advanced AI technology with deep healthcare expertise 
            to provide personalized support throughout your neonatal journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <div className={`${feature.color} p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}