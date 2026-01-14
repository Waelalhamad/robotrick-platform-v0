/**
 * Represents a part in the inventory
 */
export interface Part {
  id: string;
  name: string;
  description: string;
  partNumber: string;
  manufacturer: string;
  category: string;
  location: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  price: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a stock adjustment transaction
 */
export interface StockAdjustment {
  id: string;
  partId: string;
  quantity: number;
  type: 'addition' | 'subtraction' | 'set';
  reason: string;
  notes?: string;
  performedBy: string;
  performedAt: string;
}

/**
 * Represents a part category
 */
export interface PartCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a parts manufacturer
 */
export interface Manufacturer {
  id: string;
  name: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the state of the inventory module
 */
export interface InventoryState {
  parts: Part[];
  categories: PartCategory[];
  manufacturers: Manufacturer[];
  isLoading: boolean;
  error: string | null;
  selectedPart: Part | null;
  filters: {
    category: string | null;
    searchQuery: string;
    inStockOnly: boolean;
    lowStockOnly: boolean;
  };
}
