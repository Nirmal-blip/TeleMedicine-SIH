import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../Components/Sidebar";
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

// Create custom icons with better design
const userIcon = new L.DivIcon({
  html: `
    <div style="
      background: linear-gradient(135deg, #3B82F6, #1E40AF);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      animation: pulse 2s infinite;
    ">
      👤
    </div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
        50% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.8); }
        100% { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
      }
    </style>
  `,
  className: 'custom-user-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const hospitalIcon = new L.DivIcon({
  html: `
    <div style="
      background: linear-gradient(135deg, #DC2626, #991B1B);
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 2px solid white;
      box-shadow: 0 3px 10px rgba(220, 38, 38, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transform: rotate(45deg);
      position: relative;
    ">
      <span style="transform: rotate(-45deg);">🏥</span>
    </div>
  `,
  className: 'custom-hospital-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

// Utility function to calculate distance between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

interface Hospital {
    name: string;
    lat: number;
    lon: number;
    maps_url: string;
    distance?: number;
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
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lon: longitude });

                fetch(`${(import.meta as any).env.VITE_FLASK_URL}/api/hospitals?lat=${latitude}&lon=${longitude}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then((data) => {
                        const hospitalsWithDistance = (data.hospitals || []).map((hospital: Hospital) => ({
                            ...hospital,
                            distance: calculateDistance(latitude, longitude, hospital.lat, hospital.lon)
                        })).sort((a: Hospital, b: Hospital) => (a.distance || 0) - (b.distance || 0));
                        
                        setHospitals(hospitalsWithDistance);
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

    const sortedHospitals = useMemo(() => {
        return hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }, [hospitals]);

    return (
        <div className="h-screen bg-cover bg-center bg-[#D8EFED] text-white relative poppins">
            <Sidebar />
            <div className="relative z-10 lg:ml-80 p-4 lg:p-6 min-h-screen overflow-y-auto">
                <div className="mt-6">
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                    🏥 Nearby Hospitals
                                </h1>
                                <p className="text-gray-600 text-lg">Find healthcare facilities near your location</p>
                            </div>
                            
                            {userLocation && !loading && !error && (
                                <div className="flex mt-4 lg:mt-0 space-x-3">
                                    <button
                                        onClick={() => setViewMode('map')}
                                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                            viewMode === 'map'
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg transform scale-105'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        🗺️ Map View
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                            viewMode === 'list'
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        📋 List View
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {loading && (
                            <div className="flex items-center justify-center h-[600px]">
                                <div className="text-center bg-gradient-to-br from-emerald-50 to-blue-50 p-12 rounded-3xl border border-emerald-100 shadow-lg">
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                                        <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Finding Nearby Hospitals</h3>
                                    <p className="text-gray-600 max-w-sm">Please wait while we locate healthcare facilities near you...</p>
                                    <div className="flex justify-center mt-4 space-x-1">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center justify-center h-[600px]">
                                <div className="text-center bg-gradient-to-br from-red-50 to-orange-50 p-12 rounded-3xl border border-red-200 shadow-lg max-w-md">
                                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <span className="text-3xl">⚠️</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-red-800 mb-3">Oops! Something went wrong</h3>
                                    <p className="text-red-600 mb-6 leading-relaxed">{error}</p>
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => window.location.reload()} 
                                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                        >
                                            🔄 Try Again
                                        </button>
                                        <p className="text-sm text-gray-500">Make sure location services are enabled</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {userLocation && !loading && !error && (
                            <div>
                                <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-lg">📍</span>
                                            </div>
                                            <div>
                                                <p className="text-emerald-800 font-semibold text-lg">
                                                    Found <span className="text-emerald-600">{hospitals.length}</span> hospitals near you
                                                </p>
                                                <p className="text-emerald-600 text-sm">
                                                    Sorted by distance • Closest first
                                                </p>
                                            </div>
                                        </div>
                                        {hospitals.length > 0 && (
                                            <div className="text-right">
                                                <p className="text-emerald-700 font-medium">
                                                    Nearest: {hospitals[0]?.distance?.toFixed(1)} km
                                                </p>
                                                <p className="text-emerald-600 text-sm">
                                                    {hospitals[0]?.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {viewMode === 'map' ? (
                                    <div className="relative">
                                        <MapContainer 
                                            center={[userLocation.lat, userLocation.lon]} 
                                            zoom={13} 
                                            className="h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
                                        >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    
                                        {/* User Location Marker - Enhanced */}
                                        <Marker 
                                            position={[userLocation.lat, userLocation.lon]} 
                                            icon={userIcon}
                                        >
                                            <Popup className="custom-popup">
                                                <div style={{ textAlign: 'center', minWidth: '220px', padding: '8px' }}>
                                                    <div style={{ 
                                                        fontSize: '20px', 
                                                        fontWeight: 'bold', 
                                                        background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        marginBottom: '12px',
                                                        borderBottom: '2px solid #E5E7EB',
                                                        paddingBottom: '8px'
                                                    }}>
                                                        📍 Your Location
                                                    </div>
                                                    <div style={{ 
                                                        color: '#059669', 
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        marginBottom: '8px'
                                                    }}>
                                                        🎯 You are here
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: '13px',
                                                        color: '#6B7280',
                                                        backgroundColor: '#F3F4F6',
                                                        padding: '6px 10px',
                                                        borderRadius: '8px',
                                                        fontFamily: 'monospace'
                                                    }}>
                                                        {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>

                                        {/* Hospital Markers - Enhanced */}
                                        {sortedHospitals.map((hospital, index) => (
                                            <Marker 
                                                key={index} 
                                                position={[hospital.lat, hospital.lon]}
                                                icon={hospitalIcon}
                                            >
                                                <Popup className="custom-popup">
                                                    <div style={{ minWidth: '280px', textAlign: 'center', padding: '12px' }}>
                                                        <div style={{ 
                                                            fontSize: '18px', 
                                                            fontWeight: 'bold', 
                                                            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                            marginBottom: '12px',
                                                            borderBottom: '2px solid #FEE2E2',
                                                            paddingBottom: '10px'
                                                        }}>
                                                            🏥 {hospital.name}
                                                        </div>
                                                        
                                                        <div style={{ 
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            marginBottom: '16px',
                                                            backgroundColor: '#F9FAFB',
                                                            padding: '10px',
                                                            borderRadius: '10px',
                                                            border: '1px solid #E5E7EB'
                                                        }}>
                                                            <div style={{ textAlign: 'left' }}>
                                                                <div style={{ 
                                                                    fontSize: '12px',
                                                                    color: '#6B7280',
                                                                    marginBottom: '4px'
                                                                }}>Distance</div>
                                                                <div style={{ 
                                                                    fontSize: '16px',
                                                                    fontWeight: 'bold',
                                                                    color: '#059669'
                                                                }}>
                                                                    {hospital.distance?.toFixed(1)} km
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <div style={{ 
                                                                    fontSize: '12px',
                                                                    color: '#6B7280',
                                                                    marginBottom: '4px'
                                                                }}>Ranking</div>
                                                                <div style={{ 
                                                                    fontSize: '16px',
                                                                    fontWeight: 'bold',
                                                                    color: '#DC2626'
                                                                }}>
                                                                    #{index + 1}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={{ 
                                                            fontSize: '11px',
                                                            color: '#9CA3AF',
                                                            marginBottom: '16px',
                                                            backgroundColor: '#F3F4F6',
                                                            padding: '6px 8px',
                                                            borderRadius: '6px',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            📍 {hospital.lat.toFixed(4)}, {hospital.lon.toFixed(4)}
                                                        </div>
                                                        
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <a 
                                                                href={hospital.maps_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => {
                                                                    console.log('Opening Google Maps:', hospital.maps_url);
                                                                    setTimeout(() => {
                                                                        window.open(hospital.maps_url, '_blank', 'noopener,noreferrer');
                                                                    }, 100);
                                                                    e.preventDefault();
                                                                }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                                                    color: 'white',
                                                                    padding: '12px 20px',
                                                                    borderRadius: '12px',
                                                                    textDecoration: 'none',
                                                                    fontWeight: '600',
                                                                    fontSize: '14px',
                                                                    transition: 'all 0.3s',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                                }}
                                                            >
                                                                🗺️ View on Google Maps
                                                            </a>
                                                            
                                                            <a 
                                                                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${hospital.lat},${hospital.lon}&travelmode=driving`}
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                                                                    color: 'white',
                                                                    padding: '12px 20px',
                                                                    borderRadius: '12px',
                                                                    textDecoration: 'none',
                                                                    fontWeight: '600',
                                                                    fontSize: '14px',
                                                                    transition: 'all 0.3s',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
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
                                    
                                        {/* Enhanced Map Legend */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '20px',
                                            right: '20px',
                                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
                                            backdropFilter: 'blur(10px)',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            zIndex: 1000,
                                            border: '1px solid rgba(255, 255, 255, 0.3)'
                                        }}>
                                            <div style={{ marginBottom: '12px', fontWeight: '700', color: '#1F2937', fontSize: '14px' }}>
                                                📍 Map Legend
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
                                                    borderRadius: '50%',
                                                    marginRight: '10px',
                                                    border: '3px solid white',
                                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                                                }}></div>
                                                <span style={{ color: '#374151', fontWeight: '600' }}>Your Location</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                                                    borderRadius: '8px',
                                                    marginRight: '10px',
                                                    border: '2px solid white',
                                                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                                                    transform: 'rotate(45deg)'
                                                }}></div>
                                                <span style={{ color: '#374151', fontWeight: '600' }}>Hospitals</span>
                                            </div>
                                            <div style={{ 
                                                fontSize: '11px', 
                                                color: '#6B7280', 
                                                marginTop: '8px',
                                                textAlign: 'center',
                                                fontStyle: 'italic'
                                            }}>
                                                Sorted by distance
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* List View */
                                    <div className="space-y-4">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Hospital Directory</h3>
                                            <p className="text-gray-600">Hospitals sorted by distance from your location</p>
                                        </div>
                                        
                                        {sortedHospitals.map((hospital, index) => (
                                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                            #{index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-xl font-bold text-gray-800 mb-2">{hospital.name}</h4>
                                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="text-emerald-500">📍</span>
                                                                    <span>{hospital.distance?.toFixed(1)} km away</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="text-blue-500">🗺️</span>
                                                                    <span>{hospital.lat.toFixed(4)}, {hospital.lon.toFixed(4)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-3">
                                                                <a 
                                                                    href={hospital.maps_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold text-center hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                                                >
                                                                    🗺️ View on Map
                                                                </a>
                                                                <a 
                                                                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${hospital.lat},${hospital.lon}&travelmode=driving`}
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold text-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                                                >
                                                                    🚗 Get Directions
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 px-3 py-2 rounded-lg border border-emerald-200">
                                                            <div className="text-xs text-emerald-600 font-medium">Distance</div>
                                                            <div className="text-lg font-bold text-emerald-700">{hospital.distance?.toFixed(1)}</div>
                                                            <div className="text-xs text-emerald-600">kilometers</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientSupport;