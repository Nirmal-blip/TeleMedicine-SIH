import React, { useState, ChangeEvent } from "react";
import Sidebar from "../../Components/Sidebar";
import PatientHeader from "../../Components/PatientHeader";

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
        <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-cyan-50 relative poppins">
            <Sidebar />
            <main className="relative z-10 flex-1 p-6 overflow-y-auto">
                <PatientHeader />
                
                <div className="mt-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Medicine Alternatives</h1>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                Find Medicine Alternatives
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span>Cost-effective options for patients</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span>Ensures availability during shortages</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                    <span>Variations suited to individual needs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Makes healthcare more accessible</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <input
                                type="text"
                                value={medicine}
                                onChange={handleInputChange}
                                placeholder="Enter medicine name..."
                                className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
                                onKeyPress={(e) => e.key === 'Enter' && fetchRecommendations()}
                            />
                            <button
                                onClick={fetchRecommendations}
                                disabled={loading}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Searching..." : "Find Alternatives"}
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-xl">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {recommendations.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Alternative Medicines</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                                <th className="p-4 text-left rounded-tl-xl">Medicine Name</th>
                                                <th className="p-4 text-left rounded-tr-xl">Price (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recommendations.map((med, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 transition-all duration-200">
                                                    <td className="p-4 text-gray-800 font-medium">{med.name}</td>
                                                    <td className="p-4 text-gray-700">₹{med["price(₹)"]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MedicineRecommendation;
