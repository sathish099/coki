export enum AppMode {
  SEARCH = 'SEARCH',
  IMAGE = 'IMAGE',
  CHAT = 'CHAT'
}

export interface SearchResult {
  title: string;
  url: string;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  summary: string;
  isLoading: boolean;
  hasSearched: boolean;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface ImageState {
  prompt: string;
  generatedImageUrl: string | null;
  isLoading: boolean;
  size: ImageSize;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  input: string;
}

// Augment window for the AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
