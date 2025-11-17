import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'

/**
 * Shop Layout
 *
 * Standard layout for product browsing pages (products, collections, cart).
 * Includes Header, Footer, and CartDrawer for complete shopping experience.
 */
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
