'use client'

import { useState } from "react";
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { getApiUrl } from "@/utils/apiConfig";

export default function Charities() {
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [otherAmount, setOtherAmount] = useState('');
    const [donorInfo, setDonorInfo] = useState({
        name: '',
        email: ''
    });
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [requestTaxReceipt, setRequestTaxReceipt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const presetAmounts = [1, 3, 5];

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount);
        setOtherAmount('');
        setError(null);
    };

    const handleOtherAmountChange = (e) => {
        const value = e.target.value;
        setOtherAmount(value);
        if (value) {
            setSelectedAmount('other');
        }
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDonorInfo(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleAnonymousChange = (e) => {
        const checked = e.target.checked;
        setIsAnonymous(checked);
        if (checked) {
            // Clear name and email when anonymous is checked, and uncheck tax receipt
            setDonorInfo({
                name: '',
                email: ''
            });
            setRequestTaxReceipt(false);
        }
        setError(null);
    };

    const handleTaxReceiptChange = (e) => {
        const checked = e.target.checked;
        setRequestTaxReceipt(checked);
        if (checked) {
            // Uncheck anonymous when tax receipt is checked (can't be both)
            setIsAnonymous(false);
        }
        setError(null);
    };

    const validateForm = () => {
        // If tax receipt is requested, name and email are required
        if (requestTaxReceipt) {
            if (!donorInfo.name || donorInfo.name.trim() === '') {
                setError('Name is required to receive a tax receipt email');
                return false;
            }
            if (!donorInfo.email || donorInfo.email.trim() === '') {
                setError('Email address is required to receive a tax receipt email');
                return false;
            }
        }
        // Email is optional, but if provided, must be valid
        if (donorInfo.email && !donorInfo.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        if (selectedAmount === null) {
            setError('Please select a donation amount');
            return false;
        }
        if (selectedAmount === 'other' && (!otherAmount || Number(otherAmount) <= 0)) {
            setError('Please enter a valid donation amount');
            return false;
        }
        return true;
    };

    const handleDonate = async () => {
        setError(null);
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const amount = selectedAmount === 'other' ? parseFloat(otherAmount) : selectedAmount;
            
            // Create donation order via backend API
            const response = await fetch(getApiUrl('/api/donations/create'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    // Only send email if not anonymous and it has a value
                    email: isAnonymous ? null : (donorInfo.email || null),
                    // Only send name if not anonymous and it has a value
                    name: isAnonymous ? null : (donorInfo.name || null),
                    isAnonymous: isAnonymous,
                    requestTaxReceipt: requestTaxReceipt,
                    donationType: 'one-time'
                })
            });

            // Check if response is JSON before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response received:', text.substring(0, 200));
                throw new Error(`Server returned an error page. Status: ${response.status}. Please check the server logs.`);
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                // Handle validation errors
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
                    throw new Error(errorMessages || data.message || 'Validation failed');
                }
                throw new Error(data.message || 'Failed to create donation order');
            }

            // Redirect to PayPal approval URL
            if (data.approvalUrl) {
                window.location.href = data.approvalUrl;
            } else {
                throw new Error('No PayPal approval URL received');
            }
        } catch (err) {
            console.error('Donation error:', err);
            setError(err.message || 'An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const isDonateDisabled = 
        isLoading ||
        selectedAmount === null ||
        (selectedAmount === 'other' && (!otherAmount || Number(otherAmount) <= 0));

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Charities
                    </h1>
                    <p className="text-2xl font-semibold text-gray-900 mb-4">
                        Support Our Mission
                    </p>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Your contribution helps us make a difference in our community. Thank you for your support!
                    </p>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Content coming soon...
                    </p>
                </div>

                {/* Donation form - temporarily hidden */}
                {/* <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                            Donate Now!
                        </h2>

                        {/* Message above donation fields */}
                        {/* <div className="mb-6 text-gray-700 space-y-3">
                            <p>
                                The Seeds of Hope event is designed to promote a spirit of collaboration, charity, and hope in order to accelerate/strengthen communities around the world.
                            </p>
                            <p>
                                In our inaugural event, we will be placing a spotlight on nourishing food relief in crisis areas and the healing power of music, but we need your support to make this event as authentic and impactful as possible.
                            </p>
                            <p>
                                (Please note, this page is strictly for charitable donations to support the organizational costs associated with the Seeds of Hope community event.  For more information about ticket sales/availability, please visit the Event Access tab for further updates.)
                            </p>
                        </div>

                        {/* Error message */}
                        {/* {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Donation amount selection */}
                        {/* <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Select Donation Amount
                            </label>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {presetAmounts.map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => handleAmountSelect(amount)}
                                        disabled={isLoading}
                                        className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all
                                            ${selectedAmount === amount
                                                ? 'bg-green-600 text-white border-green-600'
                                                : 'border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50'
                                            }
                                            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        ${amount.toFixed(amount % 1 !== 0 ? 2 : 0)}
                                    </button>
                                ))}
                            </div>

                            {/* Other amount option */}
                            {/* <button
                                onClick={() => {
                                    setSelectedAmount('other');
                                    setOtherAmount('');
                                }}
                                disabled={isLoading}
                                className={`w-full px-4 py-3 rounded-lg border-2 font-semibold transition-all mb-4
                                    ${selectedAmount === 'other'
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50'
                                    }
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                Other Amount
                            </button>

                            {/* Other amount input */}
                            {/* {selectedAmount === 'other' && (
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={otherAmount}
                                        onChange={handleOtherAmountChange}
                                        placeholder="Enter amount"
                                        disabled={isLoading}
                                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Donor information */}
                        {/* <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Your Information
                            </label>
                            <div className="mb-4 space-y-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAnonymous}
                                        onChange={handleAnonymousChange}
                                        disabled={isLoading || requestTaxReceipt}
                                        className={`w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ${requestTaxReceipt ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    <span className={`ml-2 text-sm text-gray-700 ${requestTaxReceipt ? 'text-gray-500' : ''}`}>Donate anonymously</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={requestTaxReceipt}
                                        onChange={handleTaxReceiptChange}
                                        disabled={isLoading || isAnonymous}
                                        className={`w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ${isAnonymous ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    <span className={`ml-2 text-sm text-gray-700 ${isAnonymous ? 'text-gray-500' : ''}`}>Send me a charitable contribution letter for tax purposes</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={donorInfo.name}
                                onChange={handleInputChange}
                                placeholder={requestTaxReceipt ? "Name (required for tax receipt)" : "Name (optional)"}
                                disabled={isLoading || isAnonymous}
                                required={requestTaxReceipt}
                                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black ${isAnonymous ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            <input
                                type="email"
                                name="email"
                                value={donorInfo.email}
                                onChange={handleInputChange}
                                placeholder={requestTaxReceipt ? "Email address (required for tax receipt)" : "Email address (optional)"}
                                disabled={isLoading || isAnonymous}
                                required={requestTaxReceipt}
                                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black ${isAnonymous ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        {/* Donate button */}
                        {/* <button
                            onClick={handleDonate}
                            disabled={isDonateDisabled}
                            className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-colors
                                ${isDonateDisabled
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }
                            `}
                        >
                            {isLoading ? 'Processing...' : 'Continue to PayPal'}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            You will be redirected to PayPal to complete your secure payment.
                        </p>
                    </div>
                </div>

                {/* Disclaimer */}
                {/* <div className="max-w-3xl mx-auto mt-8 mb-8">
                    <p className="text-sm text-gray-600 text-center italic">
                        <strong>Disclaimer:</strong> Donations may be made anonymously, or for a charitable contribution tax deduction, in which case contact information data will be collected, and the participating 501c3 member of the Seeds of Hope Organizational Team will disperse appropriate letters no later than December 31, 2026.
                    </p>
                </div> */}
            </div>
            <Footer />
        </div>
    )
}