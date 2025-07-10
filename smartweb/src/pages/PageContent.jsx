import KontenPage from "./Konten";
import ProductsList from "./ProductList";

export const PageContent = ({ activeMenu, isSidebarOpen }) => {
    const renderContent = () => {
        switch (activeMenu) {
            case 'products':
                return (
                    <ProductsList isSidebarOpen={isSidebarOpen} />

                );
            case 'konten':
                return (<KontenPage />)
            case 'informasi-pengguna':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Informasi Profil</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input type="text" defaultValue="John Doe" className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" defaultValue="john.doe@example.com" className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                                    <input type="tel" defaultValue="+62 812 3456 7890" className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                                    <input type="text" defaultValue="Administrator" className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Halaman tidak ditemukan</div>;
        }
    };

    console.log(isSidebarOpen)
    return (
        <div
            className={`mt-16 p-6 bg-gray-50 min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-60" : "ml-16"
                }`}
        >
            {renderContent()}
        </div>
    );
};