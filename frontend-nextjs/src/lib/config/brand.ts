/**
 * Brand Configuration
 * Defines Love Lovegood's brand identity, navigation, and category structure
 */

export interface NavItem {
  name: string
  href: string
}

export interface NavSection {
  id: string
  name: string
  items: NavItem[]
}

export interface FeaturedProduct {
  name: string
  href: string
  imageSrc: string
  imageAlt: string
}

export interface MegaMenuCategory {
  id: string
  name: string
  featured: FeaturedProduct[]
  sections: NavSection[]
}

export interface BrandConfig {
  name: string
  font: {
    family: string
    className: string
    googleFontsUrl: string
  }
  tagline: string
  footerSlogan: string
  navigation: {
    shopAll: NavItem
    megaMenus: MegaMenuCategory[]
    pages: NavItem[]
  }
}

/**
 * Luna Lovegood's Brand Configuration
 */
export const brandConfig: BrandConfig = {
  name: "Luna Lovegood's",
  font: {
    family: '"Cedarville Cursive", cursive',
    className: 'font-brand',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cedarville+Cursive&display=swap',
  },
  tagline: 'Curated treasures for free spirits',
  footerSlogan: 'Your enchanted emporium for curious treasures at spellbinding prices.',
  navigation: {
    // First menu item - no dropdown
    shopAll: {
      name: 'Shop All',
      href: '/products',
    },

    // Mega menu: "The Goods"
    megaMenus: [
      {
        id: 'the-goods',
        name: 'The Goods',
        // Featured products
        featured: [
          {
            name: 'Essence Mascara Lash Princess',
            href: '/products/1',
            imageSrc: 'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
            imageAlt: 'Essence Mascara Lash Princess',
          },
          {
            name: "Dior J'adore",
            href: '/products/8',
            imageSrc: "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/thumbnail.webp",
            imageAlt: "Dior J'adore",
          },
        ],
        sections: [
          {
            id: 'clothing',
            name: 'Clothing',
            items: [
              { name: 'Tops', href: '/category/tops' },
              { name: 'Dresses', href: '/category/womens-dresses' },
              { name: 'Shoes', href: '/category/womens-shoes' },
            ],
          },
          {
            id: 'accessories',
            name: 'Accessories',
            items: [
              { name: 'Jewellery', href: '/category/womens-jewellery' },
              { name: 'Bags', href: '/category/womens-bags' },
              { name: 'Sunglasses', href: '/category/sunglasses' },
            ],
          },
          {
            id: 'potions',
            name: 'Potions',
            items: [
              { name: 'Fragrances', href: '/category/fragrances' },
              { name: 'Beauty', href: '/category/beauty' },
            ],
          },
        ],
      },
    ],

    // Additional pages (can be expanded later)
    pages: [],
  },
}

/**
 * Category display names
 * Maps DummyJSON category slugs to human-readable names
 */
export const categoryDisplayNames: Record<string, string> = {
  'tops': 'Tops',
  'womens-dresses': 'Dresses',
  'womens-shoes': 'Shoes',
  'womens-jewellery': 'Jewellery',
  'womens-bags': 'Bags',
  'sunglasses': 'Sunglasses',
  'fragrances': 'Fragrances',
  'beauty': 'Beauty',
}

/**
 * Category descriptions for collection headers
 */
export const categoryDescriptions: Record<string, string> = {
  'tops': 'Discover our collection of effortlessly stylish tops for every occasion',
  'womens-dresses': 'Flowing silhouettes and dreamy designs for the modern bohemian',
  'womens-shoes': 'Step into style with our curated selection of footwear',
  'womens-jewellery': 'Adorn yourself with magical pieces that tell your story',
  'womens-bags': 'Carry your treasures in bags as unique as you are',
  'sunglasses': 'Protect your eyes while looking effortlessly cool',
  'fragrances': 'Enchanting scents to captivate and inspire',
  'beauty': 'Natural beauty essentials for your daily rituals',
}

/**
 * All configured category slugs for the site
 * These match the categories in the navigation menu
 */
export const configuredCategories = [
  'tops',
  'womens-dresses',
  'womens-shoes',
  'womens-jewellery',
  'womens-bags',
  'sunglasses',
  'fragrances',
  'beauty',
] as const

/**
 * Get category section name (Clothing, Accessories, or Potions)
 */
export function getCategorySection(categorySlug: string): string {
  const clothingCategories = ['tops', 'womens-dresses', 'womens-shoes']
  const accessoriesCategories = ['womens-jewellery', 'womens-bags', 'sunglasses']
  const potionsCategories = ['fragrances', 'beauty']

  if (clothingCategories.includes(categorySlug)) return 'Clothing'
  if (accessoriesCategories.includes(categorySlug)) return 'Accessories'
  if (potionsCategories.includes(categorySlug)) return 'Potions'

  return 'Products'
}
