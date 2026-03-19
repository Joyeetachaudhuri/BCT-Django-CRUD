"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getCardDetail, createOrder, ClothingCard } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { BadgePercent, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [id, setId] = useState<string | null>(null);
  const [product, setProduct] = useState<ClothingCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const { addToCart } = useCart();

  // Safely Unwrap Params in Next.js 15+ if needed, but it works directly in 14.
  // Using Promise resolution for generic compatibility
  useEffect(() => {
    Promise.resolve(params).then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await getCardDetail(id);
        setProduct(res.data);
      } catch (e) {
        toast.error("Failed to load product details");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first to place an order");
      router.push("/auth");
      return;
    }
    
    setIsOrdering(true);
    try {
      await createOrder({ card_id: id as string, quantity });
      toast.success("Order placed successfully!");
      router.push("/orders");
    } catch (e) {
      toast.error("Failed to place order");
    } finally {
      setIsOrdering(false);
    }
  };

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  if (loading || !id) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 animate-pulse">
        <Skeleton className="h-8 w-32 mb-8 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-[3/4] rounded-xl w-full bg-muted" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-2/3 bg-muted rounded" />
            <Skeleton className="h-6 w-1/3 bg-muted rounded" />
            <Skeleton className="h-20 w-full bg-muted rounded" />
            <Skeleton className="h-12 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discountedPrice = product.discount > 0
    ? (product.price - (product.price * product.discount) / 100).toFixed(2)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-6 py-10 md:py-20 w-full flex-1"
    >
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gallery
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Image Section */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden bg-muted aspect-[3/4] shadow-2xl ring-1 ring-border/50"
        >
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80"}
            alt={product.cloth_name}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          {product.discount > 0 && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-red-500/90 backdrop-blur-md px-3.5 py-1.5 text-sm font-bold text-white shadow-xl border border-red-400/20">
              <BadgePercent className="h-4 w-4" />
              {product.discount}% OFF
            </div>
          )}
        </motion.div>

        {/* Details Section */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col justify-center py-6"
        >
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary mb-3">
            {product.brand_name}
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-foreground leading-tight">
            {product.cloth_name}
          </h1>

          <div className="flex items-center gap-4 mb-8">
            <StarRating rating={product.rating} readonly size="lg" />
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Premium Quality</span>
          </div>

          <div className="flex items-baseline gap-4 mb-10 bg-muted/40 p-6 rounded-2xl border border-border/50 shadow-inner">
            <span className="text-4xl md:text-5xl font-black tabular-nums tracking-tight">
              ₹{discountedPrice ?? product.price.toFixed(2)}
            </span>
            {discountedPrice && (
              <span className="text-xl font-medium text-muted-foreground line-through decoration-red-500/50 decoration-2">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-muted-foreground ml-1">Quantity</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center p-1 border-2 border-border rounded-xl bg-card shadow-sm">
                <Button variant="ghost" size="icon" onClick={decreaseQuantity} className="h-10 w-10 shrink-0 rounded-lg hover:bg-muted">
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-14 text-center font-bold text-lg tabular-nums">{quantity}</div>
                <Button variant="ghost" size="icon" onClick={increaseQuantity} className="h-10 w-10 shrink-0 rounded-lg hover:bg-muted">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="px-5 py-3 rounded-xl bg-primary/5 text-primary">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-0.5">Total</div>
                <div className="font-black text-xl leading-none">
                  ₹{((discountedPrice ? parseFloat(discountedPrice) : product.price) * quantity).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => { if (id) addToCart(id, quantity); }}
              variant="outline"
              size="lg"
              className="flex-1 h-16 rounded-xl text-lg font-bold border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 gap-3"
            >
              <ShoppingBag className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button 
              onClick={handleOrder} 
              disabled={isOrdering}
              size="lg"
              className="flex-1 h-16 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isOrdering ? (
                <span className="flex items-center gap-2">
                   <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                   Processing...
                </span>
              ) : "Place Secure Order"}
            </Button>
          </div>

          <p className="text-xs font-medium text-muted-foreground mt-6 text-center uppercase tracking-widest opacity-70">
            Free shipping over ₹150 &middot; 30-day returns
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
