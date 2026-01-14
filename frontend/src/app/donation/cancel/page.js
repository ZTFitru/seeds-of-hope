'use client'

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function DonationCancel() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-orange-600 mb-4">
                        <XCircle className="w-16 h-16 mx-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Donation Cancelled
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Your donation was not completed. No charges have been made to your account.
                    </p>
                    <p className="text-gray-500 text-sm mb-8">
                        If you encountered any issues or would like to try again, please feel free to return to the donation page.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/donation"
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/"
                            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
