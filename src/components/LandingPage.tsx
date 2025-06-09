import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from './Header'
import Hero from './Hero'
import Features from './Features'
import About from './About'
import Testimonials from './Testimonials'
import CTA from './CTA'
import Footer from './Footer'

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/dashboard') // This will redirect to auth form via ProtectedRoute
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onGetStarted={handleGetStarted}
      />
      <main>
        <Hero onGetStarted={handleGetStarted} />
        <Features />
        <About />
        <Testimonials />
        <CTA onGetStarted={handleGetStarted} />
      </main>
      <Footer />
    </div>
  )
}