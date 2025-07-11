import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import BestSellerCard from '../components/BestSellerCard';
import RecentOrdersTable from '../components/RecentOrdersTable';
import SalesChart from '../components/SalesChart';

const Dashboard = () => {
    const [filter, setFilter] = useState('weekly');
    const [period, setPeriod] = useState(getDefaultPeriod('weekly'));
    const [navigationData, setNavigationData] = useState({});
    const [chartData, setChartData] = useState({ labels: [], data: [] });
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        ordersGrowth: 0,
        revenueGrowth: 0
    });
    const [bestSellers, setBestSellers] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [filter, period]);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch(`/api/seller/dashboard?filter=${filter}&period=${period}`);
            const data = await res.json();

            setStats(data.stats);
            setNavigationData(data.navigationData);
            setChartData(data.chartData);
            setBestSellers(data.bestSellers);
            setRecentOrders(data.recentOrders);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        }
    };

    const changeFilter = (newFilter) => {
        if (newFilter !== filter) {
            setFilter(newFilter);
            setPeriod(getDefaultPeriod(newFilter));
        }
    };

    const navigatePeriod = (direction) => {
        const current = new Date(period);
        if (filter === 'weekly' || filter === 'monthly') {
            direction === 'previous' ? current.setMonth(current.getMonth() - 1) : current.setMonth(current.getMonth() + 1);
        } else {
            direction === 'previous' ? current.setFullYear(current.getFullYear() - 1) : current.setFullYear(current.getFullYear() + 1);
        }

        const formatted = filter === 'weekly' || filter === 'monthly'
            ? `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
            : `${current.getFullYear()}`;
        setPeriod(formatted);
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Orders" value={stats.totalOrders} growth={stats.ordersGrowth} icon="📦" />
                <StatCard label="Active Orders" value={stats.activeOrders} icon="⏳" statusColor="yellow" />
                <StatCard label="Completed Orders" value={stats.completedOrders} icon="✅" statusColor="green" />
                <StatCard label="Revenue" value={`Rp. ${stats.totalRevenue.toLocaleString()}`} growth={stats.revenueGrowth} icon="💰" />
            </div>

            {/* Chart and Best Sellers */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <SalesChart
                    chartData={chartData}
                    filter={filter}
                    currentPeriod={navigationData.current}
                    onChangeFilter={changeFilter}
                    onNavigate={navigatePeriod}
                />
                <BestSellerCard bestSellers={bestSellers} />
            </div>

            {/* Recent Orders */}
            <RecentOrdersTable recentOrders={recentOrders} />

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4">
                <p>© 2025 - ThriftMart Dashboard</p>
                <div className="flex space-x-4">
                    <a href="#" className="hover:text-gray-700">About</a>
                    <a href="#" className="hover:text-gray-700">Careers</a>
                    <a href="#" className="hover:text-gray-700">Policy</a>
                    <a href="#" className="hover:text-gray-700">Contact</a>
                </div>
            </div>
        </div>
    );
};

function getDefaultPeriod(filter) {
    const now = new Date();
    switch (filter) {
        case 'weekly':
        case 'monthly':
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        case 'yearly':
            return `${now.getFullYear()}`;
        default:
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
}

export default Dashboard;
