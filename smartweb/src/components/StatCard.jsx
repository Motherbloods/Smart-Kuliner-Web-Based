import React from 'react';

const StatCard = ({ label, value, growth, icon, statusColor = 'blue' }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 break-words">{value}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-${statusColor}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-${statusColor}-600 text-lg sm:text-xl`}>{icon}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;