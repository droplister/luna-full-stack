/**
 * Homepage
 * Redirects to products page
 */

import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/products')
}
