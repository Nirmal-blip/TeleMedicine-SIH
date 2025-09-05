import React, { useState, ChangeEvent } from "react";
import Sidebar from "../../Components/Sidebar";
import PatientHeader from "../../Components/PatientHeader";
import { FaPills, FaSearch, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaRobot } from "react-icons/fa";

interface Medicine {
    name: string;
    "price(₹)": number;
}

const MedicineRecommendation: React.FC = () => {
    const [medicine, setMedicine] = useState<string>("");
    const [recommendations, setRecommendations] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const fetchRecommendations = async () => {
        if (!medicine.trim()) {
            setError("Please enter a medicine name.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await fetch("http://localhost:3000/api/ai/medicine/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({ medicine_name: medicine }),
            });

            const data = await response.json();
            if (response.ok) {
                setRecommendations(data.recommendations);
            } else {
                setError(data.error || "Something went wrong.");
            }
        } catch (err) {
            setError("Failed to fetch recommendations.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMedicine(e.target.value);
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <Sidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <PatientHeader />

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                            <FaPills className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 font-secondary">Medicine Recommendation</h1>
                            <p className="text-gray-600">Get AI-powered medicine suggestions and alternatives</p>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="card p-8 rounded-2xl mb-8 animate-fade-scale">
                    <div className="flex items-center gap-3 mb-6">
                        <FaRobot className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-xl font-semibold text-gray-800">AI Medicine Assistant</h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Enter medicine name (e.g., Paracetamol, Aspirin)"
                                value={medicine}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
                                onKeyPress={(e) => e.key === 'Enter' && fetchRecommendations()}
                            />
                        </div>
                        <button
                            onClick={fetchRecommendations}
                            disabled={loading}
                            className="btn-primary flex items-center gap-2 px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <FaSearch className="w-4 h-4" />
                                    Get Recommendations
                                </>
                            )}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-slide-down flex items-center gap-2">
                            <FaExclamationTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                    <div className="card p-8 rounded-2xl animate-fade-scale">
                        <div className="flex items-center gap-3 mb-6">
                            <FaCheckCircle className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-xl font-semibold text-gray-800">
                                Recommendations for "{medicine}"
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.map((med, index) => (
                                <div 
                                    key={index} 
                                    className="card card-hover p-6 rounded-xl border border-emerald-100 animate-fade-scale"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                            <FaPills className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{med.name}</h3>
                                            <p className="text-emerald-600 font-medium">Alternative Medicine</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-2xl font-bold text-emerald-600">
                                            ₹{med["price(₹)"]}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Estimated Price
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button className="flex-1 btn-primary text-sm py-2">
                                            View Details
                                        </button>
                                        <button className="btn-secondary text-sm py-2 px-4">
                                            Compare
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="card p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 animate-slide-up">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaInfoCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Important Information</h3>
                            <div className="text-gray-600 text-sm space-y-2">
                                <p>• These recommendations are generated by AI and should be used for informational purposes only.</p>
                                <p>• Always consult with a qualified healthcare professional before taking any medication.</p>
                                <p>• Prices shown are estimates and may vary at different pharmacies.</p>
                                <p>• Check for drug interactions and allergies before purchasing.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {recommendations.length === 0 && !loading && !error && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaPills className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Get Medicine Recommendations</h3>
                        <p className="text-gray-600 mb-6">Enter a medicine name above to get AI-powered alternatives and suggestions.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MedicineRecommendation;