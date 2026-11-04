export interface InventoryRecord {
  id: string;
  name: string;
  category: "Indoor" | "Outdoor" | "Accessories";
  status: "Available" | "Low stock" | "Archived";
  price: number;
  stock: number;
  sku: string;
  description?: string;
}

export const inventoryRecords: InventoryRecord[] = [
  {
    id: "monstera",
    name: "Monstera deliciosa",
    category: "Indoor",
    status: "Available",
    price: 38,
    stock: 24,
    sku: "PLT-001",
  },
  {
    id: "ficus",
    name: "Ficus elastica",
    category: "Indoor",
    status: "Available",
    price: 46,
    stock: 18,
    sku: "PLT-002",
  },
  {
    id: "olive",
    name: "Olive tree",
    category: "Outdoor",
    status: "Low stock",
    price: 86,
    stock: 3,
    sku: "PLT-003",
  },
  {
    id: "pothos",
    name: "Golden pothos",
    category: "Indoor",
    status: "Available",
    price: 18,
    stock: 42,
    sku: "PLT-004",
  },
  {
    id: "lavender",
    name: "English lavender",
    category: "Outdoor",
    status: "Available",
    price: 14,
    stock: 36,
    sku: "PLT-005",
  },
  {
    id: "fern",
    name: "Boston fern",
    category: "Indoor",
    status: "Low stock",
    price: 24,
    stock: 4,
    sku: "PLT-006",
  },
  {
    id: "planter",
    name: "Terracotta planter",
    category: "Accessories",
    status: "Available",
    price: 22,
    stock: 54,
    sku: "ACC-001",
  },
  {
    id: "watering-can",
    name: "Watering can",
    category: "Accessories",
    status: "Available",
    price: 32,
    stock: 17,
    sku: "ACC-002",
  },
  {
    id: "rosemary",
    name: "Rosemary",
    category: "Outdoor",
    status: "Available",
    price: 12,
    stock: 28,
    sku: "PLT-007",
  },
  {
    id: "calathea",
    name: "Calathea orbifolia",
    category: "Indoor",
    status: "Archived",
    price: 34,
    stock: 0,
    sku: "PLT-008",
  },
  {
    id: "snake",
    name: "Snake plant",
    category: "Indoor",
    status: "Available",
    price: 28,
    stock: 21,
    sku: "PLT-009",
  },
  {
    id: "soil",
    name: "Indoor potting mix",
    category: "Accessories",
    status: "Available",
    price: 16,
    stock: 63,
    sku: "ACC-003",
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
