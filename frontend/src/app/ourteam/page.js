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
        // Row 0: 1 team members
        {id: 1, image: '/images/R6_16483.jpg', name: 'Eliza Smith', link: 'https://sites.google.com/eternaleventssc.com/home/home'},
        // Row 1: 3 placeholder items
        {id: 6, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        {id: 7, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        {id: 8, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        // Row 2: 5 placeholder items
        {id: 9, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        {id: 10, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        {id: 11, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        {id: 12, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
        {id: 13, logo: '/images/IconOnly_Transparent_NoBuffer.png'},
    ]

    // Group partners into rows with hierarchy: row 0 = 2 items, row 1 = 3 items, row 2 = 5 items, rest = 4 items each
    const groupPartnersIntoRows = (partners) => {
        const rows = []
        let index = 0
        
        // First row: 2 items
        if (index < partners.length) {
            rows.push({ cols: 1, items: partners.slice(index, index + 1) })
            index += 1
        }
        
        // Second row: 3 items
        if (index < partners.length) {
            rows.push({ cols: 3, items: partners.slice(index, index + 3) })
            index += 3
        }
        
        // Third row: 5 items
        if (index < partners.length) {
            rows.push({ cols: 5, items: partners.slice(index, index + 5) })
            index += 5
        }
        
        // Subsequent rows: 4 items each
        while (index < partners.length) {
            rows.push({ cols: 4, items: partners.slice(index, index + 4) })
            index += 4
        }
        
        return rows
    }

    const partnerRows = groupPartnersIntoRows(partners)

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
                    <h3 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
                        Production Team
                    </h3>

                    <div className="flex flex-col gap-10 items-center">
                        {partnerRows.map((row, rowIndex) => (
                            <div 
                                key={rowIndex} 
                                className={`grid gap-10 items-center ${
                                    row.cols === 2 
                                        ? 'grid-cols-2' 
                                        : row.cols === 3 
                                        ? 'grid-cols-1 sm:grid-cols-3' 
                                        : row.cols === 5
                                        ? 'grid-cols-2 sm:grid-cols-5'
                                        : 'grid-cols-2 sm:grid-cols-4'
                                }`}
                                style={{ width: '100%', maxWidth: '100%' }}
                            >
                                {row.items.map(partner => (
                                    <div key={partner.id} className="flex flex-col items-center">
                                        {partner.link ? (
                                            <a 
                                                href={partner.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center hover:opacity-80 transition duration-300"
                                            >
                                                <div className={`w-40 ${partner.image ? 'h-40' : 'h-24'} relative mb-2 ${partner.logo ? 'grayscale hover:grayscale-0' : ''} transition duration-300`}>
                                                    <img
                                                        src={partner.image || partner.logo}
                                                        alt={partner.name || "Production Team Logo"}
                                                        className={`${partner.image ? 'object-cover rounded-full' : 'object-contain'} w-full h-full`}
                                                    />
                                                </div>
                                                {partner.name && (
                                                    <span className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition duration-300">
                                                        {partner.name}
                                                    </span>
                                                )}
                                            </a>
                                        ) : (
                                            <>
                                                <div className={`w-40 ${partner.image ? 'h-40' : 'h-24'} relative mb-2 ${partner.logo ? 'grayscale hover:grayscale-0' : ''} transition duration-300`}>
                                                    <img
                                                        src={partner.image || partner.logo}
                                                        alt={partner.name || "Production Team Logo"}
                                                        className={`${partner.image ? 'object-cover rounded-full' : 'object-contain'} w-full h-full`}
                                                    />
                                                </div>
                                                {partner.name && (
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {partner.name}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}