import React from 'react';
import { Clock, MessageCircle, Shield, Brain, Users } from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'Compassionate AI Support',
    description: 'Get emotional support and guidance through empathetic AI conversations designed by healthcare professionals.',
    color: 'bg-warm-500'
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Access support anytime, day or night. Neomate is always ready to help when you need it most.',
    color: 'bg-primary-500'
  },
  {
    icon: Brain,
    title: 'Evidence-Based Information',
    description: 'Receive accurate, up-to-date medical information backed by the latest neonatal research and guidelines.',
    color: 'bg-accent-500'
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Your conversations are completely private and secure, meeting the highest healthcare privacy standards.',
    color: 'bg-warm-600'
  },
  {
    icon: () => <img src="/favicon.png" alt="Heart" className="h-6 w-6 rounded-full" />,
    title: 'Emotional Wellness',
    description: 'Tools and techniques to help manage stress, anxiety, and emotional challenges during hospitalization.',
    color: 'bg-gradient-to-r from-warm-500 to-primary-500'
  },
  {
    icon: Users,
    title: 'Family Guidance',
    description: 'Support for the whole family, including siblings and extended family members during this journey.',
    color: 'bg-primary-600'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-warm-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-warm-800">
            Comprehensive Support When You Need It Most
          </h2>
          <p className="text-xl text-warm-600 max-w-3xl mx-auto">
            Neomate combines advanced AI technology with deep healthcare expertise 
            to provide personalized support throughout your neonatal journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-warm-100"
            >
              <div className={`${feature.color} p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center shadow-lg`}>
                {typeof feature.icon === 'function' ? (
                  <feature.icon />
                ) : (
                  <feature.icon className="h-6 w-6 text-white" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-warm-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-warm-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}