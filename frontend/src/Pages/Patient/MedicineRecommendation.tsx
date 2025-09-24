import React, { useState, ChangeEvent, useRef } from "react";
import Sidebar from "../../Components/Sidebar";
import { FaPills, FaSearch, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaRobot } from "react-icons/fa";

interface Medicine {
    name: string;
    "price(₹)": number;
    manufacturer_name?: string;
}

interface ApiResponse {
    search: string;
    recommendations: Medicine[];
    extracted_text?: string;
    error?: string;
    suggestions?: string[];
}

const MedicineRecommendation: React.FC = () => {
    const [medicine, setMedicine] = useState<string>("");
    const [recommendations, setRecommendations] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [searchMethod, setSearchMethod] = useState<'text' | 'image'>('text');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [extractedText, setExtractedText] = useState<string>("");
    const [searchedMedicine, setSearchedMedicine] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRecommendations = async () => {
        if (searchMethod === 'text' && !medicine.trim()) {
            setError("Please enter a medicine name.");
            return;
        }

        if (searchMethod === 'image' && !selectedFile) {
            setError("Please select an image file.");
            return;
        }

        setLoading(true);
        setError("");
        setExtractedText("");
        setSearchedMedicine("");
        
        try {
            let response;
            
            if (searchMethod === 'text') {
                response = await fetch(`${(import.meta as any).env.VITE_FLASK_URL}/api/medicine/recommend`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify({ medicine_name: medicine }),
                });
            } else {
                // Image upload
                const formData = new FormData();
                formData.append('file', selectedFile!);
                
                response = await fetch(`${(import.meta as any).env.VITE_FLASK_URL}/api/medicine/recommend-image`, {
                    method: "POST",
                    body: formData,
                });
            }

            const data: ApiResponse = await response.json();
            if (response.ok) {
                setRecommendations(data.recommendations);
                setSearchedMedicine(data.search);
                if (data.extracted_text) {
                    setExtractedText(data.extracted_text);
                }
            } else {
                let errorMessage = data.error || "Something went wrong.";
                if (data.suggestions && data.suggestions.length > 0) {
                    errorMessage += "\n\nSuggestions:\n" + data.suggestions.map(s => `• ${s}`).join("\n");
                }
                setError(errorMessage);
            }
        } catch (err) {
            setError("Failed to fetch recommendations.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError("Please select a valid image file.");
                return;
            }
            
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("File size should be less than 5MB.");
                return;
            }

            setSelectedFile(file);
            setError("");
            
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setExtractedText("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMedicine(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <Sidebar />
            <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
                <div className="mt-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">💊 Medicine Alternatives</h1>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
                        <div className="text-center mb-8">
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

                        {/* Search Method Selection */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Search Method</h3>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setSearchMethod('text')}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                                        searchMethod === 'text'
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <span className="text-xl">📝</span>
                                    <span>Type Medicine Name</span>
                                </button>
                                <button
                                    onClick={() => setSearchMethod('image')}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                                        searchMethod === 'image'
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <span className="text-xl">📷</span>
                                    <span>Upload Image (OCR)</span>
                                </button>
                            </div>
                        </div>

                        {/* Text Input Method */}
                        {searchMethod === 'text' && (
                            <div className="mb-6">
                                <div className="flex gap-4">
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
                            </div>
                        )}

                        {/* Image Upload Method */}
                        {searchMethod === 'image' && (
                            <div className="mb-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:border-emerald-400 transition-colors duration-300">
                                    {!selectedFile ? (
                                        <div>
                                            <div className="text-6xl mb-4">📷</div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                                Upload Medicine Image
                                            </h4>
                                            <p className="text-gray-600 mb-4">
                                                Upload an image of medicine packaging, prescription, or bottle to extract medicine name using OCR
                                            </p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
                                            >
                                                Select Image
                                            </button>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Supported formats: JPG, PNG, GIF (Max 5MB)
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="mb-4">
                                                <img 
                                                    src={previewUrl} 
                                                    alt="Preview" 
                                                    className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">
                                                <strong>File:</strong> {selectedFile.name}
                                            </p>
                                            <div className="flex gap-3 justify-center">
                                                <button
                                                    onClick={fetchRecommendations}
                                                    disabled={loading}
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? "Processing..." : "🔍 Extract & Find Alternatives"}
                                                </button>
                                                <button
                                                    onClick={clearFile}
                                                    className="bg-gray-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-600 transition-all duration-300"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-xl">
                                <div className="text-red-700">
                                    {error.split('\n').map((line, index) => (
                                        <p key={index} className={index === 0 ? "font-semibold mb-2" : "text-sm"}>
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* OCR Extracted Text Display */}
                        {extractedText && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <h4 className="text-lg font-semibold text-blue-800 mb-2">🔍 Extracted Text from Image:</h4>
                                <p className="text-blue-700 text-sm bg-white p-3 rounded-lg border">{extractedText}</p>
                                {searchedMedicine && (
                                    <p className="text-blue-600 mt-2 text-sm">
                                        <strong>Detected Medicine:</strong> {searchedMedicine}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Search Result Summary */}
                        {searchedMedicine && recommendations.length > 0 && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <p className="text-green-800">
                                    <strong>🎯 Found alternatives for:</strong> {searchedMedicine}
                                </p>
                            </div>
                        )}

                        {recommendations.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">💊 Alternative Medicines</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                                <th className="p-4 text-left">Medicine Name</th>
                                                <th className="p-4 text-left">Manufacturer</th>
                                                <th className="p-4 text-left">Price (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recommendations.map((med, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 transition-all duration-200">
                                                    <td className="p-4 text-gray-800 font-medium">{med.name}</td>
                                                    <td className="p-4 text-gray-600">{med.manufacturer_name || 'N/A'}</td>
                                                    <td className="p-4 text-gray-700 font-semibold">₹{med["price(₹)"]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 text-center">
                                        💡 <strong>Note:</strong> Please consult with your doctor before switching medications.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
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