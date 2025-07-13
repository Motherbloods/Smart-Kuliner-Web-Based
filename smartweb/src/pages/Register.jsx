import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ChefHat, UserPlus, Store, MapPin, Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodCategories, provinces } from '../utils/categories';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phoneNumber: '',
        password: '',
        password_confirmation: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        favoriteCategories: [],
        terms: false,
        remember: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Calculate password strength
        if (name === 'password') {
            let strength = 0;
            if (value.length >= 8) strength++;
            if (/[A-Z]/.test(value)) strength++;
            if (/[a-z]/.test(value)) strength++;
            if (/[0-9]/.test(value)) strength++;
            if (/[^A-Za-z0-9]/.test(value)) strength++;
            setPasswordStrength(strength);
        }
    };

    const handleCategoryChange = (category) => {
        setFormData(prev => ({
            ...prev,
            favoriteCategories: prev.favoriteCategories.includes(category)
                ? prev.favoriteCategories.filter(c => c !== category)
                : [...prev.favoriteCategories, category]
        }));
    };

    const formatPhoneNumber = (phone) => {
        let cleanPhone = phone.replace(/[^\d+]/g, '');
        if (!cleanPhone.startsWith('+')) {
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '+62' + cleanPhone.substring(1);
            } else if (cleanPhone.startsWith('62')) {
                cleanPhone = '+' + cleanPhone;
            } else {
                cleanPhone = '+62' + cleanPhone;
            }
        }
        return cleanPhone;
    };
    console.log(formData.gender)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.terms) {
            setError('Please accept the Terms & Conditions');
            return;
        }

        if (formData.favoriteCategories.length === 0) {
            setError('Please select at least one food category preference');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Prepare user data
            const userData = {
                name: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
                phoneNumber: formatPhoneNumber(formData.phoneNumber),
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                postalCode: formData.postalCode,
                favoriteCategories: formData.favoriteCategories,
                emailVerified: false,
                phoneVerified: false,
                seller: false,
                profileImageUrl: null,
                tokenFCM: null,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            };
            console.log(formData.gender)
            const response = await register(formData.email, formData.password, userData);
            console.log('Registration successful:', response);
            navigate('/');
        } catch (error) {
            setError(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const onSwitchToLogin = () => {
        navigate('/login');
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return 'bg-red-400';
            case 2: return 'bg-orange-400';
            case 3: return 'bg-yellow-400';
            case 4: return 'bg-green-400';
            case 5: return 'bg-green-500';
            default: return 'bg-gray-300';
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            case 5: return 'Very Strong';
            default: return '';
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

            <div className="relative z-10 mx-auto w-full max-w-md sm:max-w-2xl px-4 sm:px-0">

                {/* Logo and Brand */}
                <div className="flex items-center justify-center mb-8 transform hover:scale-105 transition-transform duration-300">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl shadow-lg mr-3">
                        <ChefHat className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold tracking-wide bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 bg-clip-text text-transparent">
                        SMARTKULINER
                    </h1>
                </div>

                {/* Welcome Text */}
                <div className="text-center mb-8">
                    <p className="text-gray-600 mb-4">
                        Buat akun Anda dan mulailah perjalanan kuliner Anda
                    </p>

                    {/* Navigation Links */}
                    <div className="flex flex-col space-y-2 text-sm">
                        <p className="text-gray-600">
                            Sudah punya akun?{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200 cursor-pointer"
                            >
                                Masuk di sini
                            </button>
                        </p>
                        <p className="text-gray-600">
                            Ingin menjual produk?{' '}
                            <button
                                onClick={() => navigate('/register-seller')}
                                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 inline-flex items-center cursor-pointer"
                            >
                                <Store className="h-4 w-4 mr-1" />
                                Daftar sebagai penjual
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Registration Form */}
            <div className="relative z-10 mx-auto w-full max-w-md sm:max-w-2xl px-4 sm:px-0">

                <div className="bg-white/80 backdrop-blur-sm py-8 px-4 sm:px-10 shadow-2xl border border-white/20 rounded-2xl transition-all duration-300">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2 animate-shake">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="group">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2 text-orange-500" />
                                Informasi Pribadi
                            </h3>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="relative">
                                    <input
                                        name="first_name"
                                        type="text"
                                        placeholder="Nama Depan"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        name="last_name"
                                        type="text"
                                        placeholder="Nama Belakang"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Date of Birth and Gender */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        required
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="group">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Phone className="h-5 w-5 mr-2 text-orange-500" />
                                Informasi Kontak
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        name="phoneNumber"
                                        type="tel"
                                        placeholder="Nomor Telepon (08xxxx atau +62xxxx)"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="group">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                                Informasi Alamat
                            </h3>

                            <div className="space-y-4">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <textarea
                                        name="address"
                                        placeholder="Alamat Lengkap"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm resize-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <input
                                            name="city"
                                            type="text"
                                            placeholder="Kota/Kabupaten"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <select
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                            required
                                        >
                                            <option value="">Pilih Provinsi</option>
                                            {provinces.map(province => (
                                                <option key={province} value={province}>{province}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <input
                                            name="postalCode"
                                            type="text"
                                            placeholder="Kode Pos"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Food Preferences */}
                        <div className="group">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <ChefHat className="h-5 w-5 mr-2 text-orange-500" />
                                Preferensi Kuliner
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">Pilih kategori makanan yang Anda sukai (minimal 1)</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {foodCategories.map(category => (
                                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.favoriteCategories.includes(category)}
                                            onChange={() => handleCategoryChange(category)}
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="group">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Lock className="h-5 w-5 mr-2 text-orange-500" />
                                Keamanan Akun
                            </h3>

                            <div className="space-y-4">
                                {/* Password Field */}
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors duration-200"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mb-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-600">
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mb-3">
                                    Minimum 8 karakter dengan huruf besar, huruf kecil, angka, dan karakter khusus
                                </p>

                                {/* Confirm Password Field */}
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        name="password_confirmation"
                                        type={showPasswordConfirm ? 'text' : 'password'}
                                        placeholder="Konfirmasi Password"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-12 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70 backdrop-blur-sm ${formData.password_confirmation && formData.password !== formData.password_confirmation
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors duration-200"
                                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    >
                                        {showPasswordConfirm ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Match Indicator */}
                                {formData.password_confirmation && (
                                    <div className="mt-1 text-xs">
                                        {formData.password === formData.password_confirmation ? (
                                            <span className="text-green-600 flex items-center">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                                Password cocok
                                            </span>
                                        ) : (
                                            <span className="text-red-600 flex items-center">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                                Password tidak cocok
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <input
                                    name="terms"
                                    type="checkbox"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                                    required
                                />
                                <label className="text-sm text-gray-700 leading-relaxed">
                                    Saya setuju dengan{' '}
                                    <a href="#" className="text-orange-600 hover:text-orange-500 font-medium transition-colors duration-200">
                                        Syarat & Ketentuan
                                    </a>{' '}
                                    dan{' '}
                                    <a href="#" className="text-orange-600 hover:text-orange-500 font-medium transition-colors duration-200">
                                        Kebijakan Privasi
                                    </a>
                                </label>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>MEMBUAT AKUN...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <UserPlus className="h-5 w-5" />
                                    <span>BUAT AKUN</span>
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }

                @media (max-width: 640px) {
                    .absolute.bg-gradient-to-br {
                    width: 10rem !important;
                    height: 10rem !important;
                    }
                }
            `}</style>

        </div>
    );
}