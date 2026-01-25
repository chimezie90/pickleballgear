import { z } from "zod";

export const playerSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  ranking: z.number().int().positive().nullable(),
  country: z.string().max(100).nullable(),
  imageUrl: z.string().url().nullable(),
});

export const equipmentSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  brand: z.string().min(1).max(100),
  type: z.enum(["PADDLE", "SHOE"]),
  imageUrl: z.string().url().nullable(),
  description: z.string().max(2000).nullable(),
  specs: z.record(z.string(), z.unknown()).nullable(),
});

export const tournamentSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  tier: z.enum(["MAJOR", "PPA", "MLP", "APP", "OTHER"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string().max(200).nullable(),
});

export const matchResultSchema = z.object({
  playerId: z.string().cuid(),
  tournamentId: z.string().cuid(),
  placement: z.number().int().positive(),
  points: z.number().int().nonnegative(),
  matchDate: z.coerce.date(),
  eventType: z.string().max(100).nullable(),
});

export const equipmentUsageSchema = z.object({
  playerId: z.string().cuid(),
  equipmentId: z.string().cuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  verified: z.boolean().default(false),
  source: z.string().max(500).nullable(),
});

export type PlayerInput = z.infer<typeof playerSchema>;
export type EquipmentInput = z.infer<typeof equipmentSchema>;
export type TournamentInput = z.infer<typeof tournamentSchema>;
export type MatchResultInput = z.infer<typeof matchResultSchema>;
export type EquipmentUsageInput = z.infer<typeof equipmentUsageSchema>;
