"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/lib/api";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cartItems, cartCount, loading, removeFromCart, refreshCart } = useCart();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to view your cart");
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.card.discount > 0
      ? item.card.price - (item.card.price * item.card.discount) / 100
      : item.card.price;
    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = async (itemId: string, cardId: string, quantity: number) => {
    try {
      await createOrder({ card_id: cardId, quantity });
      await removeFromCart(itemId);
      toast.success("Order placed!");
      await refreshCart();
    } catch {
      toast.error("Failed to place order");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-5xl px-6 py-10 md:py-20 flex-1 w-full"
    >
      <button
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Continue Shopping
      </button>

      <div className="mb-12 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center md:justify-start gap-4 text-foreground">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
          Shopping Bag
          {cartCount > 0 && (
            <span className="text-lg font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          )}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
          Review your selected items before checkout.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl bg-card border border-border/50 shadow-sm" />
          ))}
        </div>
      ) : cartItems.length === 0 ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-border/80 shadow-inner"
        >
          <div className="bg-background p-6 rounded-full shadow-lg border border-border/50 mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Your bag is empty</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Discover our curated collections and add your favorite pieces.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all duration-300 active:scale-95 uppercase tracking-wide"
          >
            Browse Gallery
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, idx) => {
                const unitPrice = item.card.discount > 0
                  ? item.card.price - (item.card.price * item.card.discount) / 100
                  : item.card.price;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
                  >
                    <Card className="overflow-hidden border-border/60 hover:border-primary/30 bg-card/80 backdrop-blur-md transition-all duration-500 hover:shadow-xl rounded-2xl group">
                      <CardContent className="p-0">
                        <div className="flex flex-row">
                          {/* Image */}
                          <div
                            className="w-28 sm:w-36 shrink-0 bg-muted relative overflow-hidden cursor-pointer"
                            onClick={() => router.push(`/products/${item.card.id}`)}
                          >
                            <img
                              src={item.card.image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80"}
                              alt={item.card.cloth_name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          {/* Details */}
                          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                                {item.card.brand_name}
                              </p>
                              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight line-clamp-1">
                                {item.card.cloth_name}
                              </h3>
                            </div>
                            <div className="flex items-end justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Qty</span>
                                <span className="font-bold bg-muted px-3 py-1 rounded-lg border border-border/50 text-sm">
                                  {item.quantity}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="text-xl font-black tabular-nums">₹{(unitPrice * item.quantity).toFixed(2)}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="sticky top-24 border-border/60 bg-card/90 backdrop-blur-md rounded-2xl shadow-xl">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-lg font-bold uppercase tracking-wider">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                      <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold text-emerald-600">{subtotal >= 150 ? "Free" : "₹9.99"}</span>
                    </div>
                    <div className="border-t border-border/50 pt-3">
                      <div className="flex justify-between text-lg font-black">
                        <span>Total</span>
                        <span>₹{(subtotal + (subtotal >= 150 ? 0 : 9.99)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center uppercase tracking-widest opacity-70">
                    Free shipping on orders over ₹150
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
