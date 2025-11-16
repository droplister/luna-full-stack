'use client'

import { usePathname } from 'next/navigation'
import { Header } from '../header'
import { Footer } from '../footer'
import { CartDrawer } from '../cart/cart-drawer'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCheckoutPage = pathname === '/checkout'

  if (isCheckoutPage) {
    // Checkout page has its own layout (no header/footer from root)
    return (
      <>
        {children}
        <CartDrawer />
      </>
    )
  }

  // Standard layout with header and footer
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
