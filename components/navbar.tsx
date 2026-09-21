"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bell,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import SearchOverlay from "@/components/SearchOverlay";
import { type CartItem } from "@/lib/cart";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  isRead: boolean;
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
const [searchOpen, setSearchOpen] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);
const [cartCount, setCartCount] = useState(0);
const [wishlistCount, setWishlistCount] = useState(0);

const pathname = usePathname();

  useEffect(() => {
  async function loadUnreadNotifications() {
    try {
      const response = await fetch(
        "/api/account/notifications",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setUnreadCount(0);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data.notifications)) {
        const unread = data.notifications.filter(
          (notification: Notification) =>
            !notification.isRead
        ).length;

        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
    } catch {
      setUnreadCount(0);
    }
  }

  loadUnreadNotifications();

  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      loadUnreadNotifications();
    }
  }

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );


  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}, []);

useEffect(() => {
  function loadCartCount() {
    try {
      const storedCart = localStorage.getItem("tricea-cart");

      if (!storedCart) {
        setCartCount(0);
        return;
      }

      const cart: CartItem[] = JSON.parse(storedCart);

      const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
      );

      setCartCount(totalQuantity);
    } catch {
      setCartCount(0);
    }
  }

  loadCartCount();

  function handleCartUpdate() {
    loadCartCount();
  }

  window.addEventListener("cart-updated", handleCartUpdate);

  return () => {
    window.removeEventListener("cart-updated", handleCartUpdate);
  };
}, []);

useEffect(() => {
  async function loadWishlistCount() {
    try {
      const response = await fetch(
        "/api/account/wishlist",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setWishlistCount(0);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data.productIds)) {
        setWishlistCount(data.productIds.length);
      } else {
        setWishlistCount(0);
      }
    } catch {
      setWishlistCount(0);
    }
  }

  loadWishlistCount();

  function handleWishlistUpdate() {
    loadWishlistCount();
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      loadWishlistCount();
    }
  }

  window.addEventListener(
    "wishlist-updated",
    handleWishlistUpdate
  );

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () => {
    window.removeEventListener(
      "wishlist-updated",
      handleWishlistUpdate
    );

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}, []);

if (pathname.startsWith("/admin")) {
  return null;
}

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link href="/" className="navbar-logo">
          Tricea <span>NG</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-links">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          <button
  type="button"
  aria-label="Search"
  onClick={() => setSearchOpen(true)}
>
  <Search size={19} strokeWidth={1.6} />
</button>

          <Link href="/account" aria-label="Account">
            <UserRound size={19} strokeWidth={1.6} />
          </Link>

          <Link
  href="/account/wishlist"
  className="navbar-wishlist-link"
  aria-label={
    wishlistCount > 0
      ? `${wishlistCount} saved wishlist items`
      : "Wishlist"
  }
>
  <Heart
    size={19}
    strokeWidth={1.6}
    fill={wishlistCount > 0 ? "currentColor" : "none"}
  />

  {wishlistCount > 0 && (
    <span className="navbar-wishlist-badge">
      {wishlistCount > 9 ? "9+" : wishlistCount}
    </span>
  )}
</Link>

          <Link
            href="/account/notifications"
            className="navbar-notification-link"
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
          >
            <Bell size={19} strokeWidth={1.6} />

            {unreadCount > 0 && (
              <span className="navbar-notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
  href="/cart"
  className="navbar-cart-link"
  aria-label={
    cartCount > 0
      ? `${cartCount} items in shopping bag`
      : "Shopping bag"
  }
>
  <ShoppingBag size={19} strokeWidth={1.6} />

  {cartCount > 0 && (
    <span className="navbar-cart-badge">
      {cartCount > 9 ? "9+" : cartCount}
    </span>
  )}
</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={
            menuOpen ? "Close menu" : "Open menu"
          }
        >
          {menuOpen ? (
            <X size={23} strokeWidth={1.6} />
          ) : (
            <Menu size={23} strokeWidth={1.6} />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/shop"
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </Link>

          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>

          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>

          <div className="mobile-menu-divider" />

          <button
  type="button"
  className="mobile-menu-search"
  onClick={() => {
    setMenuOpen(false);
    setSearchOpen(true);
  }}
>
  <Search size={18} strokeWidth={1.6} />
  <span>Search</span>
</button>

          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
          >
            Account
          </Link>

          <Link
            href="/account/notifications"
            onClick={() => setMenuOpen(false)}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="mobile-notification-count">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/account/wishlist"
            onClick={() => setMenuOpen(false)}
          >
            Wishlist
          </Link>

          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
          >
            Shopping Bag
          </Link>
        </div>
      )}
      <SearchOverlay
  open={searchOpen}
  onClose={() => setSearchOpen(false)}
/>
    </header>
  );
}