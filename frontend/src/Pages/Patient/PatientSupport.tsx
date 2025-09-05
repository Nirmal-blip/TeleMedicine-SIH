import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import PatientHeader from "../../Components/PatientHeader";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [35, 51],
  iconAnchor: [17, 51],
  popupAnchor: [1, -34],
  shadowSize: [51, 51]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

                fetch(`http://localhost:8000/api/hospitals?lat=${latitude}&lon=${longitude}`)
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
        <div className="h-screen bg-cover bg-center bg-[#D8EFED] text-white relative poppins">
            <Sidebar />
            <div className="relative z-10 lg:ml-80 p-4 lg:p-6 min-h-screen overflow-y-auto">
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
                                        <span className="text-2xl">⚠</span>
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
                                
                                <div className="relative">
                                    <MapContainer 
                                        center={[userLocation.lat, userLocation.lon]} 
                                        zoom={13} 
                                        className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg"
                                    >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    
                                    {/* User Location Marker - Prominent */}
                                    <Marker 
                                        position={[userLocation.lat, userLocation.lon]} 
                                        icon={userIcon}
                                    >
                                        <Popup>
                                            <div style={{ textAlign: 'center', minWidth: '180px' }}>
                                                <div style={{ 
                                                    fontSize: '18px', 
                                                    fontWeight: 'bold', 
                                                    color: '#1E40AF',
                                                    marginBottom: '8px' 
                                                }}>
                                                    📍 Your Location
                                                </div>
                                                <div style={{ 
                                                    color: '#059669', 
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}>
                                                    🎯 You are here
                                                </div>
                                                <div style={{ 
                                                    fontSize: '12px',
                                                    color: '#6B7280',
                                                    marginTop: '4px'
                                                }}>
                                                    Lat: {userLocation.lat.toFixed(4)}, Lon: {userLocation.lon.toFixed(4)}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    {/* Hospital Markers */}
                                    {hospitals.map((hospital, index) => (
                                        <Marker 
                                            key={index} 
                                            position={[hospital.lat, hospital.lon]}
                                            icon={hospitalIcon}
                                        >
                                            <Popup>
                                                <div style={{ minWidth: '220px', textAlign: 'center' }}>
                                                    <div style={{ 
                                                        fontSize: '16px', 
                                                        fontWeight: 'bold', 
                                                        color: '#DC2626',
                                                        marginBottom: '10px',
                                                        borderBottom: '1px solid #E5E7EB',
                                                        paddingBottom: '8px'
                                                    }}>
                                                        🏥 {hospital.name}
                                                    </div>
                                                    
                                                    <div style={{ 
                                                        fontSize: '12px',
                                                        color: '#6B7280',
                                                        marginBottom: '12px'
                                                    }}>
                                                        📍 {hospital.lat.toFixed(4)}, {hospital.lon.toFixed(4)}
                                                    </div>
                                                    
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <a 
                                                            href={hospital.maps_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => {
                                                                // Ensure the link works by logging and testing
                                                                console.log('Opening Google Maps:', hospital.maps_url);
                                                                // Add a small delay to ensure popup doesn't interfere
                                                                setTimeout(() => {
                                                                    window.open(hospital.maps_url, '_blank', 'noopener,noreferrer');
                                                                }, 100);
                                                                e.preventDefault();
                                                            }}
                                                            style={{
                                                                display: 'inline-block',
                                                                backgroundColor: '#10B981',
                                                                color: 'white',
                                                                padding: '10px 16px',
                                                                borderRadius: '8px',
                                                                textDecoration: 'none',
                                                                fontWeight: '600',
                                                                fontSize: '13px',
                                                                transition: 'all 0.2s',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#059669';
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#10B981';
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                            }}
                                                        >
                                                            🗺 View on Google Maps
                                                        </a>
                                                        
                                                        <a 
                                                            href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${hospital.lat},${hospital.lon}&travelmode=driving`}
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'inline-block',
                                                                backgroundColor: '#3B82F6',
                                                                color: 'white',
                                                                padding: '10px 16px',
                                                                borderRadius: '8px',
                                                                textDecoration: 'none',
                                                                fontWeight: '600',
                                                                fontSize: '13px',
                                                                transition: 'all 0.2s',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#2563EB';
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#3B82F6';
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                            }}
                                                        >
                                                            🚗 Get Directions
                                                        </a>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                    </MapContainer>
                                    
                                    {/* Map Legend */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        zIndex: 1000
                                    }}>
                                        <div style={{ marginBottom: '8px', fontWeight: '600', color: '#1F2937' }}>
                                            📍 Map Legend
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: '#3B82F6',
                                                borderRadius: '50%',
                                                marginRight: '8px',
                                                border: '2px solid white',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                            }}></div>
                                            <span style={{ color: '#374151' }}>Your Location</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: '#DC2626',
                                                borderRadius: '50%',
                                                marginRight: '8px',
                                                border: '2px solid white',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                            }}></div>
                                            <span style={{ color: '#374151' }}>Hospitals</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientSupport;