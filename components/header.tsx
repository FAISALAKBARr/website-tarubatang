"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, Mountain, User, MapPin, ChartColumn, LogOut } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Add this function to check auth status immediately after login
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setUser(user);
          setIsAdmin(user.role === 'admin');
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Reset states if there's an error
          setIsLoggedIn(false);
          setIsAdmin(false);
          setUser(null);
        }
      }
    };

    // Check immediately when component mounts
    checkAuth();

    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    // Add custom event listener for login success
    const handleLoginSuccess = () => checkAuth();
    window.addEventListener('loginSuccess', handleLoginSuccess);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    router.push('/');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleTabNavigation = (tab: string) => {
    // Find the dashboard component and update its tab
    const event = new CustomEvent('changeAdminTab', { detail: tab });
    window.dispatchEvent(event);
    router.push('/admin/dashboard');
  };

  return (
    <header className="bg-background shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mountain className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Desa Tarubatang</h1>
              <p className="text-sm text-muted-foreground">Boyolali, Jawa Tengah</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#beranda" className="text-muted-foreground hover:text-green-600 font-medium">
              Beranda
            </a>
            <a href="#tentang" className="text-muted-foreground hover:text-green-600 font-medium">
              Tentang
            </a>
            <a href="#wisata" className="text-muted-foreground hover:text-green-600 font-medium">
              Wisata
            </a>
            <a href="#umkm" className="text-muted-foreground hover:text-green-600 font-medium">
              UMKM
            </a>
            <a href="#acara" className="text-muted-foreground hover:text-green-600 font-medium">
              Acara
            </a>
            <a href="#kontak" className="text-muted-foreground hover:text-green-600 font-medium">
              Kontak
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage src={user?.image || ''} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{isAdmin ? 'Admin Panel' : 'Akun Saya'}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <>
                      <DropdownMenuItem onSelect={() => handleTabNavigation('destinations')}>
                        <MapPin className="mr-2 h-4 w-4 inline" />
                        Kelola Destinasi
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabNavigation('events')}>
                        <Calendar className="mr-2 h-4 w-4 inline" />
                        Kelola Event
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabNavigation('users')}>
                        <User className="mr-2 h-4 w-4 inline" />
                        Kelola Pengguna
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleTabNavigation('analytics')}>
                        <ChartColumn className="mr-2 h-4 w-4 inline" />
                        Analisis & Statistik
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onSelect={() => handleNavigation('/user/dashboard')}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleNavigation('/profile')}>
                        Profil Saya
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4 inline" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" className="hidden md:inline-flex">
                <Link href="/auth/login" className="text-sm">
                  <User className="h-4 w-4 mr-2 inline" />
                  Masuk
                </Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
