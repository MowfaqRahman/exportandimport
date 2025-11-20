'use client'
import { UserCircle } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { createClient } from '../../supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfileProps {
  isAdmin: boolean;
}

export default function UserProfile({ isAdmin }: UserProfileProps) {
    const supabase = createClient()
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <UserCircle className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      Admin Page
                    </Link>
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

    )
}