/**
 * Conflict resolution for multi-source data
 * When multiple data sources provide different values for the same entity,
 * this module determines which value to use based on source priority and recency.
 */

/**
 * Priority levels for data sources
 * Higher number = more authoritative
 */
export const SOURCE_PRIORITY: Record<string, number> = {
  manual: 200, // Admin override - always wins
  ppa: 100, // Official PPA Tour API - highest priority
  apt: 80, // AllPickleballTournaments API - paid, reliable
  theslice: 60, // The Slice - community-maintained paddle database
  novolleys: 40, // NoVolleys - fan-sourced equipment tracker
  seed: 20, // Seed/demo data - lowest priority
};

/**
 * A record from a data source with metadata
 */
export interface SourcedRecord<T> {
  source: string;
  data: T;
  timestamp: Date;
}

/**
 * Resolve conflicts between multiple records from different sources
 * Priority order:
 * 1. Source priority (higher wins)
 * 2. Recency (more recent wins when same priority)
 *
 * @param records - Array of records from different sources
 * @returns The winning record's data
 */
export function resolveConflict<T>(records: SourcedRecord<T>[]): T | null {
  if (records.length === 0) return null;
  if (records.length === 1) return records[0].data;

  const sorted = [...records].sort((a, b) => {
    const priorityA = SOURCE_PRIORITY[a.source] ?? 0;
    const priorityB = SOURCE_PRIORITY[b.source] ?? 0;
    const priorityDiff = priorityB - priorityA;

    if (priorityDiff !== 0) return priorityDiff;

    // Same priority - use more recent
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return sorted[0].data;
}

/**
 * Merge records from multiple sources, using conflict resolution for overlapping fields
 * Useful when different sources provide different subsets of data
 *
 * @param records - Array of partial records from different sources
 * @returns Merged record with best values from each source
 */
export function mergeRecords<T extends Record<string, unknown>>(
  records: SourcedRecord<Partial<T>>[]
): Partial<T> {
  if (records.length === 0) return {};
  if (records.length === 1) return records[0].data;

  // Group records by field
  const fieldRecords: Record<string, SourcedRecord<unknown>[]> = {};

  for (const record of records) {
    for (const [key, value] of Object.entries(record.data)) {
      if (value !== undefined && value !== null) {
        if (!fieldRecords[key]) {
          fieldRecords[key] = [];
        }
        fieldRecords[key].push({
          source: record.source,
          data: value,
          timestamp: record.timestamp,
        });
      }
    }
  }

  // Resolve each field individually
  const result: Partial<T> = {};
  for (const [key, values] of Object.entries(fieldRecords)) {
    const resolved = resolveConflict(values);
    if (resolved !== null) {
      (result as Record<string, unknown>)[key] = resolved;
    }
  }

  return result;
}

/**
 * Get the source priority for a given source name
 * Returns 0 for unknown sources
 */
export function getSourcePriority(source: string): number {
  return SOURCE_PRIORITY[source] ?? 0;
}

/**
 * Check if a source should override another
 */
export function shouldOverride(newSource: string, existingSource: string): boolean {
  return getSourcePriority(newSource) >= getSourcePriority(existingSource);
}
