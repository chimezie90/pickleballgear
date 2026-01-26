import type { AffiliateLink } from "@prisma/client";
import { AFFILIATE_RETAILERS, type RetailerKey } from "@/lib/affiliates/retailers";

interface PurchaseButtonProps {
  affiliateLinks: AffiliateLink[];
  equipmentName: string;
  showAllRetailers?: boolean;
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PurchaseButton({
  affiliateLinks,
  equipmentName,
  showAllRetailers = false,
}: PurchaseButtonProps) {
  const activeLinks = affiliateLinks
    .filter((link) => link.isActive)
    .sort((a, b) => b.priority - a.priority);

  if (activeLinks.length === 0) {
    return null;
  }

  const primaryLink = activeLinks[0];
  const otherLinks = activeLinks.slice(1);

  return (
    <div className="space-y-3">
      {/* Primary purchase button */}
      <a
        href={primaryLink.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        Buy {equipmentName}
        <ExternalLinkIcon className="ml-2 h-4 w-4" />
      </a>

      {/* Other retailers */}
      {showAllRetailers && otherLinks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted text-center">Also available at:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {otherLinks.map((link) => {
              const retailerConfig = AFFILIATE_RETAILERS[link.retailer as RetailerKey];
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-muted/10 text-foreground rounded-md hover:bg-muted/20 transition-colors"
                >
                  {retailerConfig?.name || link.retailer}
                  <ExternalLinkIcon className="ml-1.5 h-3 w-3" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* FTC-compliant disclosure */}
      <p className="text-xs text-muted text-center">
        Affiliate link - we may earn a commission at no extra cost to you
      </p>
    </div>
  );
}

/**
 * Compact version for use in cards/lists
 */
export function PurchaseButtonCompact({
  affiliateLinks,
}: {
  affiliateLinks: AffiliateLink[];
}) {
  const primaryLink = affiliateLinks
    .filter((link) => link.isActive)
    .sort((a, b) => b.priority - a.priority)[0];

  if (!primaryLink) {
    return null;
  }

  return (
    <a
      href={primaryLink.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="inline-flex items-center px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      Buy
      <ExternalLinkIcon className="ml-1.5 h-3 w-3" />
    </a>
  );
}
