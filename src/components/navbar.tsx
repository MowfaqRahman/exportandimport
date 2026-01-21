import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '../../supabase/server'
import { Button } from './ui/button'
import { User, UserCircle } from 'lucide-react'
import UserProfile from './user-profile'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await (await supabase).auth.getUser()

  return (
    <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-2">
          <Image src="/logo.png" alt="KTF Logo" width={40} height={40} className="h-10 w-auto" />
          <span className="font-bold text-xl text-green-900 hidden sm:block">KTF Fruits & Veg</span>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="ghost" className="text-green-800 hover:text-green-950 hover:bg-green-50">
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-green-900 hover:text-green-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
              >
                <Button className="bg-green-700 hover:bg-green-800 text-white rounded-full px-6">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
