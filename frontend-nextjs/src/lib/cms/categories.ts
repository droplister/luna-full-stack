/**
 * Category Configuration
 * Defines product categories, display names, and descriptions
 */

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
