/**
 * Site Configuration
 * General site settings and page configurations
 */

import { brand } from '@/lib/cms'

export interface FontConfig {
  family: string
  className: string
  googleFontsUrl: string
}

export interface SiteConfig {
  title: string
  description: string
  url: string
  productsPerPage: number
  font: FontConfig
}

export const siteConfig: SiteConfig = {
  title: brand.name,
  description: brand.tagline,
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  productsPerPage: 12,
  font: {
    family: '"Cedarville Cursive", cursive',
    className: 'font-brand',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cedarville+Cursive&display=swap',
  },
}
