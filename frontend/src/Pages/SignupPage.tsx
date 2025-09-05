import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FaEnvelope, FaIdCard, FaLock, FaPhone, FaUser, FaCalendar, FaVenusMars, FaMapMarkerAlt, FaStethoscope, FaUserMd, FaArrowRight, FaArrowLeft, FaGoogle } from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import GrpImg from '../assets/AuthImg.png';

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
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="flex min-h-screen flex-row bg-emerald-50">
                {/* Left Side - Image */}
                <div className="hidden lg:flex lg:w-[65%] bg-white relative overflow-hidden h-screen rounded-r-[6rem]">
                    {/* Main Image */}
                    <div className="flex w-full h-full items-center justify-center">
                        <img 
                            src={GrpImg}
                            alt="TeleMedicine Healthcare" 
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-[35%] flex flex-col bg-emerald-50 justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto w-full">
                        {/* Back Navigation */}
                        <div className="absolute top-6 right-6">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors duration-300 cursor-pointer"
                            >
                                <FaArrowLeft className="mr-2" />
                                Back to Home
                            </button>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Create Account
                            </h1>
                            <p className="text-gray-600">
                                Choose your account type and get started
                            </p>
                        </div>

                        {/* User Type Selection */}
                        <div className="flex gap-3 mb-8 justify-center">
                            <button
                                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
                                    userType === "patient" 
                                        ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors duration-300" 
                                        : "bg-emerald-100 text-gremeralday-700 hover:bg-emerald-200"
                                }`}
                                onClick={() => setUserType("patient")}
                            >
                                <FaUser className="mr-2" />
                                Patient
                            </button>
                            <button
                                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
                                    userType === "doctor" 
                                        ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors duration-300" 
                                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                }`}
                                onClick={() => setUserType("doctor")}
                            >
                                <FaUserMd className="mr-2" />
                                Doctor
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                                {success}
                            </div>
                        )}

                        {/* Google Auth Button */}
                        <button
                            type="button"
                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-300 mb-6"
                        >
                            <FaGoogle className="mr-3 text-red-500" />
                            Continue with Google
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-emerald-50 text-gray-500">Or continue with email</span>
                            </div>
                        </div>

                        {/* Signup Form */}
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Row 1: Name & Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        name="fullname" 
                                        value={formData.fullname} 
                                        onChange={handleChange} 
                                        placeholder="Full Name" 
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white" 
                                        required 
                                    />
                                </div>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        placeholder="Email Address" 
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white" 
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Row 2: Phone & Date of Birth */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        placeholder="Phone Number" 
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white" 
                                        required 
                                    />
                                </div>
                                <div className="relative">
                                    <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="date" 
                                        name="dateOfBirth" 
                                        value={formData.dateOfBirth} 
                                        onChange={handleChange} 
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white" 
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Row 3: Gender & Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <FaVenusMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select 
                                        name="gender" 
                                        value={formData.gender} 
                                        onChange={handleChange} 
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white" 
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        name="location" 
                                        value={formData.location} 
                                        onChange={handleChange} 
                                        placeholder="Location" 
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white" 
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Doctor-Specific Fields */}
                            {userType === "doctor" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            name="medicalRegNo" 
                                            value={formData.medicalRegNo} 
                                            onChange={handleChange} 
                                            placeholder="Medical Registration Number" 
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white" 
                                            required 
                                        />
                                    </div>
                                    <div className="relative">
                                        <FaStethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            name="specialization" 
                                            value={formData.specialization} 
                                            onChange={handleChange} 
                                            placeholder="Specialization" 
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white" 
                                            required 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password */}
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full group inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors duration-300"
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
    );
};

export default SignupPage;
