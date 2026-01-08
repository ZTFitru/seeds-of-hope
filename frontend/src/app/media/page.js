'use client'

import Footer from "@/components/Footer"
import Header from "@/components/Header"

export default function Media() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex flex-col items-center justify-center flex-1 text-center px-4 py-20">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                    Media
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-xl">
                    Our photos, videos, and live events content will be available here soon.
                    Stay tuned for updates.
                </p>
                <span className="text-gray-500 text-sm">
                    Coming Soon..
                </span>
            </main>

            <Footer />
        </div>
    )
}