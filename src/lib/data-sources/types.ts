import type { TournamentTier } from "@prisma/client";

/**
 * Data returned from external tournament sources
 */
export interface TournamentData {
  externalId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  tier: TournamentTier;
}

/**
 * Match result data from external sources
 */
export interface MatchResultData {
  externalTournamentId: string;
  externalPlayerId: string;
  playerName: string;
  placement: number;
  points: number;
  matchDate: Date;
  eventType?: string;
}

/**
 * Equipment usage data from external sources (e.g., paddle trackers)
 */
export interface EquipmentUsageData {
  playerName: string;
  paddleBrand?: string;
  paddleModel?: string;
  shoeBrand?: string;
  shoeModel?: string;
  source: string;
  verifiedAt?: Date;
}

/**
 * Unified adapter interface for all data sources
 */
export interface DataSourceAdapter {
  /**
   * Fetch tournaments from the data source
   * @param since - Only fetch tournaments updated after this date
   */
  fetchTournaments(since?: Date): Promise<TournamentData[]>;

  /**
   * Fetch match results for a specific tournament
   * @param tournamentId - External tournament ID from this source
   */
  fetchResults(tournamentId: string): Promise<MatchResultData[]>;

  /**
   * Fetch equipment usage for a player
   * @param playerId - External player ID or name
   */
  fetchPlayerEquipment(playerId: string): Promise<EquipmentUsageData[]>;

  /**
   * Get the name of this data source
   */
  getSourceName(): string;

  /**
   * Get the priority of this data source (higher = more authoritative)
   */
  getSourcePriority(): number;
}

/**
 * Base class for data source adapters with common functionality
 */
export abstract class BaseDataSourceAdapter implements DataSourceAdapter {
  abstract fetchTournaments(since?: Date): Promise<TournamentData[]>;
  abstract fetchResults(tournamentId: string): Promise<MatchResultData[]>;
  abstract fetchPlayerEquipment(playerId: string): Promise<EquipmentUsageData[]>;
  abstract getSourceName(): string;
  abstract getSourcePriority(): number;

  /**
   * Helper to handle API errors consistently
   */
  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`[${this.getSourceName()}] ${context}: ${message}`);
  }

  /**
   * Helper for rate-limited fetching
   */
  protected async fetchWithRetry(
    url: string,
    options?: RequestInit,
    maxRetries = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get("Retry-After");
          const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }
}
