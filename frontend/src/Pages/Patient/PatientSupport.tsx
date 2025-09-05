import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import PatientHeader from "../../Components/PatientHeader";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Hospital {
    name: string;
    lat: number;
    lon: number;
    maps_url: string;
}

interface UserLocation {
    lat: number;
    lon: number;
}

const PatientSupport: React.FC = () => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lon: longitude });

                fetch(`http://localhost:3000/api/ai/hospitals?lat=${latitude}&lon=${longitude}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then((data) => {
                        setHospitals(data.hospitals || []);
                        setLoading(false);
                    })
                    .catch((error) => {
                        console.error("Error fetching hospitals:", error);
                        setError("Failed to load nearby hospitals. Please try again.");
                        setLoading(false);
                    });
            },
            (error) => {
                console.error("Error getting location:", error);
                setError("Unable to access your location. Please enable location services and try again.");
                setLoading(false);
            }
        );
    }, []);

    return (
        <div className="flex h-screen bg-cover bg-center bg-[#D8EFED] text-white relative poppins">
            <Sidebar />
            <div className="relative z-10 flex-1 p-6">
                <PatientHeader />

                <div className="mt-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">🏥 Nearby Hospitals</h1>
                        <p className="text-gray-600 mb-6">Find healthcare facilities near your location</p>
                        
                        {loading && (
                            <div className="flex items-center justify-center h-[500px]">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading your location and nearby hospitals...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center justify-center h-[500px]">
                                <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">⚠️</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                                    <p className="text-red-600">{error}</p>
                                    <button 
                                        onClick={() => window.location.reload()} 
                                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {userLocation && !loading && !error && (
                            <div>
                                <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <p className="text-emerald-800 text-sm">
                                        📍 Found <strong>{hospitals.length}</strong> hospitals near your location
                                    </p>
                                </div>
                                
                                <MapContainer 
                                    center={[userLocation.lat, userLocation.lon]} 
                                    zoom={14} 
                                    className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg"
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    
                                    {/* User Location Marker */}
                                    <Marker position={[userLocation.lat, userLocation.lon]}>
                                        <Popup>
                                            <div style={{ textAlign: 'center' }}>
                                                <b>📍 Your Location</b><br />
                                                <span style={{ color: '#059669', fontSize: '12px' }}>You are here</span>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    {/* Hospital Markers */}
                                    {hospitals.map((hospital, index) => (
                                        <Marker key={index} position={[hospital.lat, hospital.lon]}>
                                            <Popup>
                                                <div style={{ minWidth: '200px', textAlign: 'center' }}>
                                                    <div style={{ 
                                                        fontSize: '16px', 
                                                        fontWeight: 'bold', 
                                                        color: '#1F2937',
                                                        marginBottom: '8px' 
                                                    }}>
                                                        🏥 {hospital.name}
                                                    </div>
                                                    <a 
                                                        href={hospital.maps_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'inline-block',
                                                            backgroundColor: '#10B981',
                                                            color: 'white',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            textDecoration: 'none',
                                                            fontWeight: '500',
                                                            fontSize: '14px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#059669';
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#10B981';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        📍 View on Google Maps
                                                    </a>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientSupport;
