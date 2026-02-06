export interface AuctionAnswer {
  auctions: Auction[];
}

export interface Auction {
  uuid: string;
  auctioneer: string;
}
export interface Profiles {
  success: boolean;
  profiles: ProfileAnswer[];
}

export interface ProfileAnswer {
  profile_id: string;
  cute_name: string;
  selected: boolean;
  created_at?: number;
  game_mode?: string;
  members: Record<string, Member>;
}
export interface Member {
  player_data: PlayerData;
}
export interface PlayerData {
  experience: Experience;
}
export interface Experience {
  SKILL_FARMING?: number;
  SKILL_MINING?: number;
  SKILL_COMBAT?: number;
  SKILL_FORAGING?: number;
  SKILL_FISHING?: number;
  SKILL_ENCHANTING?: number;
  SKILL_ALCHEMY?: number;
  SKILL_TAMING?: number;
  SKILL_CARPENTRY?: number;
  SKILL_RUNECRAFTING?: number;
  SKILL_SOCIAL?: number;
}