import React, { useState, useRef, useEffect } from 'react'
import { FiVideo, FiVideoOff, FiMic, FiMicOff, FiPhone, FiMessageCircle, FiSettings, FiMaximize2, FiMinimize2, FiUsers } from 'react-icons/fi'
import Sidebar from '../../Components/Sidebar'
import PatientHeader from '../../Components/PatientHeader'

const VideoConsultation: React.FC = () => {
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isAudioOn, setIsAudioOn] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting')
    const [callDuration, setCallDuration] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        // Simulate call connection
        const timer = setTimeout(() => setCallStatus('connected'), 3000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        let interval: number
        if (callStatus === 'connected') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [callStatus])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const toggleVideo = () => setIsVideoOn(!isVideoOn)
    const toggleAudio = () => setIsAudioOn(!isAudioOn)
    const toggleFullscreen = () => setIsFullscreen(!isFullscreen)
    const endCall = () => setCallStatus('ended')

    if (callStatus === 'ended') {
    return (
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto">
                    <PatientHeader />
                    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                        <div className="text-center max-w-md">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiPhone className="w-12 h-12 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Call Ended</h2>
                            <p className="text-gray-600 mb-6">Your consultation with Dr. Sarah Johnson has ended.</p>
                            <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 transition-colors">
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-900">
            {!isFullscreen && <Sidebar />}
            
            <main className={`flex-1 relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
                {!isFullscreen && (
                    <div className="bg-white p-4 border-b">
                        <PatientHeader />
                    </div>
                )}
                
                {/* Video Call Interface */}
                <div className="relative h-full bg-gray-900 flex flex-col">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-20 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                        callStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                                        callStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <span className="text-white font-medium">
                                        {callStatus === 'connecting' ? 'Connecting...' :
                                         callStatus === 'connected' ? `Connected • ${formatTime(callDuration)}` : 'Disconnected'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowChat(!showChat)}
                                    className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                                >
                                    <FiMessageCircle className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                                >
                                    {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Video Area */}
                    <div className="flex-1 relative p-6 pt-20">
                        {/* Remote Video (Doctor) */}
                        <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl overflow-hidden relative shadow-2xl">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiUsers className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Dr. Sarah Johnson</h3>
                                    <p className="text-emerald-100">Cardiologist</p>
                                </div>
                            </div>
                            
                            {/* Doctor info overlay */}
                            <div className="absolute bottom-6 left-6">
                                <div className="bg-black/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                                    <p className="text-white font-medium">Dr. Sarah Johnson</p>
                                </div>
                            </div>
                        </div>

                        {/* Local Video (Patient) - Picture in Picture */}
                        <div className="absolute bottom-6 right-6 w-64 h-48 bg-gray-800 rounded-2xl overflow-hidden shadow-xl border-4 border-white/20">
                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center relative">
                                {isVideoOn ? (
                                    <div className="text-center text-white">
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <FiUsers className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm">You</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-white">
                                        <FiVideoOff className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">Camera Off</p>
                                    </div>
                                )}
                                
                                {!isAudioOn && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                        <FiMicOff className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={toggleAudio}
                                className={`p-4 rounded-2xl transition-all duration-300 ${
                                    isAudioOn 
                                        ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30' 
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                            >
                                {isAudioOn ? <FiMic className="w-6 h-6" /> : <FiMicOff className="w-6 h-6" />}
                            </button>
                            
                            <button
                                onClick={toggleVideo}
                                className={`p-4 rounded-2xl transition-all duration-300 ${
                                    isVideoOn 
                                        ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30' 
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                            >
                                {isVideoOn ? <FiVideo className="w-6 h-6" /> : <FiVideoOff className="w-6 h-6" />}
                            </button>
                            
                            <button
                                onClick={endCall}
                                className="p-4 bg-red-500 rounded-2xl text-white hover:bg-red-600 transition-colors transform hover:scale-105"
                            >
                                <FiPhone className="w-6 h-6" />
                            </button>
                            
                            <button className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl text-white hover:bg-white/30 transition-colors">
                                <FiSettings className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Sidebar */}
                    {showChat && (
                        <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">Chat</h3>
                                    <button
                                        onClick={() => setShowChat(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-4">
                                <div className="space-y-4">
                                    <div className="bg-emerald-50 p-3 rounded-2xl rounded-bl-sm">
                                        <p className="text-sm text-emerald-800">Hello! How are you feeling today?</p>
                                        <span className="text-xs text-emerald-600">Dr. Sarah • 2 min ago</span>
                                    </div>
                                    
                                    <div className="bg-blue-50 p-3 rounded-2xl rounded-br-sm ml-8">
                                        <p className="text-sm text-blue-800">I've been having some chest pain lately.</p>
                                        <span className="text-xs text-blue-600">You • 1 min ago</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default VideoConsultation
