import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FaEnvelope, FaIdCard, FaLock, FaPhone, FaUser, FaCalendar, FaVenusMars, FaMapMarkerAlt, FaStethoscope, FaUserMd, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface FormData {
    fullname: string;
    email: string;
    phone: string;
    password: string;
    dateOfBirth: string;
    gender: string;
    location: string;
    medicalRegNo: string;
    specialization: string;
}

const SignupPage: React.FC = () => {
    const [userType, setUserType] = useState<string>("patient");
    const [formData, setFormData] = useState<FormData>({
        fullname: "",
        email: "",
        phone: "",
        password: "",
        dateOfBirth: "",
        gender: "",
        location: "",
        medicalRegNo: "",
        specialization: ""
    });

    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const navigate = useNavigate();

    // Handle Input Change
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Form Submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Remove unnecessary fields based on user type
        // Only include medicalRegNo and specialization for doctors
        const payload = {
            ...formData,
            userType,
            ...(userType === "doctor"
                ? {}
                : { medicalRegNo: undefined, specialization: undefined })
        };

        try {
            console.log('Sending registration payload:', payload);
            const response = await axios.post("http://localhost:3000/register", payload, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            setSuccess(response.data.message);
            setFormData({
                fullname: "",
                email: "",
                phone: "",
                password: "",
                dateOfBirth: "",
                gender: "",
                location: "",
                medicalRegNo: "",
                specialization: ""
            });

            navigate(userType === "patient" ? "/patient-dashboard" : "/doctor-dashboard");
        } catch (err: any) {
            console.error('Registration error:', err.response?.data);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Registration failed!";
            setError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen gradient-bg-primary relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-float"></div>
                <div className="absolute bottom-20 right-16 w-24 h-24 bg-white rounded-full animate-float-delayed"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse-slow"></div>
                <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-white rounded-full animate-float"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 pt-8 pb-4">
                <div className="container-padding landing-padding-lg">
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-white hover:text-emerald-200 transition-colors duration-300 mb-8"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Home
                    </Link>
                    
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                            <FaUserMd className="text-white text-3xl" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-secondary">
                            Join TeleMedicine
                        </h1>
                        <p className="text-emerald-100 text-xl max-w-2xl mx-auto">
                            Start your healthcare journey today and experience the future of medical care
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 pb-16">
                <div className="container-padding landing-padding-lg">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-scale">
                            <div className="p-8">
                                {/* User Type Selection */}
                                <div className="flex gap-4 mb-8 justify-center">
                                    <button
                                        className={`flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                                            userType === "patient" 
                                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" 
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                        onClick={() => setUserType("patient")}
                                    >
                                        <FaUser className="mr-3" />
                                        Patient
                                    </button>
                                    <button
                                        className={`flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                                            userType === "doctor" 
                                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" 
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                        onClick={() => setUserType("doctor")}
                                    >
                                        <FaUserMd className="mr-3" />
                                        Doctor
                                    </button>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-slide-down">
                                        {error}
                                    </div>
                                )}

                                {/* Success Message */}
                                {success && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-slide-down">
                                        {success}
                                    </div>
                                )}

                                {/* Signup Form */}
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    {/* Row 1: Name & Email */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type="text" 
                                                name="fullname" 
                                                value={formData.fullname} 
                                                onChange={handleChange} 
                                                placeholder="Full Name" 
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white" 
                                                required 
                                            />
                                        </div>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange} 
                                                placeholder="Email Address" 
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white" 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    {/* Row 2: Phone & Date of Birth */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type="tel" 
                                                name="phone" 
                                                value={formData.phone} 
                                                onChange={handleChange} 
                                                placeholder="Phone Number" 
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white" 
                                                required 
                                            />
                                        </div>
                                        <div className="relative">
                                            <FaCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type="date" 
                                                name="dateOfBirth" 
                                                value={formData.dateOfBirth} 
                                                onChange={handleChange} 
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white" 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Gender & Location */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <FaVenusMars className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <select 
                                                name="gender" 
                                                value={formData.gender} 
                                                onChange={handleChange} 
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white" 
                                                required
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="relative">
                                            <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type="text" 
                                                name="location" 
                                                value={formData.location} 
                                                onChange={handleChange} 
                                                placeholder="Location" 
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white" 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    {/* Doctor-Specific Fields */}
                                    {userType === "doctor" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="relative">
                                                <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    name="medicalRegNo" 
                                                    value={formData.medicalRegNo} 
                                                    onChange={handleChange} 
                                                    placeholder="Medical Registration Number" 
                                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white" 
                                                    required 
                                                />
                                            </div>
                                            <div className="relative">
                                                <FaStethoscope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    name="specialization" 
                                                    value={formData.specialization} 
                                                    onChange={handleChange} 
                                                    placeholder="Specialization" 
                                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white" 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Password */}
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Password"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
                                            required
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        <span>{userType === "patient" ? "Register as Patient" : "Register as Doctor"}</span>
                                        <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                    </button>

                                    {/* Login Link */}
                                    <p className="text-center text-gray-600">
                                        Already have an account?{" "}
                                        <Link
                                            to="/signin"
                                            className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors duration-300"
                                        >
                                            Sign In
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
