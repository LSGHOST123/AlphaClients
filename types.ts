export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SearchState {
  isLoading: boolean;
  data: string | null;
  groundingChunks: any[] | null;
  error: string | null;
}

export interface FormattedClient {
  name: string;
  phone: string;
  link: string;
  infos: string;
  rawLine: string;
}