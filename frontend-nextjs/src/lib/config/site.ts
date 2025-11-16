/**
 * Site Configuration
 * General site settings and page configurations
 */

import { brandConfig } from './brand'

export interface SiteConfig {
  title: string
  description: string
  url: string
  productsPerPage: number
}

export const siteConfig: SiteConfig = {
  title: brandConfig.name,
  description: brandConfig.tagline,
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  productsPerPage: 12,
}
