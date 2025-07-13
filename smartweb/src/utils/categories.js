export const categoryList = [
  "Makanan Utama",
  "Cemilan",
  "Minuman",
  "Makanan Sehat",
  "Dessert",
  "Tips Masak",
  "Lainnya",
];

// Untuk dropdown tanpa "Semua Kategori"
export const categoryOptions = categoryList.map((label) => ({
  value: label.toLowerCase(),
  label,
}));

// Untuk dropdown filter dengan "Semua Kategori"
export const categoryFilterOptions = [
  { value: "", label: "Semua Kategori" },
  ...categoryOptions.filter(
    (option) => option.value !== "tips masak" && option.value !== "minuman"
  ), // kalau mau filter
];

export const categoryLabelList = [
  "Semua",
  ...categoryList.filter((c) => c !== "Tips Masak"),
];
// Indonesian provinces
export const provinces = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Kepulauan Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya",
];

// Food categories
export const foodCategories = [
  "Makanan Modern",
  "Minuman",
  "Fast Food",
  "Street Food",
  "Makanan Tradisional",
  "Seafood",
  "Vegetarian",
  "Dessert",
  "Bakery",
  "Chinese Food",
  "Japanese Food",
  "Western Food",
  "Italian Food",
  "Indian Food",
  "Thai Food",
  "Korean Food",
  "Middle Eastern",
  "Halal Food",
  "Organic Food",
  "Healthy Food",
];
