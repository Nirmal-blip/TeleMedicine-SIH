import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleBackdropClick}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full animate-fade-scale">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 z-10"
                >
                    <FaTimes className="text-gray-600 text-sm" />
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaExclamationTriangle className="text-2xl text-emerald-600" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-600 text-center mb-6 leading-relaxed">
                        {message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
