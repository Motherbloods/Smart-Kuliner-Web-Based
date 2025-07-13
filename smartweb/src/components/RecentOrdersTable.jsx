import React from 'react';
import { Link } from 'react-router-dom';

const RecentOrdersTable = ({ recentOrders = [] }) => {
    const statusMap = {
        pending: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800' },
        processing: { label: 'Diproses', color: 'bg-indigo-100 text-indigo-800' },
        shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
        completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
        cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            {/* Mobile View */}
            <div className="block sm:hidden">
                {recentOrders.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {recentOrders.map((order, idx) => {
                            const product = order.items?.[0];
                            const status = statusMap[order.status] || {
                                label: order.status.replace('_', ' '),
                                color: 'bg-gray-100 text-gray-800'
                            };

                            return (
                                <div key={idx} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 text-sm">
                                                {product?.productName || '-'}
                                            </h4>
                                            <p className="text-xs text-gray-500">#{order.id}</p>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                {order.buyerName?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span className="text-sm text-gray-900">{order.buyerName}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                Rp. {order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-500">
                        Tidak ada pesanan terbaru
                    </div>
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order, idx) => {
                                const product = order.items?.[0];
                                const status = statusMap[order.status] || {
                                    label: order.status.replace('_', ' '),
                                    color: 'bg-gray-100 text-gray-800'
                                };

                                return (
                                    <tr key={idx}>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {product?.productName || '-'}
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            #{order.id}
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                    {order.buyerName?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <span className="ml-2 text-sm text-gray-900">{order.buyerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            Rp. {order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-4 lg:px-6 py-4 text-center text-gray-500">
                                    Tidak ada pesanan terbaru
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentOrdersTable;