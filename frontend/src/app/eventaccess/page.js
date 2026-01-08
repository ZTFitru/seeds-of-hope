'use client'

import Footer from "@/components/Footer"
import Header from "@/components/Header"

export default function EventAcess() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex flex-col items-center justify-center flex-1 text-center px-4 py-20">
            {/* <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1"> */}
                <h1 className="text-4xl font-bold text-gray-900 mb-16">
                    Event Acess
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-xl">
                    We are preparing something special for our upcoming events.
                    Please come back soon.
                </p>

                <span className="text-gray-500 text-sm">
                    Coming Soon...
                </span>
                {/* <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"> */}
                    {/* event images */}
                    {/* <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden">

                    </div> */}

                    {/* event info */}
                    {/* <div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Featured Live Event
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Join us for an unforgettable exerience featuring live performances,
                            exclusive content, and a chance to support an incredible cause.
                        </p>

                        <button className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-md transition cursor-pointer">
                            Buy Ticket
                        </button>
                    </div> */}
                {/* </section> */}

                {/* more events? */}
                {/* <section>
                    <h2 className="text-3xl font-semibold text-gray-900 mb-8">
                        Upcoming Events
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[1,2,3].map((event)=> (
                            <div key={event} className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="w-full h-48 bg-gray-200"></div>

                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Event Title
                                    </h3>
                                    <p className="text-gray-600 mb-4 text-sm">
                                        A description of the event goes here.
                                    </p>
                                    <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md text-sm transition cursor-pointer">
                                        Buy Ticket
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section> */}
            </main>

            <Footer />
        </div>
    )
}