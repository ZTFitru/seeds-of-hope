'use client'
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, Target, User, Users } from "lucide-react";
import { getLinkHref } from "@/utils/linkHelper";
import { getApiUrl } from "@/utils/apiConfig";

const heroImages = [
  {id: 1, name: '', sub: '', image: '/images/seedsOfHopePlaceholder.jpg'},
  {id: 2, name: 'Sourced Locally', sub: 'We\'re a local nonprofit that aims to end needless suffering', image: '/images/polina-rytova-1dGMs4hhcVA-unsplash.jpg'},
  {id: 3, name: 'Event Details', sub: 'Bookmark this site to stay up to date on the latest changes', image: '/images/audience.jpg'}
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [formStatus, setFormStatus] = useState({
    loading: false,
    success: false,
    error: null
  })

  useEffect(()=> {
    const timer = setInterval(()=> {
      setCurrentSlide((prev)=> (prev + 1) % heroImages.length)
    }, 5000)
    return ()=> clearInterval(timer)
  }, [])

  const goToSlide = (index)=> {
    setCurrentSlide(index)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (formStatus.error) {
      setFormStatus(prev => ({ ...prev, error: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormStatus({ loading: true, success: false, error: null })

    try {
      const response = await fetch(getApiUrl('/api/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setFormStatus({ loading: false, success: true, error: null })
        setFormData({ name: '', email: '', message: '' })
        // Clear success message after 5 seconds
        setTimeout(() => {
          setFormStatus(prev => ({ ...prev, success: false }))
        }, 5000)
      } else {
        setFormStatus({
          loading: false,
          success: false,
          error: data.message || 'Failed to send message. Please try again.'
        })
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setFormStatus({
        loading: false,
        success: false,
        error: 'Network error. Please check if the backend server is running.'
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* hero section */}
      {/* <section className="relative h-[600px] overflow-hidden"> */}
      <section className="relative h-[450px] md:h-[550px] overflow-hidden">
        {heroImages.map((slide, index)=> (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div 
              // className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
              // className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
              className="absolute inset-0"
              style={{backgroundColor: '#6f876f'}}
            >
              <Image 
                src={slide.image}
                alt={slide.name}
                fill
                className={index === 0 ? "object-contain object-center" : "object-cover object-center"}
                priority
              />
            </div>
            <div className="absolute inset-0 bg-black opacity-35"></div>
            <div className="relative h-full flex items-center justify-center text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                  {slide.name}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-100 animate-fade-in">
                  {slide.sub}
                </p>
                {index !== 0 && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
                    <a 
                      href={getLinkHref('/charities')}
                      className="bg-yellow-300 text-black px-4 py-2 md:px-8 md:py-3 rounded-lg 
                      font-semibold hover:bg-yellow-600 transition-colors inline-flex items-center justify-center"
                    >
                      Donate Here
                      <ArrowRight className="ml-2" size={20} />
                    </a>
                    <a 
                      href={getLinkHref('/eventaccess')}
                      className="bg-white text-green-600 px-4 py-2 md:px-8 md:py-3 rounded-lg 
                      font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                    >
                      Get Involved
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* carousel */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {heroImages.map((_, index)=> (
            <button
              key={index}
              onClick={()=> goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w8' : 'bg-white bg-opacity-50 hover:bg-opacity-75'}`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700">
              {/* change diverse to  */}
              We unite the power of strategic charities and causes under one purpose-driven mission:  to accelerate communities by nourishing hope, 
              dignity, and resilience in the face of crisis through collaborative fundraising, awareness, and action.
            </p>
          </div>
        </div>
      </section>

      {/* impact area */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Heart className="text-red-600" size={32}/>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Community Support
              </h3>
              <p className="text-gray-600">
                Providing essential resources and support to families and individuals in need throughout our community.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Education programs
              </h3>
              <p className="text-gray-600">
                Offering educational opportunities and skill development programs to empower individuals for success.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Target className="text-purple-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Sustainable Solutions
              </h3>
              <p className="text-gray-600">
                Creating long-term sustainable programs that address root causes and foster independence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="py-16 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">0</div>
              <div className="text-xl text-black">People Helped</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">0</div>
              <div className="text-xl text-black">Programs Running</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">0</div>
              <div className="text-xl text-black">Active Volunteers</div>
            </div>
          </div>
        </div>
      </section>

      {/* about us */}


      {/* contact us */}
      <section id="contactus" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have any questions or want to learn more about our work? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">

            {/* form */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Success Message */}
                {formStatus.success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                    Your message has been sent successfully! We will get back to you soon.
                  </div>
                )}

                {/* Error Message */}
                {formStatus.error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {formStatus.error}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input 
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={formStatus.loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black disabled:bg-gray-200 disabled:cursor-not-allowed"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input 
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={formStatus.loading}
                    className="w-full px-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black disabled:bg-gray-200 disabled:cursor-not-allowed"
                    placeholder="johnsmith@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    disabled={formStatus.loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black disabled:bg-gray-200 disabled:cursor-not-allowed"
                    placeholder="Tell us more...."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={formStatus.loading}
                  className="w-full bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {formStatus.loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
