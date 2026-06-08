export interface FeedbackRequest {
  message: string;
  email?: string;
}

export interface FeedbackResponse {
  id: string;
  createdAt: string;
}

export interface Match {
  id: string;
  team1: string;
  team2: string;
  time: string;
  event: string;
  format: string;
  // Extended fields for HLTV-style display
  status?: "live" | "upcoming" | "finished";
  score1?: number;
  score2?: number;
  mapScore?: string;
  tournament?: string;
  region?: string;
  tag?: string;
  odds1?: number;
  odds2?: number;
  starred?: boolean;
}
