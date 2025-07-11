export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getDateRange = (filter, selectedYear, selectedMonth) => {
  let startDate, endDate;

  switch (filter) {
    case "daily":
      // Ambil seluruh hari dalam bulan yang dipilih
      startDate = new Date(selectedYear, selectedMonth, 1);
      endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
      break;

    case "weekly":
      // Ambil seluruh minggu dalam bulan yang dipilih
      startDate = new Date(selectedYear, selectedMonth, 1);
      endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
      break;

    case "monthly":
      // Ambil seluruh bulan dalam tahun yang dipilih
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
      break;

    default:
      startDate = new Date(selectedYear, selectedMonth, 1);
      endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// Helper function untuk mendapatkan nomor minggu dalam bulan
export const getWeekOfMonth = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay();
  const dayOfMonth = date.getDate();

  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

// Helper function untuk format tanggal ke string YYYY-MM-DD
export const formatDateToString = (date) => {
  return date.toISOString().split("T")[0];
};

// Helper function untuk mendapatkan nama bulan
export const getMonthName = (monthIndex) => {
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return monthNames[monthIndex];
};

// Helper function untuk mendapatkan jumlah hari dalam bulan
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function untuk memformat angka dengan pemisah ribuan
export const formatNumber = (num) => {
  return new Intl.NumberFormat("id-ID").format(num);
};

// Helper function untuk mendapatkan range tanggal berdasarkan periode
export const getDateRangeText = (filter, selectedYear, selectedMonth) => {
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  switch (filter) {
    case "daily":
      return `${monthNames[selectedMonth]} ${selectedYear}`;
    case "weekly":
      return `${monthNames[selectedMonth]} ${selectedYear}`;
    case "monthly":
      return `${selectedYear}`;
    default:
      return "";
  }
};
