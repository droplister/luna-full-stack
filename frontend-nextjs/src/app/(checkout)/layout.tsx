/**
 * Checkout Layout
 *
 * Minimal layout for checkout flow.
 * No Header, Footer, or CartDrawer - checkout page provides its own custom header.
 */
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
