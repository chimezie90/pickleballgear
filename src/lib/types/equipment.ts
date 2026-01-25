export interface PaddleSpecs {
  weight: number;
  gripSize: number;
  length: number;
  width: number;
  coreMaterial: "polymer" | "nomex" | "aluminum";
  surfaceMaterial: "carbon" | "fiberglass" | "graphite" | "composite";
  coreThickness: number;
  swingWeight?: number;
}

export interface ShoeSpecs {
  weight: number;
  dropHeight: number;
  courtType: "indoor" | "outdoor" | "both";
}

export type EquipmentSpecs = PaddleSpecs | ShoeSpecs;

export interface EquipmentWithStats {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: "PADDLE" | "SHOE";
  imageUrl: string | null;
  totalWins: number;
  totalPoints: number;
  activeProCount: number;
}

export interface PlayerWithEquipment {
  id: string;
  name: string;
  slug: string;
  ranking: number | null;
  country: string | null;
  imageUrl: string | null;
  currentPaddle: {
    id: string;
    name: string;
    slug: string;
    brand: string;
  } | null;
  currentShoes: {
    id: string;
    name: string;
    slug: string;
    brand: string;
  } | null;
  totalPoints: number;
  totalWins: number;
}
