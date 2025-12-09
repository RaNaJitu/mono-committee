export interface PlaceBetRequest {
  stake: number;
  runnerId: number;
  marketId: string;
  sportId: string;
  tournamentId: string;
  odds: number;
  isBack: boolean;
  matchId: string;
  keepAlive: boolean;
  acceptAnyOdds: boolean;
  marketType: string; 
  marketName? : string,
  score?: any,
  runnerName?: string
  cashout?: boolean,
  level?: number,
}

export interface PlaceBetRequestHorseRunner { 
  stake: number;
  runnerId: number;
  marketId: string;
  sportId: string;
  tournamentId: string;
  isBack: boolean;
  matchId: string; 
  keepAlive: boolean;
  acceptAnyOdds: boolean;
  marketType?: string; 
  marketName?: string,
  score?: any,
  runnerName?: string
  cashout?: boolean 
  runnerIds?: number[];  
}

export interface Bet {
  runnerId: number;
  type: string;
  stake: number;
  odds: number | null;
}

export interface NetProfitLoss {
  runnerId: number;
  netProfitLoss: number;
  totalStake: number;
}

export type BetType = "back" | "lay";
  
export interface iBet {
  runnerId: number;  // Changed from string to number
  type: 'Back' | 'Lay';
  rate: number;
  betAmount: number;
  betStatus?: "MATCHED" | "UNMATCHED";
}

export interface iBetFancy {
  runnerId: number;
  type: "Lay" | "Back";
  run: number;
  rate: number;
  betAmount: number; 
  betStatus?: "MATCHED" | "UNMATCHED";
}

export interface currency {
  id: number;
  currency: string;
  rate: number;
  sport: number;
  matchOdds: number;
  fancy: number;
  line: number;
  bookmaker: number;
  horseRacing: number;
  greyhoundRacing: number;
  isDefault: boolean;
}
