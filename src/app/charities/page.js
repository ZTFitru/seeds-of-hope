'use client'

import Footer from "@/components/Footer"
import Header from "@/components/Header"

export default function Charities() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Charities
                    </h1>
                    <p className="text-2xl font-semibold text-gray-900">
                        We&apos;re working on something amazing. Please check back soon.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    )
}