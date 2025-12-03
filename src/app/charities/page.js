'use client'

import CharityCard from "@/components/CharityCard"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useState } from "react"

export default function Charities() {
    const charitiesData = [
        {
            id: 1,
            name: 'Charity One',
            image: '/images/charity-one.jpg'
        },
        {
            id: 2,
            name: 'Charity Two',
            image: '/images/charity-two.jpg'
        },
        {
            id: 3,
            name: 'Charity Three',
            image: '/images/charity-three.jpg'
        },
        {
            id: 4,
            name: 'Charity Four',
            image: '/images/charity-four.jpg'
        }
    ]

    const [visible, setVisible] = useState(3)

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 m-4">
                <h1 className="text-4xl font-bold text-center text-gray-900 m-12">
                    Charities
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {charitiesData.slice(0, visible).map(charity=> (
                        <CharityCard key={charity.id} charity={charity} />
                    ))}
                </div>

                {visible < charitiesData.length && (
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={()=> setVisible(prev=> prev +3)}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer"
                        >
                            Show More
                        </button>
                    </div>
                )}
            </div>

            {/* donation info */}
            <div className="max-w-4xl mx-auto mt-20 mb-16 px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    How Your Donation Helps
                </h2>
                <p className="text-gray-700 text-lg mb-10">
                    Every Contribution makes a meaningul difference. Your support helps provide essential resources, 
                    expand community programs, and offer hope to those who need it most.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="bg-white shadow-md p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-green-700 mb-2">$10</h3>
                        <p className="text-gray-600">Helps provide basic necessities such as meals and hygiene items.</p>
                    </div>
                    <div className="bg-white shadow-md p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-green-700 mb-2">$20</h3>
                        <p className="text-gray-600">Support education materials and community outreach activities.</p>
                    </div>
                    <div className="bg-white shadow-md p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-green-700 mb-2">$50</h3>
                        <p className="text-gray-600">Contributes to medical assistance, emergency supplies, and long term programs.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}