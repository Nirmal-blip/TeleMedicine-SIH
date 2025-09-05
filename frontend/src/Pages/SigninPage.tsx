import React, { useState, FormEvent, ChangeEvent } from "react";
import { FaEnvelope, FaLock, FaUserMd, FaUser, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const SigninPage: React.FC = () => {
    const [userType, setUserType] = useState<string>("patient");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await axios.post("http://localhost:3000/login", {
                email,
                password,
                userType,
            }, { withCredentials: true });
            console.log(response)
            setSuccess(`Login successful as ${userType}`);
            navigate(userType === "patient" ? "/patient-dashboard" : "/doctor-dashboard");
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid email or password. Please try again.");
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
                            Welcome Back
                        </h1>
                        <p className="text-emerald-100 text-xl max-w-2xl mx-auto">
                            Sign in to your account and continue your healthcare journey
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 pb-16">
                <div className="container-padding landing-padding-lg">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-scale">
                            <div className="p-8">
                                {/* User Type Selection */}
                                <div className="flex gap-4 mb-8 justify-center">
                                    <button
                                        className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                            userType === "patient" 
                                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" 
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                        onClick={() => setUserType("patient")}
                                    >
                                        <FaUser className="mr-2" />
                                        Patient
                                    </button>
                                    <button
                                        className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                            userType === "doctor" 
                                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" 
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                        onClick={() => setUserType("doctor")}
                                    >
                                        <FaUserMd className="mr-2" />
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

                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    {/* Email */}
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
                                            value={email}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
                                            value={password}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        <span>{userType === "patient" ? "Sign in as Patient" : "Sign in as Doctor"}</span>
                                        <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                    </button>

                                    {/* Register Link */}
                                    <p className="text-center text-gray-600">
                                        Don't have an account?{" "}
                                        <Link
                                            to="/signup"
                                            className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors duration-300"
                                        >
                                            Register here
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

export default SigninPage;
