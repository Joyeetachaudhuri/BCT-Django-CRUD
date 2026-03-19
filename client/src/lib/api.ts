import axios from "axios";

// ── Axios instance with base URL ──
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle authentication errors (e.g., stale token after re-seed)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("isAdmin");
        // We don't force a reload here to avoid infinite loops, 
        // but clearing storage ensures the next check sees the user as logged out.
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const registerUser = (data: {
  username: string;
  email: string;
  password: string;
}) => api.post("/register/", data);

export const loginUser = (data: { username: string; password: string }) =>
  api.post("/login/", data);

// ── Cards (Products) ──
export interface ClothingCard {
  id: string;
  brand_name: string;
  cloth_name: string;
  image_url: string;
  price: number;
  discount: number;
  rating: number;
}

export const getCards = () => api.get<ClothingCard[]>("/cards/");

export const createCard = (data: {
  brand_name: string;
  cloth_name: string;
  image_url: string;
  price: number;
  discount: number;
}) => api.post("/cards/create/", data);

export const updateRating = (id: string, rating: number) =>
  api.put(`/cards/rating/${id}/`, { rating });

export const deleteCard = (id: string) =>
  api.delete(`/cards/delete/${id}/`);

// ── Orders ──
export interface Order {
  id: string;
  user: string;
  card: ClothingCard;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

export const getCardDetail = (id: string) => api.get<ClothingCard>(`/cards/${id}/`);

export const createOrder = (data: { card_id: string; quantity: number }) =>
  api.post("/orders/create/", data);

export const getOrders = () => api.get<Order[]>("/orders/");

// ── Cart ──
export interface CartItem {
  id: string;
  card: ClothingCard;
  quantity: number;
}

export const getCart = () => api.get<CartItem[]>("/cart/");
export const addToCart = (data: { card_id: string; quantity?: number }) =>
  api.post("/cart/add/", data);
export const removeFromCart = (id: string) =>
  api.delete(`/cart/remove/${id}/`);

// ── Wishlist ──
export interface WishlistItem {
  id: string;
  card: ClothingCard;
  added_at: string;
}

export const getWishlist = () => api.get<WishlistItem[]>("/wishlist/");
export const addToWishlist = (data: { card_id: string }) =>
  api.post("/wishlist/add/", data);
export const removeFromWishlist = (id: string) =>
  api.delete(`/wishlist/remove/${id}/`);

export default api;
