/**
 * Affiliate retailer configuration
 * Commission rates and affiliate parameters for each supported retailer
 */

export type RetailerKey = "selkirk" | "justpaddles" | "pickleballsuperstore" | "amazon";

export interface RetailerConfig {
  name: string;
  baseUrl: string;
  affiliateParam: string;
  affiliateId: string | undefined;
  commission: number; // Percentage as decimal (0.15 = 15%)
  cookieDuration: number; // Days
}

export const AFFILIATE_RETAILERS: Record<RetailerKey, RetailerConfig> = {
  selkirk: {
    name: "Selkirk",
    baseUrl: "https://www.selkirk.com",
    affiliateParam: "avad",
    affiliateId: process.env.SELKIRK_AFFILIATE_ID,
    commission: 0.15,
    cookieDuration: 30,
  },
  justpaddles: {
    name: "JustPaddles",
    baseUrl: "https://www.justpaddles.com",
    affiliateParam: "ref",
    affiliateId: process.env.JUSTPADDLES_AFFILIATE_ID,
    commission: 0.07,
    cookieDuration: 30,
  },
  pickleballsuperstore: {
    name: "Pickleball Superstore",
    baseUrl: "https://www.pickleballsuperstore.com",
    affiliateParam: "aff",
    affiliateId: process.env.PICKLEBALLSUPERSTORE_ID,
    commission: 0.32,
    cookieDuration: 30,
  },
  amazon: {
    name: "Amazon",
    baseUrl: "https://www.amazon.com",
    affiliateParam: "tag",
    affiliateId: process.env.AMAZON_ASSOCIATE_TAG,
    commission: 0.03,
    cookieDuration: 1, // 24 hours
  },
} as const;

/**
 * Get retailer config by key
 */
export function getRetailerConfig(retailer: RetailerKey): RetailerConfig {
  return AFFILIATE_RETAILERS[retailer];
}

/**
 * Check if a retailer has affiliate credentials configured
 */
export function isRetailerConfigured(retailer: RetailerKey): boolean {
  const config = AFFILIATE_RETAILERS[retailer];
  return !!config.affiliateId;
}

/**
 * Get all configured retailers (those with affiliate IDs set)
 */
export function getConfiguredRetailers(): RetailerKey[] {
  return (Object.keys(AFFILIATE_RETAILERS) as RetailerKey[]).filter(isRetailerConfigured);
}
