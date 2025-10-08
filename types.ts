export interface Character {
  name: string;
  description: string;
  visual_prompt: string;
  imageUrl?: string;
  voice?: string;
  base64Image?: string; // To store the base64 string for video generation
}

export interface Scene {
  scene_number: number;
  setting: string;
  action: string;
  dialogue: string;
}

export interface CartoonIdea {
  title: string;
  logline: string;
  characters: Character[];
  scenes?: Scene[];
  music_suggestions?: string[];
  moral?: string;
  userName?: string;
  likes?: number;
}
