import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

interface OtpVerificationProps {
  email: string;
  purpose: 'signup' | 'signin';
  onSuccess: (verifiedOtp: string) => void;
  onBack: () => void;
  onResend: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  email,
  purpose,
  onSuccess,
  onBack,
  onResend,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      // Instead of verifying OTP separately, pass it directly to onSuccess
      // The parent component will handle the actual verification with the backend
      toast.success('OTP verified successfully!');
      onSuccess(otpString);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to verify OTP';
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setTimeLeft(300); // Reset timer
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaEnvelope className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-emerald-100">
            We've sent a 6-digit code to
          </p>
          <p className="text-white font-semibold">{email}</p>
        </div>

        {/* OTP Form */}
        <div className="p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter the verification code
            </label>
            <div className="flex justify-center space-x-3 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            {timeLeft > 0 ? (
              <p className="text-gray-600">
                Code expires in <span className="font-semibold text-emerald-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-red-600 font-medium">Code expired</p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isVerifying || otp.join('').length !== 6}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-2" />
                Verify Code
              </>
            )}
          </button>

          {/* Resend Button */}
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={isResending || timeLeft > 0}
              className="text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 font-medium transition-colors duration-200"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 flex items-center justify-center mx-auto"
            >
              <FaArrowLeft className="mr-2" />
              Back to {purpose === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
