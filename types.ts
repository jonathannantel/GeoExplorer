// Used to represent the structure of grounding chunks if using Google Search
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Other types of grounding chunks could be defined here
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata fields
}

export interface Coordinates {
  lat: number;
  lng: number;
}
