import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const SalesChart = ({ chartData, filter, currentPeriod, onChangeFilter, onNavigate }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Sales',
                    data: chartData.data,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => `Sales: Rp. ${context.parsed.y.toLocaleString()}`
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: value => `Rp. ${value.toLocaleString()}`
                        }
                    }
                }
            }
        });
    }, [chartData]);

    return (
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Sales Graph</h3>
                <div className="flex space-x-1">
                    {['weekly', 'monthly', 'yearly'].map(f => (
                        <button
                            key={f}
                            onClick={() => onChangeFilter(f)}
                            className={`filter-btn px-3 py-1 text-sm rounded ${filter === f ? 'text-white bg-gray-800' : 'text-gray-600 hover:text-gray-900 border border-gray-300'}`}>
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <button onClick={() => onNavigate('previous')} className="p-2 text-gray-400 hover:text-gray-600">
                    ←
                </button>
                <span className="text-lg font-medium text-gray-700">{currentPeriod}</span>
                <button onClick={() => onNavigate('next')} className="p-2 text-gray-400 hover:text-gray-600">
                    →
                </button>
            </div>

            <div className="h-80">
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
};

export default SalesChart;
