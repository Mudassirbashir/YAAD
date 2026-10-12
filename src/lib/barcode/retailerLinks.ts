export interface RetailerLink {
  id: string;
  name: string;
  iconName: string;
  badge?: string;
  getUrl: (query: string) => string;
}

/**
 * Standard Retailer Price & Product Search Providers
 * Modeled after the 16-retailer price engine discovered in reverse-engineering.
 */
export const RETAILER_LINKS: RetailerLink[] = [
  {
    id: 'google_shopping',
    name: 'Google Shopping',
    iconName: 'Search',
    badge: 'Universal',
    getUrl: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=shop`,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    iconName: 'ShoppingBag',
    badge: 'Fast',
    getUrl: (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
  },
  {
    id: 'daraz',
    name: 'Daraz PK',
    iconName: 'Store',
    badge: 'Pakistan',
    getUrl: (q: string) => `https://www.daraz.pk/catalog/?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'ebay',
    name: 'eBay',
    iconName: 'Tag',
    getUrl: (q: string) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`,
  },
  {
    id: 'walmart',
    name: 'Walmart',
    iconName: 'ShoppingCart',
    getUrl: (q: string) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}`,
  },
];

/**
 * Generates search URLs for a given barcode or product title.
 */
export function getRetailerLinksForQuery(query: string): Array<RetailerLink & { url: string }> {
  const clean = query.trim();
  if (!clean) return [];

  return RETAILER_LINKS.map((r) => ({
    ...r,
    url: r.getUrl(clean),
  }));
}
