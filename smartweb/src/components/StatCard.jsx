import React from 'react';

const StatCard = ({ label, value, growth, icon, statusColor = 'blue' }) => {
    const growthColor = growth >= 0 ? 'green' : 'red';
    const growthSymbol = growth >= 0 ? '↗' : '↘';

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {growth !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">Compared to last period</p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {growth !== undefined ? (
                        <span className={`text-${growthColor}-600 text-sm font-medium`}>
                            {growthSymbol} {Math.abs(growth)}%
                        </span>
                    ) : (
                        <span className={`text-${statusColor}-600 text-sm font-medium`}>{icon}</span>
                    )}
                    <div className={`w-10 h-10 bg-${statusColor}-100 rounded-full flex items-center justify-center`}>
                        <span className={`text-${statusColor}-600 text-xl`}>{icon}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
