import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import RecentOrdersTable from '../components/RecentOrdersTable';
import SalesChart from '../components/SalesChart';
import orderService from '../services/OrderService';
import productService from '../services/ProductServices';
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, getDateRange } from '../utils/formatHelpers';

const Dashboard = () => {
    const [filter, setFilter] = useState('monthly');
    const { userData } = useAuth();
    const [chartData, setChartData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [allOrders, setAllOrders] = useState([]); // Simpan semua orders

    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        ordersGrowth: 0,
        revenueGrowth: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Effect terpisah untuk update chart data ketika filter berubah
    useEffect(() => {
        if (allOrders.length > 0) {
            updateChartData();
        }
    }, [filter, selectedMonth, selectedYear, allOrders]);

    const fetchDashboardData = async () => {
        try {
            const currentDate = new Date();
            const startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // 1 tahun ke belakang
            const endDate = new Date(currentDate.getFullYear(), 11, 31); // sampai akhir tahun ini

            // Ambil data dari orderService & productService
            const [orders, products] = await Promise.all([
                orderService.getOrders(userData?.uid, startDate, endDate),
                productService.getProductsBySeller(userData?.uid)
            ]);

            // Simpan semua orders
            setAllOrders(orders);

            // Hitung stats berdasarkan semua data (tidak terpengaruh filter)
            const totalOrders = orders.length;
            const activeOrders = orders.filter(order =>
                ['processing', 'confirmed', 'shipped'].includes(order.status)
            ).length;
            const completedOrders = orders.filter(order => order.status === 'completed').length;
            const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
            const totalRevenue = orders
                .filter(order => order.status === 'completed')
                .reduce((sum, order) => sum + order.totalAmount, 0);

            setStats({
                totalOrders,
                activeOrders,
                completedOrders,
                cancelledOrders,
                totalRevenue,
                ordersGrowth: Math.floor(Math.random() * 20), // dummy growth
                revenueGrowth: Math.floor(Math.random() * 15)  // dummy growth
            });
            // Set recent orders (last 5 dari semua orders)
            const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRecentOrders(sortedOrders.slice(0, 5));

        } catch (err) {
            console.error('Error loading dashboard data:', err);
        }
    };

    const updateChartData = () => {
        // Filter orders berdasarkan periode yang dipilih
        const { startDate, endDate } = getDateRange(filter, selectedYear, selectedMonth);

        const filteredOrders = allOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate && order.status === 'completed';
        });

        // Group data berdasarkan filter
        const chartMap = {};

        if (filter === 'daily') {
            // Group by day
            filteredOrders.forEach(order => {
                const date = new Date(order.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
                if (!chartMap[date]) {
                    chartMap[date] = { date, amount: 0 };
                }
                chartMap[date].amount += order.totalAmount;
            });
        } else if (filter === 'weekly') {
            // Group by week
            filteredOrders.forEach(order => {
                const orderDate = new Date(order.createdAt);
                const weekNumber = getWeekNumber(orderDate, selectedYear, selectedMonth);
                const weekKey = `week-${weekNumber}`;

                if (!chartMap[weekKey]) {
                    chartMap[weekKey] = { date: weekKey, amount: 0 };
                }
                chartMap[weekKey].amount += order.totalAmount;
            });
        } else if (filter === 'monthly') {
            // Group by month
            filteredOrders.forEach(order => {
                const orderDate = new Date(order.createdAt);
                const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

                if (!chartMap[monthKey]) {
                    chartMap[monthKey] = { date: monthKey, amount: 0 };
                }
                chartMap[monthKey].amount += order.totalAmount;
            });
        }

        // Convert to array and sort by date
        const chartDataArray = Object.values(chartMap).sort((a, b) => {
            if (filter === 'weekly') {
                return a.date.localeCompare(b.date);
            }
            return new Date(a.date) - new Date(b.date);
        });

        setChartData(chartDataArray);
    };

    // Helper function untuk mendapatkan nomor minggu dalam bulan
    const getWeekNumber = (date, year, month) => {
        const firstDay = new Date(year, month, 1);
        const dayOfMonth = date.getDate();
        const firstDayOfWeek = firstDay.getDay();

        return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const handleMonthChange = (month) => {
        setSelectedMonth(month);
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
    };

    console.log('Current filter:', filter);
    console.log('Chart data:', chartData);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Orders" value={stats.totalOrders} growth={stats.ordersGrowth} icon="📦" />
                <StatCard label="Active Orders" value={stats.activeOrders} icon="⏳" statusColor="yellow" />
                <StatCard label="Completed Orders" value={stats.completedOrders} icon="✅" statusColor="green" />
                <StatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} growth={stats.revenueGrowth} icon="💰" />
            </div>

            {/* Chart & Best Sellers */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <SalesChart
                    data={chartData}
                    filter={filter}
                    onFilterChange={handleFilterChange}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    setSelectedMonth={handleMonthChange}
                    setSelectedYear={handleYearChange}
                />
            </div>

            {/* Recent Orders */}
            <RecentOrdersTable recentOrders={recentOrders} />

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4">
                <p>© 2025 - SmartKuliner Dashboard</p>
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

export default Dashboard;