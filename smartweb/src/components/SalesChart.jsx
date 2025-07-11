import { formatCurrency } from '../utils/formatHelpers';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SalesChart = ({
    data = [],
    filter,
    onFilterChange,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
}) => {
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Navigation handlers
    const handlePreviousPeriod = () => {
        if (filter === 'daily' || filter === 'weekly') {
            if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
            } else {
                setSelectedMonth(selectedMonth - 1);
            }
        } else if (filter === 'monthly') {
            setSelectedYear(selectedYear - 1);
        }
    };

    const handleNextPeriod = () => {
        if (filter === 'daily' || filter === 'weekly') {
            if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
            } else {
                setSelectedMonth(selectedMonth + 1);
            }
        } else if (filter === 'monthly') {
            setSelectedYear(selectedYear + 1);
        }
    };

    // Generate chart data untuk display
    const generateDisplayData = () => {
        if (filter === 'daily') {
            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            const dailyData = [];

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayData = data.find(d => d.date === dateStr);
                dailyData.push({
                    date: day,
                    amount: dayData ? dayData.amount : 0,
                    fullDate: dateStr
                });
            }
            return dailyData;

        } else if (filter === 'weekly') {
            const weeklyData = [];

            // Create 4 weeks for the selected month
            for (let week = 1; week <= 4; week++) {
                const weekKey = `week-${week}`;
                const weekData = data.find(d => d.date === weekKey);
                weeklyData.push({
                    date: `Minggu ${week}`,
                    amount: weekData ? weekData.amount : 0
                });
            }
            return weeklyData;

        } else if (filter === 'monthly') {
            const monthlyData = [];

            for (let month = 0; month < 12; month++) {
                const monthKey = `${selectedYear}-${String(month + 1).padStart(2, '0')}`;
                const monthData = data.find(d => d.date === monthKey);
                monthlyData.push({
                    date: monthNames[month],
                    amount: monthData ? monthData.amount : 0
                });
            }
            return monthlyData;
        }
        return [];
    };

    const chartData = generateDisplayData();

    const getTitle = () => {
        if (filter === 'daily' || filter === 'weekly') {
            return `${monthNames[selectedMonth]} ${selectedYear}`;
        } else if (filter === 'monthly') {
            return `${selectedYear}`;
        }
        return '';
    };

    const formatXAxisTick = (value) => {
        if (filter === 'daily') return value;
        if (filter === 'weekly') return value;
        if (filter === 'monthly') return value.slice(0, 3);
        return value;
    };

    // Custom tooltip formatter
    const customTooltipFormatter = (value) => {
        return [formatCurrency(value), 'Penjualan'];
    };

    const customLabelFormatter = (label) => {
        if (filter === 'daily') {
            return `Tanggal ${label} ${monthNames[selectedMonth]} ${selectedYear}`;
        } else if (filter === 'weekly') {
            return `${label} - ${monthNames[selectedMonth]} ${selectedYear}`;
        } else if (filter === 'monthly') {
            return `${label} ${selectedYear}`;
        }
        return label;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 xl:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Grafik Penjualan</h3>
                <div className="flex space-x-2">
                    {['daily', 'weekly', 'monthly'].map((f) => (
                        <button
                            key={f}
                            onClick={() => onFilterChange(f)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {f === 'daily' ? 'Harian' : f === 'weekly' ? 'Mingguan' : 'Bulanan'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center mb-4">
                <button
                    onClick={handlePreviousPeriod}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h4 className="text-xl font-semibold text-gray-800 mx-8 min-w-[200px] text-center">
                    {getTitle()}
                </h4>
                <button
                    onClick={handleNextPeriod}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            {/* Chart */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxisTick}
                            interval={0}
                            angle={filter === 'monthly' ? -45 : 0}
                            textAnchor={filter === 'monthly' ? 'end' : 'middle'}
                            height={filter === 'monthly' ? 80 : 60}
                            fontSize={12}
                        />
                        <YAxis
                            tickFormatter={(value) => formatCurrency(value)}
                            fontSize={12}
                        />
                        <Tooltip
                            formatter={customTooltipFormatter}
                            labelFormatter={customLabelFormatter}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#1d4ed8' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                        Total Penjualan ({getTitle()})
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(chartData.reduce((sum, item) => sum + item.amount, 0))}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SalesChart;