'use client'

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getApiUrl } from "@/utils/apiConfig";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function DonationSuccessContent() {
    const searchParams = useSearchParams();
    const donationId = searchParams.get('donationId');
    const [donation, setDonation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const capturePayment = async () => {
            if (!donationId) {
                setError('No donation ID provided');
                setIsLoading(false);
                return;
            }

            try {
                // Get the PayPal token (orderId) from URL - PayPal returns this as 'token' parameter
                const urlParams = new URLSearchParams(window.location.search);
                const paypalToken = urlParams.get('token');
                
                // First, get the donation info
                const donationResponse = await fetch(getApiUrl(`/api/donations/${donationId}`));
                const donationData = await donationResponse.json();
                
                if (!donationData.success || !donationData.donation) {
                    throw new Error('Donation not found');
                }

                const donationRecord = donationData.donation;

                // If payment is already completed, just show the donation info
                if (donationRecord.paymentStatus === 'completed') {
                    setDonation(donationRecord);
                    setIsLoading(false);
                    return;
                }

                // Use the token from URL if available, otherwise try to get orderId from donation
                // Note: The backend GET endpoint might not return paypalOrderId for security,
                // so we rely on the token from PayPal's redirect
                const orderIdToCapture = paypalToken || donationRecord.paypalOrderId;

                if (orderIdToCapture) {
                    try {
                        const captureResponse = await fetch(getApiUrl('/api/donations/capture'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                orderId: orderIdToCapture
                            })
                        });

                        const captureData = await captureResponse.json();
                        
                        if (captureData.success) {
                            // Fetch updated donation info
                            const updatedResponse = await fetch(getApiUrl(`/api/donations/${donationId}`));
                            const updatedData = await updatedResponse.json();
                            if (updatedData.success && updatedData.donation) {
                                setDonation(updatedData.donation);
                            } else {
                                setDonation(donationRecord);
                            }
                        } else {
                            // Payment might already be captured or failed
                            // Show the current donation status
                            setDonation(donationRecord);
                            if (donationRecord.paymentStatus === 'failed') {
                                setError('Payment processing failed. Please contact support if you were charged.');
                            }
                        }
                    } catch (captureErr) {
                        console.error('Error capturing payment:', captureErr);
                        // Still show donation info even if capture fails
                        // (webhook might handle it)
                        setDonation(donationRecord);
                    }
                } else {
                    // No orderId available, just show donation info
                    // Payment might be processed via webhook
                    setDonation(donationRecord);
                }
            } catch (err) {
                console.error('Error processing donation:', err);
                setError(err.message || 'Failed to process donation information');
            } finally {
                setIsLoading(false);
            }
        };

        capturePayment();
    }, [donationId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Processing your donation...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    {error ? (
                        <>
                            <div className="text-red-600 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Error
                            </h1>
                            <p className="text-gray-600 mb-6">{error}</p>
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
                        </>
                    ) : (
                        <>
                            <div className="text-green-600 mb-4">
                                <CheckCircle className="w-16 h-16 mx-auto" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Thank You for Your Donation!
                            </h1>
                            {donation && (
                                <div className="mb-6">
                                    <p className="text-lg text-gray-700 mb-2">
                                        Your donation of <span className="font-bold text-green-600">${parseFloat(donation.amount).toFixed(2)}</span> has been received.
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        A confirmation email has been sent to your email address.
                                    </p>
                                </div>
                            )}
                            <p className="text-gray-600 mb-8">
                                Your generosity helps us continue our mission to make a positive impact in our community.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/"
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                >
                                    Return to Home
                                </Link>
                                <Link
                                    href="/charities"
                                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function DonationSuccess() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
                <Footer />
            </div>
        }>
            <DonationSuccessContent />
        </Suspense>
    );
}
