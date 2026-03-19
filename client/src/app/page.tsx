"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { getCards, ClothingCard } from "@/lib/api";
import ProductCard from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
// import AuthGuard from "@/components/auth-guard";

// Page entrance animation
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function GalleryPage() {
  const [cards, setCards] = useState<ClothingCard[]>([]);
  const [filtered, setFiltered] = useState<ClothingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCards();
      setCards(res.data);
      setFiltered(res.data);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Filter on search
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(cards);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      cards.filter(
        (c) =>
          c.brand_name.toLowerCase().includes(q) ||
          c.cloth_name.toLowerCase().includes(q)
      )
    );
  }, [search, cards]);

  const handleRatingUpdate = (id: string, newRating: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, rating: newRating } : c))
    );
  };

  const handleDeleteSuccess = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setFiltered((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex-1"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
         <div className="absolute right-0 top-0">
            <img src="/hero.png" alt="Hero" />
</div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl"
          >
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                New Collection
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-black">
              Curated
              <br />
              <span className="text-muted-foreground">Fashion</span>
            </h1>
            <p className="mt-4 text-base text-black max-w-md">
              Discover premium clothing pieces that define modern elegance.
              Each item is carefully selected for quality and style.
            </p>
            
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Search / Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold">All Products</h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} item{filtered.length !== 1 && "s"} available
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search brand or item..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((card, i) => (
              <ProductCard
                key={card.id}
                card={card}
                index={i}
                onRatingUpdate={handleRatingUpdate}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Try adjusting your search terms"
                : "Products will appear here once added"}
            </p>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}
