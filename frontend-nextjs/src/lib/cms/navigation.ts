/**
 * Navigation Configuration
 * Defines site navigation structure including mega menus and footer
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

export interface FooterSection {
  title: string
  links: NavItem[]
}

/**
 * Main Navigation
 */
export const navigation = {
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
            { name: 'Tops', href: '/collections/tops' },
            { name: 'Dresses', href: '/collections/womens-dresses' },
            { name: 'Shoes', href: '/collections/womens-shoes' },
          ],
        },
        {
          id: 'accessories',
          name: 'Accessories',
          items: [
            { name: 'Jewellery', href: '/collections/womens-jewellery' },
            { name: 'Bags', href: '/collections/womens-bags' },
            { name: 'Sunglasses', href: '/collections/sunglasses' },
          ],
        },
        {
          id: 'potions',
          name: 'Potions',
          items: [
            { name: 'Fragrances', href: '/collections/fragrances' },
            { name: 'Beauty', href: '/collections/beauty' },
          ],
        },
      ],
    },
  ] as MegaMenuCategory[],

  // Additional pages (can be expanded later)
  pages: [
    { name: 'FAQ', href: '#' },
  ] as NavItem[],
}

/**
 * Footer Navigation
 */
export const footerNav: FooterSection[] = [
  {
    title: 'Shop',
    links: [
      { name: 'All Products', href: '/products' },
      { name: 'Clothing', href: '#' },
      { name: 'Accessories', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Shopping Cart', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'Returns', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
    ],
  },
]
