"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { getWishlist, removeFromWishlist, WishlistItem } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to view your wishlist");
      router.push("/auth");
      return;
    }
    const fetchWishlist = async () => {
      try {
        const res = await getWishlist();
        setItems(res.data);
      } catch {
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [isAuthenticated, router]);

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlist(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    await addToCart(item.card.id);
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
        Back
      </button>

      <div className="mb-12 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center md:justify-start gap-4 text-foreground">
          <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500">
            <Heart className="h-8 w-8" />
          </div>
          My Wishlist
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
          Your curated collection of items you love.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl bg-card border border-border/50 shadow-sm" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-border/80 shadow-inner"
        >
          <div className="bg-background p-6 rounded-full shadow-lg border border-border/50 mb-6">
            <Heart className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No items saved</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Save items you love and come back to them later.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all duration-300 active:scale-95 uppercase tracking-wide"
          >
            Explore Gallery
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => {
              const discountedPrice = item.card.discount > 0
                ? (item.card.price - (item.card.price * item.card.discount) / 100).toFixed(2)
                : null;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4, ease: "easeOut" }}
                >
                  <Card className="overflow-hidden border-border/60 hover:border-primary/30 bg-card/80 backdrop-blur-md transition-all duration-500 hover:shadow-xl rounded-2xl group">
                    <div
                      className="relative aspect-[3/4] overflow-hidden bg-muted cursor-pointer"
                      onClick={() => router.push(`/products/${item.card.id}`)}
                    >
                      <img
                        src={item.card.image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80"}
                        alt={item.card.cloth_name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 h-8 w-8 z-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                          {item.card.brand_name}
                        </p>
                        <h3 className="text-sm font-semibold line-clamp-1">{item.card.cloth_name}</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold">
                            ₹{discountedPrice ?? item.card.price.toFixed(2)}
                          </span>
                          {discountedPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{item.card.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="gap-1.5 rounded-full text-xs font-bold"
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add to Bag
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
