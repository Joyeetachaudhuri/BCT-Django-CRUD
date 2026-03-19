"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/star-rating";
import { ClothingCard, updateRating, deleteCard } from "@/lib/api";
import { toast } from "sonner";
import { BadgePercent, Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { Button } from "./ui/button";

interface ProductCardProps {
  card: ClothingCard;
  index: number;
  onRatingUpdate?: (id: string, newRating: number) => void;
  onDeleteSuccess?: (id: string) => void;
}

// Staggered card animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export default function ProductCard({ card, index, onRatingUpdate, onDeleteSuccess }: ProductCardProps) {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [rating, setRating] = useState(card.rating);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this product?")) return;
    setIsDeleting(true);
    try {
      await deleteCard(card.id);
      toast.success("Product deleted successfully");
      if (onDeleteSuccess) onDeleteSuccess(card.id);
    } catch {
      toast.error("Failed to delete product");
      setIsDeleting(false);
    }
  };

  const handleRate = async (newRating: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to rate items");
      router.push("/auth");
      return;
    }
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateRating(card.id, newRating);
      setRating(newRating);
      onRatingUpdate?.(card.id, newRating);
      toast.success("Rating updated!", {
        description: `${card.cloth_name} rated ${newRating}/5 ★`,
      });
    } catch {
      toast.error("Failed to update rating", {
        description: "Please try again later.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const discountedPrice =
    card.discount > 0
      ? (card.price - (card.price * card.discount) / 100).toFixed(2)
      : null;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <Card
        className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => router.push(`/products/${card.id}`)}
      >
        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <motion.img
            src={
              card.image_url ||
              `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80`
            }
            alt={card.cloth_name}
            className="h-full w-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />

          {isAdmin && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-3 left-3 h-8 w-8 z-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          {/* Discount Badge */}
          {card.discount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg"
            >
              <BadgePercent className="h-3 w-3" />
              {card.discount}% OFF
            </motion.div>
          )}

          {/* Hover overlay with rating */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{
                y: isHovered ? 0 : 20,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-white/80 tracking-wide uppercase">
                Rate this item
              </span>
              <div onClick={(e) => e.stopPropagation()}>
                <StarRating rating={rating} onRate={handleRate} size="lg" />
              </div>
            </motion.div>

            {/* Add to Cart button */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{
                x: isHovered ? 0 : 20,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="absolute bottom-4 right-4"
            >
              <Button
                size="icon"
                className="h-10 w-10 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    toast.error("Please login to add to cart");
                    router.push("/auth");
                    return;
                  }
                  addToCart(card.id);
                }}
              >
                <ShoppingBag className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Card Content */}
        <CardContent className="p-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {card.brand_name}
          </p>
          <h3 className="text-sm font-medium leading-snug line-clamp-1">
            {card.cloth_name}
          </h3>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold">
                ₹{discountedPrice ?? card.price.toFixed(2)}
              </span>
              {discountedPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{card.price.toFixed(2)}
                </span>
              )}
            </div>
            <StarRating rating={rating} readonly size="sm" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
