"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import {
  ShoppingBag,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Package,
  Heart,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Gallery", icon: ShoppingBag },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, username, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold tracking-tighter transition-transform group-hover:scale-110">
            É
          </div>
          <span className="text-lg font-semibold tracking-tight">
            ÉLEVE
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            if (link.href === "/dashboard" && !isAdmin) return null;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2 text-sm font-medium"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Cart Icon with Badge */}
              <Link href="/cart">
                <Button
                  variant={pathname === "/cart" ? "secondary" : "ghost"}
                  size="icon"
                  className="relative h-9 w-9"
                  id="cart-button"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg"
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>

              {/* Profile Dropdown */}
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent focus:outline-none cursor-pointer"
                  id="profile-dropdown-trigger"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="hidden sm:inline text-foreground max-w-[100px] truncate">
                    {username}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }} />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex items-center gap-2 px-2 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{username}</span>
                        <span className="text-xs text-muted-foreground">
                          {isAdmin ? "Admin" : "Member"}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    id="dropdown-account"
                    onClick={() => { setDropdownOpen(false); router.push("/orders"); }}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Account
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    id="dropdown-orders"
                    onClick={() => { setDropdownOpen(false); router.push("/orders"); }}
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    My Orders
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    id="dropdown-wishlist"
                    onClick={() => { setDropdownOpen(false); router.push("/wishlist"); }}
                  >
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    My Wishlist
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    variant="destructive"
                    id="dropdown-logout"
                    onClick={() => { setDropdownOpen(false); logout(); }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth">
              <Button variant="default" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
          <div className="pl-2 border-l border-border/50">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-center gap-1 border-t border-white/5 py-2 px-4">
        {navLinks.map((link) => {
          if (link.href === "/dashboard" && !isAdmin) return null;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex-1">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="w-full gap-2 text-xs"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </motion.header>
  );
}
