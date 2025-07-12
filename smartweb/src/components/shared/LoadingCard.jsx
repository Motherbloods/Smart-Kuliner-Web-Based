import React from "react";

const LoadingCard = React.memo(() => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-300"></div>
        <div className="p-5">
            <div className="h-5 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded mb-4 w-1/2"></div>
            <div className="flex justify-between">
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
            </div>
        </div>
    </div>
));

export default LoadingCard;
