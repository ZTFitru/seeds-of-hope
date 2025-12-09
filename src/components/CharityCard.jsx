const { useState } = require("react");

export default function CharityCard({ charity }) {
    const [selectedAmount, setSelectedAmount]= useState(null)
    const [otherAmount, setOtherAmount]= useState('')

    const presetAmount = [10, 20, 50]

    const handleDonate = ()=> {
        const amount = selectedAmount === 'other' ? Number(otherAmount) : selectedAmount
        console.log(`Donating $${amount} to ${charity.name}`)
        alert(`Thank you for donating $${amount} to ${charity.name}`)
    }

    const isDonateDisabled =
        (selectedAmount === null) ||
        (selectedAmount === 'other' && (!otherAmount || Number(otherAmount) <= 0))

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            
            <div className="h-48 relative">
                <img 
                    src={charity.image}
                    alt={charity.name}
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-gray-900">{charity.name}</h3>

                {/* donate button */}
                <div className="flex gap-3 mb-4">
                    {presetAmount.map(amount => (
                        <button
                            key={amount}
                            onClick={()=> {
                                setSelectedAmount(amount)
                                setOtherAmount('')
                            }}
                            className={`px-4 py-2 rounded-lg border font-semibold transition-all cursor-pointer
                                ${selectedAmount === amount
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'border-gray-300 text-gray-700 hover:border-gray-500'
                                }`}
                        >
                            {amount}
                        </button>
                    ))}

                    {/* other button */}
                    <button
                        onClick={()=> setSelectedAmount('other')}
                        className={`px-4 py-2 rounded-lg border font-semibold transition-all cursor-pointer
                            ${selectedAmount === 'other'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'border-gray-300 text-gray-700 hover:border-green-500'
                            }`}
                    >
                        Other
                    </button>
                </div>

                {/* amount input */}
                {selectedAmount === 'other' && (
                    <input
                        type="number"
                        min='1'
                        value={otherAmount}
                        onChange={(e)=> setOtherAmount(e.target.value)}
                        placeholder="Enter Amount"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    />
                )}

                {/* donate button */}
                <button
                    onClick={handleDonate}
                    disabled={isDonateDisabled}
                    className={`mt-auto px-6 py-3 rounded-lg font-semibold transition-colors
                        ${isDonateDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                >
                    Donate
                </button>
            </div>
        </div>
    )
}