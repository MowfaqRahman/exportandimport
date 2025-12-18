'use client'

import Link from 'next/link'
import { createClient } from '../../supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { UserCircle, Home } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from 'react'; // Import React, useEffect, useState

interface DashboardNavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ activeTab, setActiveTab }) => {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
        } else if (data) {
          setUserRole(data.role);
        }
      }
    };

    fetchUserRole();
  }, [supabase]);

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="text-xl font-bold">
            Logo
          </Link>
          <Link href="/dashboard" prefetch className={`text-sm font-medium transition-colors ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}>
            Dashboard
          </Link>
          <Link href="/company-overview" className={`text-sm font-medium transition-colors ${pathname === "/company-overview"
            ? "text-primary"
            : "text-muted-foreground hover:text-primary"
            }`}>
            Company Overview
          </Link>
          <Link href="/reports-history" prefetch className={`text-sm font-medium transition-colors ${pathname === "/reports-history"
            ? "text-primary"
            : "text-muted-foreground hover:text-primary"
            }`}>
            Reports & History
          </Link>
          <Link href="/customers-products" prefetch className={`text-sm font-medium transition-colors ${pathname === "/customers-products"
            ? "text-primary"
            : "text-muted-foreground hover:text-primary"
            }`}>
            Customers & Products
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {userRole === 'admin' && (
                <DropdownMenuItem onClick={() => router.push('/admin')}>
                  Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={async () => {
                await supabase.auth.signOut()
                router.refresh()
              }}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNavbar;
