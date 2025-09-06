import React, { useState } from 'react';
import { FaCalendar, FaClock, FaVideo, FaStethoscope, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { getVideoCallNotificationService } from '../utils/video-call-notifications';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  totalPatients: number;
  consultationFee: number;
  availability: string;
  nextAvailable: string;
  languages: string[];
  education: string;
  hospital: string;
  image: string;
  bio: string;
  isOnline: boolean;
}

interface AppointmentBookingProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (appointmentId: string) => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  doctor,
  isOpen,
  onClose,
  onBookingSuccess
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>('');

  // Generate available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return dates;
  };

  // Generate available time slots
  const getAvailableTimeSlots = () => {
    const timeSlots = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        timeSlots.push({
          value: time,
          label: displayTime
        });
      }
    }
    
    return timeSlots;
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !reason.trim()) {
      setBookingError('Please fill in all required fields');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    try {
      // Get current patient ID
      const patientResponse = await axios.get('http://localhost:3000/api/patients/me', {
        withCredentials: true
      });
      
      const response = await axios.post('http://localhost:3000/api/appointments', {
        doctor: doctor.id,
        patient: patientResponse.data._id,
        date: selectedDate,
        time: selectedTime,
        reason: reason.trim(),
        status: 'Pending'
      }, {
        withCredentials: true
      });

      console.log('Appointment booked successfully:', response.data);
      onBookingSuccess(response.data._id);
      
      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
      onClose();
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      setBookingError(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleVideoConsultationNow = async () => {
    // For immediate consultation, create a special appointment
    setIsBooking(true);
    setBookingError('');

    try {
      // Get current patient ID
      const patientResponse = await axios.get('http://localhost:3000/api/patients/me', {
        withCredentials: true
      });
      
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

      const response = await axios.post('http://localhost:3000/api/appointments', {
        doctor: doctor.id,
        patient: patientResponse.data._id,
        date: currentDate,
        time: currentTime,
        reason: 'Immediate Video Consultation',
        status: 'Confirmed'
      }, {
        withCredentials: true
      });

      console.log('Immediate consultation booked:', response.data);
      
      // Initialize video call notification service if not already done
      let videoCallService = getVideoCallNotificationService();
      if (!videoCallService) {
        const { initializeVideoCallNotificationService } = await import('../utils/video-call-notifications');
        videoCallService = initializeVideoCallNotificationService(patientResponse.data._id, 'patient');
      }

      if (videoCallService) {
        const callId = videoCallService.requestVideoCall({
          doctorId: doctor.id,
          doctorName: doctor.name,
          patientName: patientResponse.data.fullname || 'Patient',
          specialization: doctor.specialization,
          appointmentId: response.data._id,
        });

        if (callId) {
          // Fetch doctor's data to get the correct doctorId
          let doctorData = null;
          try {
            const doctorResponse = await axios.get(`http://localhost:3000/api/doctors/${doctor.id}`, {
              withCredentials: true
            });
            doctorData = doctorResponse.data;
            console.log('Doctor data fetched:', doctorData);
          } catch (doctorError) {
            console.error('Failed to fetch doctor data:', doctorError);
          }

          // Only create notification if we have the doctor's custom doctorId
          if (doctorData?.doctorId) {
            try {
              await axios.post('http://localhost:3000/api/notifications/video-call', {
                patientId: patientResponse.data.patientId, // Custom patient ID (PAT2025000006)
                doctorId: doctorData.doctorId, // Custom doctor ID (DOC2025000001) - ONLY custom ID
                patientName: patientResponse.data.fullname || 'Patient',
                doctorName: doctorData.fullname || doctor.name,
                appointmentId: response.data._id,
                callId: callId,
                type: 'video_call_request'
              }, {
                withCredentials: true
              });
              console.log('Video call notification sent to doctor with IDs:', {
                patientId: patientResponse.data.patientId,
                doctorId: doctorData.doctorId
              });
            } catch (notificationError) {
              console.error('Failed to send notification to doctor:', notificationError);
              // Don't stop the video call process if notification fails
            }
          } else {
            console.error('Could not get doctor custom ID - notification not sent');
          }

          // Store appointment data for video consultation
          localStorage.setItem('activeAppointment', JSON.stringify({
            appointmentId: response.data._id,
            doctorId: doctor.id,
            doctorName: doctor.name,
            callId: callId
          }));

          // Set up event listeners for call response
          videoCallService.onCallAccepted((data) => {
            console.log('Call accepted:', data);
            // Create notification for call acceptance (only if we have custom doctorId)
            if (doctorData?.doctorId) {
              axios.post('http://localhost:3000/api/notifications/video-call', {
                patientId: patientResponse.data.patientId,
                doctorId: doctorData.doctorId, // Only use custom doctor ID
                patientName: patientResponse.data.fullname || 'Patient',
                doctorName: doctorData.fullname || doctor.name,
                appointmentId: response.data._id,
                callId: callId,
                type: 'video_call_accepted'
              }, {
                withCredentials: true
              }).catch(error => console.error('Failed to send acceptance notification:', error));
            }
            
            // Navigate to video consultation page
            window.location.href = '/video-consultation';
          });

          videoCallService.onCallRejected((data) => {
            console.log('Call rejected:', data);
            // Create notification for call rejection (only if we have custom doctorId)
            if (doctorData?.doctorId) {
              axios.post('http://localhost:3000/api/notifications/video-call', {
                patientId: patientResponse.data.patientId,
                doctorId: doctorData.doctorId, // Only use custom doctor ID
                patientName: patientResponse.data.fullname || 'Patient',
                doctorName: doctorData.fullname || doctor.name,
                appointmentId: response.data._id,
                callId: callId,
                type: 'video_call_rejected'
              }, {
                withCredentials: true
              }).catch(error => console.error('Failed to send rejection notification:', error));
            }
            
            setBookingError(data.message || 'Doctor is not available at the moment.');
            setIsBooking(false);
            // Redirect to dashboard after a delay
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 3000);
          });

          videoCallService.onCallRequestSent((data) => {
            console.log('Call request sent:', data);
            // Show success message
            setBookingError('');
          });

          videoCallService.onCallError((data) => {
            console.error('Call error:', data);
            setBookingError(data.message);
            setIsBooking(false);
          });
        }
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to start immediate consultation:', error);
      setBookingError(error.response?.data?.message || 'Failed to start consultation. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">Book Consultation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Doctor Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50 rounded-xl">
            <img 
              src={doctor.image} 
              alt={doctor.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
              <p className="text-emerald-600 font-medium">{doctor.specialization}</p>
              <p className="text-sm text-gray-600">{doctor.experience} years experience</p>
            </div>
          </div>

          {/* Immediate Video Consultation Option */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <FaVideo className="text-blue-600" />
              Start Video Consultation Now
            </h4>
            <p className="text-blue-600 text-sm mb-3">
              Connect immediately with {doctor.name} for urgent consultation
            </p>
            <button
              onClick={handleVideoConsultationNow}
              disabled={isBooking}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaVideo />
              {isBooking ? 'Starting...' : 'Start Video Call'}
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">or schedule for later</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Booking Error */}
          {bookingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{bookingError}</p>
            </div>
          )}

          {/* Date Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaCalendar className="text-emerald-600" />
              Select Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Choose a date</option>
              {getAvailableDates().map(date => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaClock className="text-emerald-600" />
              Select Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Choose a time</option>
              {getAvailableTimeSlots().map(time => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason for Visit */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaStethoscope className="text-emerald-600" />
              Reason for Consultation
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe your symptoms or reason for consultation..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-24 resize-none"
            />
          </div>

          {/* Consultation Fee */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Consultation Fee:</span>
              <span className="text-2xl font-bold text-emerald-600">₹{doctor.consultationFee}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleBookAppointment}
              disabled={isBooking || !selectedDate || !selectedTime || !reason.trim()}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBooking ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
