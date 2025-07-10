import KontenPage from "./Konten";
import ProductsList from "./ProductList";
import Profile from "./Profile";
import RecipePage from "./Resep";

export const PageContent = ({ activeMenu, isSidebarOpen }) => {
    const renderContent = () => {
        switch (activeMenu) {
            case 'products':
                return (
                    <ProductsList isSidebarOpen={isSidebarOpen} />

                );
            case 'konten':
                return (<KontenPage />)
            case 'resep':
                return (
                    <RecipePage />
                )
            case 'profile':
                return (<Profile />)
            case 'logout':
                return (<div>logout</div>)
            default:
                return (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600">Selamat datang di SmartKuliner!</p>
                        </div>
                    </div>
                );
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