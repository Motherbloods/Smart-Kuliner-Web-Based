import React from 'react';
import { Link } from 'react-router-dom';

const BestSellerCard = ({ bestSellers = [] }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Best Sellers</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
            </div>
            <div className="space-y-4">
                {bestSellers.length > 0 ? (
                    bestSellers.map((product, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">Base Price: Rp. {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-gray-900">Rp. {product.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                <p className="text-sm text-gray-500">{product.total_sales} sales</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No sales data available</p>
                    </div>
                )}
            </div>
            <div className="mt-6">
                <Link to="/seller/orders" className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 text-center block transition-colors">
                    VIEW ORDERS
                </Link>
            </div>
        </div>
    );
};

export default BestSellerCard;
