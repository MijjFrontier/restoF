export type TableStatus = 'free' | 'occupied' | 'reserved' | 'ready';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'Entradas' | 'Platos Principales' | 'Postres' | 'Bebidas';
}

export interface OrderItem extends MenuItem {
  quantity: number;
  processedQuantity?: number; // Cantidad que ya fue preparada por cocina
  notes?: string;
}

export interface Table {
  id: string; // Changed to string for Firestore document ID
  name: string;
  status: TableStatus;
  order: OrderItem[];
  waiterName?: string;
  orderStatus?: 'cooking' | 'preparing' | 'ready';
  orderTimestamp?: Date;
}

export interface Transaction {
  id: string; // Firestore document ID
  tableId: string;
  tableName: string;
  order: OrderItem[];
  total: number;
  paymentMethod: string;
  timestamp: Date; // Firestore handles Timestamps, but Date is fine for client
}

export type EmployeeRole = 'waiter' | 'cashier' | 'kitchen';

export interface Employee {
    id: string; // Firestore document ID
    name: string;
    role: EmployeeRole;
    pin: string;
}
