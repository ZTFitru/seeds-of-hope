import { FaInstagram, FaFacebookF, FaYoutube, FaEnvelope } from "react-icons/fa";
import { getLinkHref } from "@/utils/linkHelper";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* about */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-2xl font-bold text-white mb-4">
                            Seeds of Hope
                        </h4>
                        <p className="text-gray-300 mb-4">
                            We unite the power of strategic charities and causes under one purpose-driven mission: 
                            to accelerate communities by nourishing hope, dignity, and resilience in the face of 
                            crisis through collaborative fundraising, awareness, and action.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/seedsofhopesc?igsh=aHpxYjU5YjE0dHc0&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-orange-400 transition-colors" aria-label="Instagram">
                                <FaInstagram size={20} />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61586757909430" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-orange-400 transition-colors" aria-label="Facebook">
                                <FaFacebookF size={20} />
                            </a>
                            <a href="https://www.youtube.com/@SeedsofHopeFestival" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-orange-400 transition-colors" aria-label="YouTube">
                                <FaYoutube size={20} />
                            </a>
                        </div>
                    </div>
                    
                    {/* Links */}
                    <div>
                        <h5 className="text-lg font-semibold mb-4">
                            Quick Links
                        </h5>
                        <ul className="space-y-2">
                            <li>
                                <a href={getLinkHref("/charities")} className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Charities
                                </a>
                            </li>
                            <li>
                                <a href={getLinkHref("/ourteam")} className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Our Team
                                </a>
                            </li>
                            <li>
                                <a href={getLinkHref("/eventaccess")} className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Event Access
                                </a>
                            </li>
                            <li>
                                <a href={getLinkHref("/media")} className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Media
                                </a>
                            </li>
                            <li>
                                <a href={getLinkHref("/#contactus")} className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* contact us */}
                    <div>
                        <h5 className="text-lg font-semibold mb-4">
                            Contact Us
                        </h5>
                        <ul className="space-y-3">
                            {/* take address and phone number off */}
                            
                            <li className="flex items-start">
                                <a href="mailto:team@seedsofhopesc.org" className="flex items-start text-gray-300 hover:text-orange-400 transition-colors">
                                    <FaEnvelope size={18} className="mr-2 mt-1 shrink-0" />
                                    <span>Email</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* copy right */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}