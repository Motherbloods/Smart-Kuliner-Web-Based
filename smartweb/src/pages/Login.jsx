import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthServices';

export default function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login({
                email,
                password,

            });
            console.log('Login successful:', response);
            // Simulate redirect
            alert('Login successful! Redirecting to dashboard...');
        } catch (error) {
            setError(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-200 to-pink-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-100 to-red-100 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo and Brand */}
                <div className="flex items-center justify-center mb-8 transform hover:scale-105 transition-transform duration-300">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl shadow-lg mr-3">
                        <ChefHat className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-wide bg-gradient-to-br from-[#E53935] to-[#4DA8DA] bg-clip-text text-transparent">
                        SMARTKULINER
                    </h1>

                </div>

                {/* Welcome Text */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back!</h2>
                    <p className="text-gray-600">
                        Sign in to your culinary journey
                    </p>
                </div>
            </div>

            {/* Login Form */}
            <div className="relative z-10  sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-2xl border border-white/20 sm:rounded-2xl sm:px-10 transform hover:shadow-3xl transition-all duration-300">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2 animate-shake">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Email Field */}
                        <div className="group">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="group">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors duration-200"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>



                        {/* Login Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>LOGGING IN...</span>
                                </div>
                            ) : (
                                'LOGIN'
                            )}
                        </button>

                    </div>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/register')} className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
                                Sign up here
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}