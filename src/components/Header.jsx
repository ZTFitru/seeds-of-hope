'use client'
import { useState } from "react";
// import logoImg from 'public/images/seedsOfHopenobg.png'
import { Menu, X } from "lucide-react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)

    const navItems = [
        {name: 'Home', href: '/'},
        {name: 'Charities', href: '/charities'},
        {name: 'Our Team', href: '/ourteam'},
        {name: 'Event Access', href: '/eventaccess'},
        {name: 'Media', href: '/media'},
        {name: 'Contact Us', href: '/#contactus'}
    ]

    const handleNavClick = (e, href)=> {
        if (href.startsWith('#')) {
            e.preventDefault()
            const element = document.querySelector(href)
            if (element) {
                element.scrollIntoView({behavior: 'smooth'})
                setIsOpen(false)
            }
        }
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* logo */}
                    <a href="/"> 
                        <img
                            src='/images/seedsOfHopenobg.png'
                            width='50'
                            height='50'
                            alt="Logo"
                            className="cursor-pointer"
                        />
                    </a>
                    {/* <div className="shrink-0 flex items-center">
                        <div className="text-2xl font-bold text-blue-600">
                            Seeds of Hope
                        </div>
                    </div> */}

                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navItems.map((item)=> (
                            <a 
                                key={item.name}
                                href={item.href}
                                onClick={(e)=> handleNavClick(e, item.href)}
                                className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={()=> setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-orange-600 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
                        {navItems.map((item)=> (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={(e)=> handleNavClick(e, item.href)}
                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md"
                            >  
                                {item.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}