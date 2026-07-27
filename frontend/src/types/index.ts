export type Role = 'customer' | 'admin';

export interface User {
  id: number;
  email: string;
  role: Role;
  email_verified?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterStepResponse {
  message: string;
  email: string;
  dev_verification_code?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  stock_quantity: number;
  category_id: number | null;
  image_url: string | null;
  created_at: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface CartItem {
  id: number;
  cart_id?: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number | string;
  stock_quantity: number;
  image_url: string | null;
}

export interface Cart {
  id: number;
  items: CartItem[];
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  order_id?: number;
  product_id: number;
  name: string;
  quantity: number;
  price_at_purchase: number | string;
}

export interface Order {
  id: number;
  user_id: number;
  user_email?: string;
  status: OrderStatus;
  total: number | string;
  created_at: string;
  items?: OrderItem[];
}

export interface ApiErrorBody {
  error: {
    message: string;
    code?: string;
  };
}
