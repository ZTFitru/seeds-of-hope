'use client'

import Footer from "@/components/Footer"
import Header from "@/components/Header"

export default function EventAcess() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex flex-col items-center flex-1 px-4 py-20">
                <h1 className="text-4xl font-bold text-gray-900 mb-16">
                    Event Access
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-xl">
                    We are preparing something special for our upcoming events.
                    Please come back soon.
                </p>

                <span className="text-gray-500 text-sm">
                    Coming Soon...
                </span>
                {/* <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                    Event Access
                </h1>
                <p className="text-lg text-gray-600 mb-12 max-w-2xl text-center">
                    Choose the ticket that best fits your experience. VIP tickets 
                    include exlusive perks and an optional catered dinner.
                </p>

                <div className="mb-10 max-w-2xl w-full bg-yellow-50 border border-yellow-300 rounded-md p-4 text-center">
                    <p className="text-sm text-yellow-800 font-medium">
                        Notice: You must be 21 years of age or older to purchase a ticket.
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                        Alcohol will be served at this event. Valid ID will be required at entry.
                    </p>
                </div> */}

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl"> */}
                    {/* regular ticket */}
                    {/* <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            General Admission
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Perfect for enjoying the event and supporting the cause.
                        </p>
                        <ul className="text-left text-gray-700 space-y-3 mb-8">
                            <li>&#8226; Entry to the live event</li>
                            <li>&#8226; Access to general seating</li>
                        </ul>

                        <div className="mt-auto">
                            <div className="text-3xl font-bold text-gray-900 mb-4">
                                $50
                            </div>
                            <button className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-md transition cursor-pointer">
                                Purchase General Ticket
                            </button>
                        </div>
                    </div> */}

                    {/* VIP ticket */}
                    {/* <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col border-2 border-yellow-400">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            VIP Admission
                        </h2>
                        <p className="text-gray-600 mb-6">
                            An elevated experience with exclusive access and premium perks.
                        </p>
                        <ul className="text-left text-gray-700 space-y-3 mb-6">
                            <li>&#8226; Reserved VIP seating</li>
                            <li>&#8226; Reserved VIP seating</li>
                            <li>&#8226; Reserved VIP seating</li>
                        </ul>

                        <div className="mb-6 flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="cateredDinner"
                                className="h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                            />
                            <label
                                htmlFor="cateredDinner"
                                className="text-sm font-medium text-gray-700"
                            >
                                Add Catered Dinner
                            </label>
                        </div>
                        <div className="mt-auto">
                            <div className="text-3xl font-bold text-gray-900 mb-4">
                                $80
                            </div>
                            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-md transition cursor-pointer">
                                Purchase VIP Ticket
                            </button>
                        </div>
                    </div>
                </div> */}
            </main>

            

            <Footer />
        </div>
    )
}