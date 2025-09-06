import React, { useState, useEffect } from 'react';
import { FaPhone, FaPhoneSlash, FaTimes } from 'react-icons/fa';

interface VideoCallPopupProps {
  isVisible: boolean;
  callData: {
    callId: string;
    patientName: string;
    doctorName: string;
    specialization: string;
    requestedAt: string;
  } | null;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

const VideoCallPopup: React.FC<VideoCallPopupProps> = ({
  isVisible,
  callData,
  onAccept,
  onReject,
  onClose
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVisible && callData) {
      const startTime = new Date(callData.requestedAt).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        setTimeElapsed(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVisible, callData]);

  if (!isVisible || !callData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <FaPhone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Incoming Video Call</h3>
              <p className="text-sm text-gray-500">Calling for {timeElapsed}s</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Call Details */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {callData.patientName.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{callData.patientName}</h4>
                <p className="text-sm text-gray-600">{callData.specialization} Consultation</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p>Call ID: {callData.callId}</p>
              <p>Requested: {new Date(callData.requestedAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onReject}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <FaPhoneSlash className="w-5 h-5" />
            Reject
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <FaPhone className="w-5 h-5" />
            Accept
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Accept to start the video consultation
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPopup;
