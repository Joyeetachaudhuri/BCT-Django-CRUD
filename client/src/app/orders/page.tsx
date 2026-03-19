"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getOrders, Order } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock } from "lucide-react";
import { toast } from "sonner";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view your orders");
        router.push("/login");
        return;
      }

      try {
        const res = await getOrders();
        setOrders(res.data);
      } catch (e) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-5xl px-6 py-10 md:py-20 flex-1 w-full"
    >
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center md:justify-start gap-4 text-foreground">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Package className="h-8 w-8" />
          </div>
          Order History
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
          Track, manage, and review all your recent premium fashion purchases.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl bg-card border border-border/50 shadow-sm" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-border/80 shadow-inner"
        >
          <div className="bg-background p-6 rounded-full shadow-lg border border-border/50 mb-6">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No Orders Yet</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Your wardrobe is waiting. Explore our premium collections and find your next favorite piece today.
          </p>
          <button 
            onClick={() => router.push("/")}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all duration-300 active:scale-95 uppercase tracking-wide"
          >
            Start Shopping
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
            >
              <Card className="overflow-hidden border-border/60 hover:border-primary/30 bg-card/80 backdrop-blur-md transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 rounded-2xl group">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="w-full sm:w-48 h-56 sm:h-auto shrink-0 bg-muted relative overflow-hidden ring-1 ring-border/50">
                      <img
                        src={order.card.image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80"}
                        alt={order.card.cloth_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    {/* Details */}
                    <div className="p-6 flex-1 flex flex-col justify-between hidden sm:flex">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1.5">
                              {order.card.brand_name}
                            </p>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight">{order.card.cloth_name}</h3>
                          </div>
                          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs uppercase tracking-widest font-black flex items-center shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                            {order.status}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-4 bg-muted/50 w-fit px-3 py-1.5 rounded-lg border border-border/50">
                          <Clock className="w-4 h-4 text-primary" />
                          Ordered on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
                        </p>
                      </div>
                      <div className="flex items-end justify-between mt-8 border-t border-border/50 pt-5">
                        <div className="text-sm">
                          <span className="text-muted-foreground uppercase tracking-widest font-semibold text-xs mb-1 block">Quantity</span> 
                          <span className="font-bold text-lg tabular-nums bg-muted px-4 py-1.5 rounded-lg border border-border/50">{order.quantity}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-widest font-bold">Total Amount</p>
                          <p className="text-3xl font-black tabular-nums tracking-tight">₹{order.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Details */}
                    <div className="p-5 flex-1 flex flex-col sm:hidden">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1">
                              {order.card.brand_name}
                            </p>
                            <h3 className="text-xl font-bold line-clamp-1">{order.card.cloth_name}</h3>
                          </div>
                          <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] uppercase tracking-widest font-black flex items-center">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5" />
                            {order.status}
                          </div>
                        </div>
                        <div className="flex justify-between items-end mt-4 pt-4 border-t border-border/50">
                           <div>
                             <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Qty</p>
                             <div className="font-bold bg-muted px-3 py-1 rounded-md text-sm">{order.quantity}</div>
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Total</p>
                             <p className="text-2xl font-black">₹{order.total_price.toFixed(2)}</p>
                           </div>
                        </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
