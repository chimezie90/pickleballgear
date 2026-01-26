import { AFFILIATE_RETAILERS, type RetailerKey } from "./retailers";

/**
 * Generate an affiliate link from a base product URL
 * Appends the appropriate affiliate parameter for the retailer
 */
export function generateAffiliateLink(
  productUrl: string,
  retailer: RetailerKey
): string | null {
  const config = AFFILIATE_RETAILERS[retailer];

  if (!config.affiliateId) {
    // No affiliate ID configured for this retailer
    return null;
  }

  try {
    const url = new URL(productUrl);
    url.searchParams.set(config.affiliateParam, config.affiliateId);
    return url.toString();
  } catch {
    // Invalid URL
    return null;
  }
}

/**
 * Generate affiliate links for all configured retailers
 * Returns a map of retailer -> affiliate URL
 */
export function generateAllAffiliateLinks(
  productUrls: Partial<Record<RetailerKey, string>>
): Record<RetailerKey, string | null> {
  const result: Record<RetailerKey, string | null> = {
    selkirk: null,
    justpaddles: null,
    pickleballsuperstore: null,
    amazon: null,
  };

  for (const [retailer, url] of Object.entries(productUrls)) {
    if (url) {
      result[retailer as RetailerKey] = generateAffiliateLink(url, retailer as RetailerKey);
    }
  }

  return result;
}

/**
 * Extract the base product URL from an affiliate link
 * Removes the affiliate parameter to get the clean URL
 */
export function stripAffiliateParams(affiliateUrl: string, retailer: RetailerKey): string {
  const config = AFFILIATE_RETAILERS[retailer];

  try {
    const url = new URL(affiliateUrl);
    url.searchParams.delete(config.affiliateParam);
    return url.toString();
  } catch {
    return affiliateUrl;
  }
}

/**
 * Validate that a URL is a valid product URL for a retailer
 */
export function isValidRetailerUrl(url: string, retailer: RetailerKey): boolean {
  const config = AFFILIATE_RETAILERS[retailer];

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes(new URL(config.baseUrl).hostname);
  } catch {
    return false;
  }
}

/**
 * Get the best affiliate link from a list, prioritized by commission
 */
export function getBestAffiliateLink(
  links: Array<{ retailer: RetailerKey; url: string; priority?: number }>
): { retailer: RetailerKey; url: string } | null {
  if (links.length === 0) return null;

  // Sort by priority (higher first), then by commission (higher first)
  const sorted = [...links].sort((a, b) => {
    const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);
    if (priorityDiff !== 0) return priorityDiff;

    const commissionA = AFFILIATE_RETAILERS[a.retailer].commission;
    const commissionB = AFFILIATE_RETAILERS[b.retailer].commission;
    return commissionB - commissionA;
  });

  return sorted[0];
}
