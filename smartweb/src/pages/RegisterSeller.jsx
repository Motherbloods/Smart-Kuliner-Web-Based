import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Store, MapPin, Phone, FileImage, Upload, ChefHat, UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RegisterSellerPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // Store Information
        store_name: '',
        owner_name: '',
        description: '',

        // Contact Information
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',

        // Address Information
        address: '',
        city: '',
        province: '',
        postal_code: '',

        // Store Images
        logo: null,
        banner: null,

        // Terms
        terms: false
    });
    const { registerSeller } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const handleChange = (e) => {
        const { name, type, value, checked, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            setFormData(prev => ({
                ...prev,
                [name]: file
            }));

            // Create preview
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (name === 'logo') {
                        setLogoPreview(reader.result);
                    } else if (name === 'banner') {
                        setBannerPreview(reader.result);
                    }
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            setError('Password tidak cocok');
            return;
        }

        if (!formData.terms) {
            setError('Harap setujui syarat dan ketentuan');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await registerSeller(formData);
            console.log('Seller registration successful:', response);
        } catch (error) {
            setError(error.message || 'Registrasi gagal');
        } finally {
            setLoading(false);
        }
    };

    const onSwitchToLogin = () => {
        navigate('/login');
    };

    const onBackToRegister = () => {
        navigate('/register');
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
            case 1: return 'Lemah';
            case 2: return 'Cukup';
            case 3: return 'Baik';
            case 4: return 'Kuat';
            case 5: return 'Sangat Kuat';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-2xl">
                {/* Logo and Brand */}
                <div className="flex items-center justify-center mb-8 transform hover:scale-105 transition-transform duration-300">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg mr-3">
                        <ChefHat className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        SMARTKULINER
                    </h1>

                </div>

                {/* Welcome Text */}
                <div className="text-center mb-8 px-4 sm:px-0">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
                        Daftar Sebagai Seller
                    </h2>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        Mulai berjualan dan kembangkan bisnis Anda bersama kami
                    </p>

                    {/* Navigation Links */}
                    <div className="flex flex-col space-y-2 text-sm">
                        <p className="text-gray-600">
                            Sudah memiliki akun seller?{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 cursor-pointer"
                            >
                                Masuk di sini
                            </button>
                        </p>
                        <p className="text-gray-600">
                            Ingin menjadi customer?{' '}
                            <button
                                onClick={onBackToRegister}
                                className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200 inline-flex items-center cursor-pointer"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Daftar sebagai customer
                            </button>
                        </p>
                    </div>
                </div>

            </div>

            {/* Registration Form */}
            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
                <div className="bg-white/80 backdrop-blur-sm py-8 px-4 sm:px-6 shadow-2xl border border-white/20 sm:rounded-2xl transform hover:shadow-3xl transition-all duration-300">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2 animate-shake">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {/* Store Information Section */}
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Store className="h-5 w-5 mr-2 text-blue-500" />
                                Informasi Toko
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Toko <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="store_name"
                                        type="text"
                                        required
                                        placeholder="Masukkan nama toko"
                                        value={formData.store_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Pemilik <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="owner_name"
                                        type="text"
                                        required
                                        placeholder="Masukkan nama pemilik"
                                        value={formData.owner_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi Toko
                                </label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    placeholder="Ceritakan tentang toko Anda..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Mail className="h-5 w-5 mr-2 text-blue-500" />
                                Informasi Kontak
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomor Telepon <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="phone_number"
                                        type="tel"
                                        required
                                        placeholder="08123456789"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="Minimal 8 karakter"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
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
                                        <div className="mt-2">
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
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Konfirmasi Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="password_confirmation"
                                            type={showPasswordConfirm ? 'text' : 'password'}
                                            required
                                            placeholder="Ulangi password"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 pr-12 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm ${formData.password_confirmation && formData.password !== formData.password_confirmation
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300'
                                                }`}
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
                        </div>

                        {/* Address Information Section */}
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                                Alamat Toko
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        rows="2"
                                        required
                                        placeholder="Jl. Nama Jalan No. 123, RT/RW, Kelurahan"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kota <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="city"
                                            type="text"
                                            required
                                            placeholder="Jakarta"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Provinsi <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="province"
                                            type="text"
                                            required
                                            placeholder="DKI Jakarta"
                                            value={formData.province}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kode Pos <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="postal_code"
                                            type="text"
                                            required
                                            placeholder="12345"
                                            value={formData.postal_code}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Store Images Section */}
                        <div className="pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FileImage className="h-5 w-5 mr-2 text-blue-500" />
                                Gambar Toko
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Logo Toko */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Logo Toko
                                    </label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF max 2MB</p>
                                            </div>
                                        )}
                                        <input
                                            name="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* Banner Toko */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Banner Toko
                                    </label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                                        {bannerPreview ? (
                                            <img
                                                src={bannerPreview}
                                                alt="Banner preview"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF max 2MB</p>
                                            </div>
                                        )}
                                        <input
                                            name="banner"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start space-x-3">
                            <input
                                name="terms"
                                type="checkbox"
                                checked={formData.terms}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                                required
                            />
                            <label className="text-sm text-gray-700 leading-relaxed">
                                Saya menyetujui{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200">
                                    syarat dan ketentuan
                                </a>{' '}
                                yang berlaku
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>MEMPROSES...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 cursor-pointer">
                                    <UserPlus className="h-5 w-5" />
                                    <span>DAFTAR SEBAGAI SELLER</span>
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
            `}</style>
        </div>
    );
}