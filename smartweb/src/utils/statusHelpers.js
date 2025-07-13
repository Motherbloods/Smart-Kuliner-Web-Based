export const statusOptions = {
  all: "Semua Status",
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const statusConfig = {
  pending: {
    class: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
    text: "Menunggu Konfirmasi",
    nextStatus: "confirmed",
    nextLabel: "Konfirmasi",
  },
  confirmed: {
    class: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
    text: "Dikonfirmasi",
    nextStatus: "processing",
    nextLabel: "Proses",
  },
  processing: {
    class: "bg-purple-100 text-purple-800 border-purple-200",
    dot: "bg-purple-500",
    text: "Diproses",
    nextStatus: "shipped",
    nextLabel: "Kirim",
  },
  shipped: {
    class: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
    text: "Dikirim",
    badge: "Menunggu Konfirmasi Customer",
  },
  awaiting_customer_confirmation: {
    class: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
    text: "Menunggu Konfirmasi Customer",
    nextStatus: "completed",
    nextLabel: "Selesaikan",
  },
  completed: {
    class: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
    text: "Selesai",
  },
  cancelled: {
    class: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
    text: "Dibatalkan",
  },
};
