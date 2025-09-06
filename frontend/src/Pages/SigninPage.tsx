import React, { useState, FormEvent, ChangeEvent } from "react";
import { FaEnvelope, FaLock, FaUserMd, FaUser, FaArrowRight, FaArrowLeft, FaGoogle } from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import GrpImg from '../assets/AuthImg.png';

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
            const response = await axios.post("http://localhost:3000/api/auth/login", {
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
                                Welcome Back
                            </h1>
                            <p className="text-gray-600">
                                Sign in to your account and continue your healthcare journey
                            </p>
                        </div>

                        {/* User Type Selection */}
                        <div className="flex gap-3 mb-8 justify-center">
                            <button
                                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
                                    userType === "patient" 
                                        ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors duration-300" 
                                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 "
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

                        {/* Signin Form */}
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Email */}
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white"
                                    value={email}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 bg-white"
                                    value={password}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full group inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors duration-300"
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
    );
};

export default SigninPage;
