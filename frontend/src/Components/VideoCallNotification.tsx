import React from 'react';
import { FaVideo, FaPhone, FaTimes } from 'react-icons/fa';
import { NotificationData } from '../utils/notifications';

interface VideoCallNotificationProps {
  data: NotificationData;
  onJoin: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const VideoCallNotification: React.FC<VideoCallNotificationProps> = ({
  data,
  onJoin,
  onDecline,
  onClose
}) => {
  const { title, message, doctorName, patientName, type } = data;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <FaVideo className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
            <p className="text-xs text-gray-600">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      {(doctorName || patientName) && (
        <div className="mb-3 text-xs text-gray-500">
          {type === 'video-call-request' ? (
            <>From: {doctorName || patientName}</>
          ) : (
            <>With: {doctorName || patientName}</>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onJoin}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors"
        >
          <FaVideo className="w-3 h-3" />
          Join
        </button>
        <button
          onClick={onDecline}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors"
        >
          <FaPhone className="w-3 h-3" />
          Decline
        </button>
      </div>
    </div>
  );
};

export default VideoCallNotification;
