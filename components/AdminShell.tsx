"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Box,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Tag,
  X,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="admin-layout">
      {/* Mobile Admin Header */}
      <header className="admin-mobile-header">
        <Link href="/admin" className="admin-mobile-brand">
          <span>TRICEA NG</span>
          <small>ADMIN</small>
        </Link>

        <button
          type="button"
          className="admin-mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={
            mobileMenuOpen
              ? "Close admin menu"
              : "Open admin menu"
          }
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X size={23} strokeWidth={1.6} />
          ) : (
            <Menu size={23} strokeWidth={1.6} />
          )}
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link href="/admin">TRICEA NG</Link>
          <span>ADMIN</span>
        </div>

        <nav
          className="admin-navigation"
          aria-label="Admin navigation"
        >
          <Link href="/admin">
            <LayoutDashboard size={18} strokeWidth={1.6} />
            <span>Dashboard</span>
          </Link>

          <Link href="/admin/products">
            <Box size={18} strokeWidth={1.6} />
            <span>Products</span>
          </Link>

          <Link href="/admin/orders">
            <ClipboardList size={18} strokeWidth={1.6} />
            <span>Orders</span>
          </Link>

          <Link href="/admin/categories">
            <Tag size={18} strokeWidth={1.6} />
            <span>Categories</span>
          </Link>

          <Link href="/admin/settings">
            <Settings size={18} strokeWidth={1.6} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="admin-signout-button"
            >
              <LogOut size={18} strokeWidth={1.6} />
              <span>Sign Out</span>
            </button>
          </form>

          <Link
            href="/"
            className="admin-store-link"
          >
            <ArrowLeft size={17} strokeWidth={1.6} />
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="admin-mobile-menu">
          <nav
            className="admin-mobile-navigation"
            aria-label="Mobile admin navigation"
          >
            <Link
              href="/admin"
              onClick={closeMobileMenu}
            >
              <LayoutDashboard size={19} strokeWidth={1.6} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/products"
              onClick={closeMobileMenu}
            >
              <Box size={19} strokeWidth={1.6} />
              <span>Products</span>
            </Link>

            <Link
              href="/admin/orders"
              onClick={closeMobileMenu}
            >
              <ClipboardList size={19} strokeWidth={1.6} />
              <span>Orders</span>
            </Link>

            <Link
              href="/admin/categories"
              onClick={closeMobileMenu}
            >
              <Tag size={19} strokeWidth={1.6} />
              <span>Categories</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={closeMobileMenu}
            >
              <Settings size={19} strokeWidth={1.6} />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="admin-mobile-menu-footer">
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="admin-signout-button"
              >
                <LogOut size={19} strokeWidth={1.6} />
                <span>Sign Out</span>
              </button>
            </form>

            <Link
              href="/"
              className="admin-store-link"
              onClick={closeMobileMenu}
            >
              <ArrowLeft size={18} strokeWidth={1.6} />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      )}

      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}