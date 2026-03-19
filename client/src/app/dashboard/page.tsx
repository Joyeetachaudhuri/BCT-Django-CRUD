"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createCard } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldAlert, PackagePlus } from "lucide-react";
import AuthGuard from "@/components/auth-guard";

export default function DashboardPage() {
  const router = useRouter();
  const { isAdmin, loading } = useAuth();
  const [formData, setFormData] = useState({
    brand_name: "",
    cloth_name: "",
    image_url: "",
    price: "",
    discount: "0",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return null;

  if (!isAdmin) {
    if (typeof window !== "undefined") router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createCard({
        brand_name: formData.brand_name,
        cloth_name: formData.cloth_name,
        image_url: formData.image_url,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
      });
      toast.success("Product added successfully!");
      router.push("/");
    } catch {
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto max-w-3xl px-6 py-10 md:py-20 w-full flex-1"
    >
      <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-xl shadow-inner bg-card border border-border">
          <ShieldAlert className="h-6 w-6 text-indigo-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the store catalogue and products securely.</p>
      </div>

      <Card className="border-border/60 shadow-xl shadow-black/5 bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 py-6">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-primary" />
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Brand Name</Label>
                <Input id="brand" required placeholder="e.g. Prada" value={formData.brand_name} onChange={(e) => setFormData({...formData, brand_name: e.target.value})} className="h-11 shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Item Name</Label>
                <Input id="item" required placeholder="e.g. Silk Shirt" value={formData.cloth_name} onChange={(e) => setFormData({...formData, cloth_name: e.target.value})} className="h-11 shadow-sm" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Image URL (Optional)</Label>
              <Input id="image" type="url" placeholder="https://images.unsplash.com/..." value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="h-11 shadow-sm font-mono text-sm" />
              <p className="text-xs text-muted-foreground opacity-80">Leave blank to use a default placeholder image.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Price ($)</Label>
                <Input id="price" type="number" step="0.01" min="0" required placeholder="0.00" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="h-11 shadow-sm font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Discount (%)</Label>
                <Input id="discount" type="number" min="0" max="100" placeholder="0" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="h-11 shadow-sm font-mono" />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-xl">
              {isSubmitting ? "Generating Product..." : "Deploy Product to Store"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
    </AuthGuard>
  );
}
