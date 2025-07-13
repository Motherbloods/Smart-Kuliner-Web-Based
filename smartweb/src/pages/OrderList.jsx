import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { orderService } from '../services/OrderService';
import OrderDetail from './OrderDetail';

import { statusConfig, statusOptions } from '../utils/statusHelpers';

const OrderList = ({ sellerId, onUpdateStatus }) => {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // New state for OrderDetail navigation
    const [currentView, setCurrentView] = useState('list'); // 'list' or 'detail'
    const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (!dateStr || isNaN(date.getTime())) return '-';
        return format(date, 'dd MMM yyyy, HH:mm', { locale: id });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!sellerId) return;
            setLoading(true);
            try {
                const data = await orderService.getOrdersBySeller(sellerId);
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [sellerId]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        try {
            // Call the service to update order status
            await orderService.updateOrderStatus(orderId, newStatus);

            // Update local state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
                        : order
                )
            );

            // Update selectedOrderForDetail if it's the same order
            if (selectedOrderForDetail && selectedOrderForDetail.id === orderId) {
                setSelectedOrderForDetail(prev => ({
                    ...prev,
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                }));
            }

            // Call parent callback if provided
            if (onUpdateStatus) {
                onUpdateStatus(orderId, newStatus);
            }

            setShowModal(false);
            setSelectedOrder(null);
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Gagal mengupdate status order. Silakan coba lagi.');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const openUpdateModal = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    // New function to navigate to order detail
    const handleViewOrderDetail = (order) => {
        setSelectedOrderForDetail(order);
        setCurrentView('detail');
    };

    // New function to go back to order list
    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedOrderForDetail(null);
    };

    const filteredOrders = orders.filter((order) => {
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;
        const createdDate = new Date(order.createdAt);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;
        if (from && createdDate < from) return false;
        if (to && createdDate > to) return false;
        return true;
    });

    const getStatusCount = (status) => {
        return orders.filter(order => status === 'all' || order.status === status).length;
    };

    // If currentView is 'detail', show OrderDetail component
    if (currentView === 'detail' && selectedOrderForDetail) {
        return (
            <OrderDetail
                order={selectedOrderForDetail}
                onBack={handleBackToList}
                onUpdateStatus={handleUpdateStatus}
            />
        );
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Daftar Pesanan</h2>
                    <nav className="text-sm text-gray-500 mt-1">
                        <span>Home</span>
                        <span className="mx-1">›</span>
                        <span className="text-gray-700">Order List</span>
                    </nav>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="text-sm border-none outline-none bg-transparent"
                            placeholder="Dari tanggal"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="text-sm border-none outline-none bg-transparent"
                            placeholder="Sampai tanggal"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {Object.entries(statusOptions).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label} {key !== 'all' && `(${getStatusCount(key)})`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Status Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(statusOptions).filter(([key]) => key !== 'all').map(([key, label]) => {
                    const count = getStatusCount(key);
                    const config = statusConfig[key];
                    return (
                        <div key={key} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${config.dot}`}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">Pesanan Terbaru</h3>
                        <div className="text-sm text-gray-500">
                            Menampilkan {filteredOrders.length} dari {orders.length} pesanan
                        </div>
                    </div>
                </div>

                {filteredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => {
                                    const status = statusConfig[order.status];
                                    const customerInitial = order.buyerName?.[0]?.toUpperCase() || '?';
                                    const isUpdating = updatingOrderId === order.id;

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    {order.items[0]?.imageUrl && (
                                                        <img
                                                            src={order.items[0].imageUrl}
                                                            alt={order.items[0].productName}
                                                            className="w-10 h-10 rounded-lg object-cover mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {order.items[0]?.productName || 'N/A'}
                                                        </div>
                                                        {order.items.length > 1 && (
                                                            <div className="text-xs text-gray-500">
                                                                +{order.items.length - 1} item lainnya
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-mono text-gray-900">
                                                    #{order.id?.slice(-8) || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-10 aspect-square rounded-full flex items-center justify-center text-white text-sm font-semibold leading-none mr-3 ${status.dot}`}
                                                    >
                                                        {customerInitial}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 truncate max-w-[120px] block">
                                                            {order.buyerName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[180px] block">
                                                            {order.buyerEmail}
                                                        </div>
                                                    </div>

                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${status.class}`}>
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${status.dot}`}></span>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {formatCurrency(order.totalAmount)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {order.paymentMethod}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200
                                                    }`}>
                                                    COD
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    {/* Detail Button */}
                                                    <button
                                                        onClick={() => handleViewOrderDetail(order)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                        </svg>
                                                        Detail
                                                    </button>

                                                    {/* Badge for Shipped Status */}
                                                    {order.status === 'shipped' && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            Menunggu Konfirmasi Customer
                                                        </span>
                                                    )}

                                                    {/* Update Status Button */}
                                                    {status.nextStatus && (
                                                        <button
                                                            onClick={() => openUpdateModal(order)}
                                                            disabled={isUpdating}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {isUpdating ? (
                                                                <>
                                                                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Memproses...
                                                                </>
                                                            ) : (
                                                                status.nextLabel
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pesanan</h3>
                        <p className="mt-1 text-sm text-gray-500">Belum ada pesanan yang masuk untuk filter yang dipilih.</p>
                    </div>
                )}
            </div>

            {/* Update Status Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status Pesanan</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Order ID: #{selectedOrder.id?.slice(-8)}</p>
                            <p className="text-sm text-gray-600 mb-2">Produk: {selectedOrder.items[0]?.productName}</p>
                            <p className="text-sm text-gray-600 mb-4">Pelanggan: {selectedOrder.buyerName}</p>

                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm font-medium text-gray-700">Status saat ini:</p>
                                <div className="flex items-center mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[selectedOrder.status].class}`}>
                                        {statusConfig[selectedOrder.status].text}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-700">Akan diubah menjadi:</p>
                                <div className="flex items-center mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[statusConfig[selectedOrder.status].nextStatus].class}`}>
                                        {statusConfig[statusConfig[selectedOrder.status].nextStatus].text}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedOrder(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedOrder.id, statusConfig[selectedOrder.status].nextStatus)}
                                disabled={updatingOrderId === selectedOrder.id}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {updatingOrderId === selectedOrder.id ? 'Memproses...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList;