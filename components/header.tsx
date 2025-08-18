"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  User,
  MapPin,
  ChartColumn,
  LogOut,
  Menu,
  LogInIcon,
  Store,
  Images,
  Home,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Update useEffect untuk pengecekan auth
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setUser(user);
          setIsAdmin(user.role === "admin");
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsLoggedIn(false);
          setIsAdmin(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUser(null);
      }
    };

    // Hanya check auth jika bukan dari admin dashboard
    if (!pathname?.startsWith("/admin")) {
      checkAuth();
    }

    const handleAuthChange = (event: CustomEvent) => {
      if (event.detail?.action === "logout") {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUser(null);
      }
    };

    window.addEventListener("authChange", handleAuthChange as EventListener);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener(
        "authChange",
        handleAuthChange as EventListener
      );
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);

  // Don't render header on admin dashboard pages
  if (pathname?.startsWith("/admin/dashboard")) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    setIsSheetOpen(false);
    router.push("/");
  };

  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);
    router.push(path);
  };

  const handleAdminNavigation = (path: string) => {
    setIsSheetOpen(false);
    router.push(`/admin/dashboard?tab=${path}`);
  };

  const handleTabNavigationUser = (tab: string) => {
    setIsSheetOpen(false);
    // Find the dashboard component and update its tab
    const event = new CustomEvent("changeUserTab", { detail: tab });
    window.dispatchEvent(event);
    router.push("/user/dashboard");
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  const navigationItems = [
    { href: "/", label: "Beranda" },
    { href: "/about", label: "Tentang" },
    { href: "/tourism", label: "Wisata" },
    { href: "/gallery", label: "Galeri" },
    { href: "/umkm", label: "UMKM" },
    { href: "/basecamp", label: "Basecamp" },
    { href: "/events", label: "Acara" },
    { href: "/analytics", label: "Statistik" },
    { href: "/kontak", label: "Kontak" },
  ];

  return (
    <header className="bg-background shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <nav className="flex items-center justify-between py-3 sm:py-4">
          {/* Logo Section - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <Image
              src="/logo-boyolali.png"
              alt="Logo Boyolali"
              width={60}
              height={60}
              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain flex-shrink-0"
              priority
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-foreground leading-tight truncate">
                Desa Tarubatang
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Boyolali, Jawa Tengah
              </p>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile and tablet */}
          <div className="hidden xl:flex items-center space-x-4 2xl:space-x-6">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "text-muted-foreground hover:text-green-600 font-medium transition-colors duration-200 text-sm 2xl:text-base whitespace-nowrap",
                  pathname === item.href && "text-green-600"
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Section - Auth & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Mode Toggle - Hidden on smallest screens */}
            <div className="hidden xs:block">
              <ModeToggle />
            </div>

            {/* Desktop Auth Controls */}
            {isLoggedIn ? (
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.image || ""}
                          alt={user?.email || "User"}
                        />
                        <AvatarFallback className="text-xs">
                          {user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 max-w-[calc(100vw-2rem)]"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {isAdmin ? "Admin Panel" : "Akun Saya"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {isAdmin && (
                      <>
                        <DropdownMenuItem
                          onSelect={() => router.push("/admin/dashboard")}
                          className="cursor-pointer"
                        >
                          <ChartColumn className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Dashboard Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleAdminNavigation("destinations")}
                          className="cursor-pointer"
                        >
                          <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            Kelola Destinasi Wisata
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleAdminNavigation("umkm")}
                          className="cursor-pointer"
                        >
                          <Store className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Kelola UMKM</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleAdminNavigation("basecamp")}
                          className="cursor-pointer"
                        >
                          <Home className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Kelola Basecamp</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleAdminNavigation("events")}
                          className="cursor-pointer"
                        >
                          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Kelola Event & Acara</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleAdminNavigation("gallery")}
                          className="cursor-pointer"
                        >
                          <Images className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Kelola Galeri</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {!isAdmin && (
                      <>
                        <DropdownMenuItem
                          onSelect={() => handleTabNavigationUser("profile")}
                          className="cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Profil Saya</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleNavigation("/user/dashboard")}
                          className="cursor-pointer"
                        >
                          <LogInIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Dashboard User</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Keluar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="hidden sm:inline-flex text-xs sm:text-sm px-3 sm:px-4"
                asChild
              >
                <Link href="/auth/login">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden md:inline">Masuk</span>
                  <span className="md:hidden">Login</span>
                </Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="xl:hidden h-8 w-8 sm:h-9 sm:w-9 p-0"
                  onClick={() => setIsSheetOpen(true)}
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[280px] sm:w-[320px] p-0 overflow-y-auto"
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <SheetHeader className="px-4 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-left text-base sm:text-lg">
                        Menu Navigasi
                      </SheetTitle>
                    </div>
                  </SheetHeader>

                  {/* Content */}
                  <div className="flex-1 px-4 py-4">
                    {/* Mode Toggle - Show on mobile */}
                    <div className="xs:hidden mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tema</span>
                        <ModeToggle />
                      </div>
                    </div>

                    {/* Main Navigation */}
                    <nav className="space-y-1">
                      <div className="space-y-1">
                        {navigationItems.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            onClick={closeSheet}
                            className={cn(
                              "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200",
                              "text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10",
                              pathname === item.href &&
                                "text-green-600 bg-green-50 dark:bg-green-900/10"
                            )}
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    </nav>

                    {/* Auth Section */}
                    <div className="mt-6 pt-6 border-t">
                      {isLoggedIn ? (
                        <div className="space-y-1">
                          {/* User Info */}
                          <div className="px-3 py-2 mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={user?.image || ""}
                                  alt={user?.email || "User"}
                                />
                                <AvatarFallback className="text-xs">
                                  {user?.email?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {isAdmin ? "Admin" : "User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Admin Menu */}
                          {isAdmin && (
                            <div className="space-y-1">
                              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Admin Panel
                              </p>
                              <button
                                onClick={() =>
                                  handleNavigation("/admin/dashboard")
                                }
                                className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md transition-colors"
                              >
                                <ChartColumn className="mr-3 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  Dashboard Admin
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  handleAdminNavigation("destinations")
                                }
                                className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md transition-colors"
                              >
                                <MapPin className="mr-3 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  Kelola Destinasi
                                </span>
                              </button>
                              <button
                                onClick={() => handleAdminNavigation("events")}
                                className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md transition-colors"
                              >
                                <Calendar className="mr-3 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">Kelola Event</span>
                              </button>
                              <button
                                onClick={() => handleAdminNavigation("umkm")}
                                className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md transition-colors"
                              >
                                <Store className="mr-3 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">Kelola UMKM</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleAdminNavigation("basecamp")
                                }
                                className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md transition-colors"
                              >
                                <Home className="mr-3 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  Kelola Basecamp
                                </span>
                              </button>
                              <button
                                onClick={() => handleAdminNavigation("gallery")}
                                className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md transition-colors"
                              >
                                <Images className="mr-3 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">Kelola Galeri</span>
                              </button>
                            </div>
                          )}

                          {/* User Menu */}
                          {!isAdmin && (
                            <div className="space-y-1">
                              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Akun Saya
                              </p>
                              <button
                                onClick={() =>
                                  handleTabNavigationUser("profile")
                                }
                                className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md transition-colors"
                              >
                                <User className="mr-3 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">Profil Saya</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleNavigation("/user/dashboard")
                                }
                                className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md transition-colors"
                              >
                                <LogInIcon className="mr-3 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">Dashboard User</span>
                              </button>
                            </div>
                          )}

                          {/* Logout Button */}
                          <div className="pt-3 mt-3 border-t">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors"
                            >
                              <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
                              <span className="truncate">Keluar</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <Link
                          href="/auth/login"
                          onClick={closeSheet}
                          className="flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md transition-colors"
                        >
                          <User className="mr-3 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Masuk Sebagai Admin</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
