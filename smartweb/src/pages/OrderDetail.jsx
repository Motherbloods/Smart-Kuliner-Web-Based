import React, { useState } from 'react';

const OrderDetail = ({ order, onBack, onUpdateStatus }) => {
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    console.log('ini order', order)
    const statusConfig = {
        pending: {
            class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            dot: 'bg-yellow-500',
            text: 'Menunggu Konfirmasi',
            nextStatus: 'confirmed',
            nextLabel: 'Konfirmasi'
        },
        confirmed: {
            class: 'bg-blue-100 text-blue-800 border-blue-200',
            dot: 'bg-blue-500',
            text: 'Dikonfirmasi',
            nextStatus: 'processing',
            nextLabel: 'Proses'
        },
        processing: {
            class: 'bg-purple-100 text-purple-800 border-purple-200',
            dot: 'bg-purple-500',
            text: 'Diproses',
            nextStatus: 'shipped',
            nextLabel: 'Kirim'
        },
        shipped: {
            class: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            dot: 'bg-indigo-500',
            text: 'Dikirim',
            badge: 'Menunggu Konfirmasi Customer'
        },
        awaiting_customer_confirmation: {
            class: 'bg-orange-100 text-orange-800 border-orange-200',
            dot: 'bg-orange-500',
            text: 'Menunggu Konfirmasi Customer',
            nextStatus: 'completed',
            nextLabel: 'Selesaikan'
        },
        completed: {
            class: 'bg-green-100 text-green-800 border-green-200',
            dot: 'bg-green-500',
            text: 'Selesai'
        },
        cancelled: {
            class: 'bg-red-100 text-red-800 border-red-200',
            dot: 'bg-red-500',
            text: 'Dibatalkan'
        },
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (!dateStr || isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleUpdateStatus = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            await onUpdateStatus(order.id, newStatus);
            setShowStatusModal(false);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const status = statusConfig[order.status];
    const customerInitial = order.buyerName?.[0]?.toUpperCase() || '?';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Pesanan</h1>
                        <p className="text-gray-600 mt-1">Order ID: #{order.id?.slice(-8) || 'N/A'}</p>
                    </div>
                </div>

                {status.nextStatus && (
                    <button
                        onClick={() => setShowStatusModal(true)}
                        disabled={updatingStatus}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {updatingStatus ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                {status.nextLabel}
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Pesanan</h3>
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border ${status.class}`}>
                                <span className={`w-3 h-3 rounded-full mr-2 ${status.dot}`}></span>
                                {status.text}
                            </div>
                            {status.badge && (
                                <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3L21 12c0-1.333-.962-3-2.502-3H5.502C3.962 9 3 10.667 3 12l0 0c0 1.333.962 3 2.502 3z"></path>
                                    </svg>
                                    {status.badge}
                                </div>
                            )}
                            <div className="text-sm text-gray-500">
                                Diperbarui: {formatDate(order.updatedAt)}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Pesanan</h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-gray-600">
                                                Jumlah: {item.quantity} x {formatCurrency(item.price)}
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {formatCurrency(item.quantity * item.price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Timeline */}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Pesanan</h3>
                        <div className="space-y-4">
                            {/* Created */}
                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Pesanan dibuat</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>

                            {/* Confirmed */}
                            {order.confirmedAt && (
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Pesanan dikonfirmasi</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.confirmedAt)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Processing */}
                            {order.processingAt && (
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Pesanan diproses</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.processingAt)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Shipped */}
                            {order.shippedAt && (
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Pesanan dikirim</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.shippedAt)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Delivered */}
                            {order.deliveredAt && (
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Pesanan diterima</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.deliveredAt)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Completed */}
                            {order.completedAt && (
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Pesanan selesai</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.completedAt)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Cancelled */}
                            {order.cancelledAt && (
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Pesanan dibatalkan</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.cancelledAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan</h3>
                            <p className="text-gray-700">{order.notes}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${status.dot}`}>
                                    {customerInitial}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{order.buyerName}</p>
                                    <p className="text-sm text-gray-500">{order.buyerEmail}</p>
                                </div>
                            </div>

                            {order.buyerPhone && (
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                    <span className="text-sm text-gray-700">{order.buyerPhone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alamat Pengiriman</h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-700">{order.shippingAddress.street}</p>
                                <p className="text-sm text-gray-700">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                </p>
                                <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    )}

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pembayaran</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Metode Pembayaran</span>
                                <span className="text-sm font-medium text-gray-900">{order.paymentMethod}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Status Pembayaran</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                    COD
                                </span>
                            </div>
                            <hr className="border-gray-200" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Subtotal</span>
                                <span className="text-sm text-gray-900">{formatCurrency(order.totalAmount - (order.shippingCost || 0))}</span>
                            </div>
                            {order.shippingCost && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Ongkir</span>
                                    <span className="text-sm text-gray-900">{formatCurrency(order.shippingCost)}</span>
                                </div>
                            )}
                            <hr className="border-gray-200" />
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Total</span>
                                <span className="font-bold text-lg text-gray-900">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Update Status</h3>
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Apakah Anda yakin ingin mengubah status pesanan dari "{status.text}" menjadi "{statusConfig[status.nextStatus].text}"?
                            </p>

                            <div className="flex items-center space-x-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Status saat ini:</p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                                        {status.text}
                                    </span>
                                </div>
                                <div className="text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Status baru:</p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status.nextStatus].class}`}>
                                        {statusConfig[status.nextStatus].text}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(status.nextStatus)}
                                disabled={updatingStatus}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {updatingStatus ? 'Memproses...' : 'Konfirmasi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;