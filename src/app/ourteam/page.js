'use client'

import Footer from "@/components/Footer"
import Header from "@/components/Header"


export default function OurTeam() {

    const hosts = [
        {id: 1, name: 'Host 1', image: '/images/host.png'},
        {id: 2, name: 'Host 2', image: '/images/host.png'}
    ]

    const artists = [
        {id: 1, name: 'Artist 1', image: '/images/artist.png'},
        {id: 2, name: 'Artist 2', image: '/images/artist.png'},
        {id: 3, name: 'Artist 3', image: '/images/artist.png'},
        {id: 4, name: 'Artist 4', image: '/images/artist.png'},
    ]

    const partners = [
        {id: 1, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        {id: 2, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        {id: 3, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        {id: 4, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
                    Our Team
                </h1>

                {/* host */}
                {/* <section className="mb-20">
                    <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
                        Hosts
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        {hosts.map(host => (
                            <div key={host.id} className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                <div className="w-full h-64 relative mb-4">
                                    <img
                                        src={host.image}
                                        alt={host.name}
                                        className="object-cover rounded-lg w-full h-full"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {host.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </section> */}

                {/* artists */}
                {/* <section className="mb-20">
                    <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
                        Featured Artists
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {artists.map(artist => (
                            <div key={artist.id} className="bg-white p-6 rounded-lg shadow-lg text-center">
                                <div className="w-full h-56 relative mb-4">
                                    <img
                                        src={artist.image}
                                        alt={artist.name}
                                        className="object-cover rounded-lg w-full h-full"
                                    />
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {artist.name}
                                    </h3>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                        {artist.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </section> */}

                {/* logo */}
                <section className="mb-20">
                    <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
                        Production Team
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10 items-center">
                        {partners.map(partner => (
                            <div key={partner.id} className="flex justify-center">
                                <div className="w-40 h-24 relative grayscale hover:grayscale-0 transition duration-300">
                                    <img
                                        src={partner.logo}
                                        alt="Production Team Logo"
                                        className="object-contain w-full h-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}