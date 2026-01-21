'use client'

import { useState } from "react";
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { getApiUrl } from "@/utils/apiConfig";

export default function TicketPurchase() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        birthdate: '',
        mailingAddress: '',
        mailingCity: '',
        mailingState: '',
        mailingZipCode: '',
        phoneNumber: '',
        textNumber: '',
        preferredCommunication: 'email',
        isGroupOrder: false,
        groupMembers: [],
        needsAirportTransportation: false,
        wantsCateredDinner: false,
        proteinRequests: '',
        foodAllergies: '',
        notes: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked,
                // Clear related fields when checkbox is unchecked
                ...(name === 'wantsCateredDinner' && !checked ? {
                    proteinRequests: '',
                    foodAllergies: ''
                } : {}),
                ...(name === 'isGroupOrder' && !checked ? {
                    groupMembers: []
                } : {})
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        setError(null);
    };

    const handleGroupMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.groupMembers];
        if (!updatedMembers[index]) {
            updatedMembers[index] = {};
        }
        updatedMembers[index][field] = value;
        setFormData(prev => ({
            ...prev,
            groupMembers: updatedMembers
        }));
    };

    const handleAddGroupMember = () => {
        setFormData(prev => ({
            ...prev,
            groupMembers: [...prev.groupMembers, { name: '', email: '' }]
        }));
    };

    const handleRemoveGroupMember = (index) => {
        const updatedMembers = formData.groupMembers.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            groupMembers: updatedMembers
        }));
    };

    const validateForm = () => {
        // Basic required field validation
        if (!formData.name.trim()) {
            setError('Name is required');
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setError('Valid email address is required');
            return false;
        }
        if (!formData.birthdate) {
            setError('Birthdate is required');
            return false;
        }
        if (!formData.mailingAddress.trim()) {
            setError('Mailing address is required');
            return false;
        }
        if (!formData.mailingCity.trim()) {
            setError('Mailing city is required');
            return false;
        }
        if (!formData.mailingState.trim()) {
            setError('Mailing state is required');
            return false;
        }
        if (!formData.mailingZipCode.trim()) {
            setError('Mailing ZIP code is required');
            return false;
        }
        if (!formData.phoneNumber.trim()) {
            setError('Phone number is required');
            return false;
        }
        
        // Validate group members if group order
        if (formData.isGroupOrder && formData.groupMembers.length === 0) {
            setError('Please add at least one group member');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(getApiUrl('/api/ticket-orders'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    // Ensure groupMembers is properly formatted
                    groupMembers: formData.isGroupOrder ? formData.groupMembers : null
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response received:', text.substring(0, 200));
                throw new Error(`Server returned an error page. Status: ${response.status}. Please check the server logs.`);
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
                    throw new Error(errorMessages || data.message || 'Validation failed');
                }
                throw new Error(data.message || 'Failed to submit ticket order');
            }

            setSuccess(true);
            // Optionally reset form or redirect
            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    name: '',
                    email: '',
                    birthdate: '',
                    mailingAddress: '',
                    mailingCity: '',
                    mailingState: '',
                    mailingZipCode: '',
                    phoneNumber: '',
                    textNumber: '',
                    preferredCommunication: 'email',
                    isGroupOrder: false,
                    groupMembers: [],
                    needsAirportTransportation: false,
                    wantsCateredDinner: false,
                    proteinRequests: '',
                    foodAllergies: '',
                    notes: ''
                });
            }, 3000);
        } catch (err) {
            console.error('Ticket order error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Purchase Tickets
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Please fill out the form below to purchase tickets for the event.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm font-semibold">
                                Thank you! Your ticket order has been submitted successfully. We will contact you soon.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Birthdate <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        value={formData.birthdate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mailing Address */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mailing Address</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="mailingAddress"
                                        value={formData.mailingAddress}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="mailingCity"
                                            value={formData.mailingCity}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="mailingState"
                                            value={formData.mailingState}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            ZIP Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="mailingZipCode"
                                            value={formData.mailingZipCode}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Text Number (if different)
                                    </label>
                                    <input
                                        type="tel"
                                        name="textNumber"
                                        value={formData.textNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Preferred Method of Communication <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="preferredCommunication"
                                        value={formData.preferredCommunication}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                    >
                                        <option value="email">Email</option>
                                        <option value="text">Text</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Group Order */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Group Order</h2>
                            <div className="mb-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isGroupOrder"
                                        checked={formData.isGroupOrder}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">I am ordering tickets for a group of people</span>
                                </label>
                            </div>

                            {formData.isGroupOrder && (
                                <div className="space-y-4 border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-sm font-semibold text-gray-700">Group Members</p>
                                        <button
                                            type="button"
                                            onClick={handleAddGroupMember}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                                        >
                                            Add Member
                                        </button>
                                    </div>
                                    
                                    {formData.groupMembers.map((_, index) => (
                                        <div key={index} className="border border-gray-300 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-semibold text-gray-700">Member {index + 1}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveGroupMember(index)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.groupMembers[index]?.name || ''}
                                                        onChange={(e) => handleGroupMemberChange(index, 'name', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={formData.groupMembers[index]?.email || ''}
                                                        onChange={(e) => handleGroupMemberChange(index, 'email', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Additional Services */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Services</h2>
                            <div className="space-y-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="needsAirportTransportation"
                                        checked={formData.needsAirportTransportation}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">I need to make airport transportation arrangements</span>
                                </label>

                                <div>
                                    <label className="flex items-center cursor-pointer mb-2">
                                        <input
                                            type="checkbox"
                                            name="wantsCateredDinner"
                                            checked={formData.wantsCateredDinner}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">I want a catered dinner</span>
                                    </label>

                                    {formData.wantsCateredDinner && (
                                        <div className="ml-6 mt-3 space-y-3 border-2 border-gray-200 rounded-lg p-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Protein Requests
                                                </label>
                                                <textarea
                                                    name="proteinRequests"
                                                    value={formData.proteinRequests}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    placeholder="Please specify any protein preferences or requests..."
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Food Allergies or Dietary Restrictions
                                                </label>
                                                <textarea
                                                    name="foodAllergies"
                                                    value={formData.foodAllergies}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    placeholder="Please list any food allergies or dietary restrictions..."
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Additional Notes or Special Requests
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Any additional information you'd like us to know..."
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-colors
                                    ${isLoading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }
                                `}
                            >
                                {isLoading ? 'Submitting...' : 'Submit Ticket Order'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}
