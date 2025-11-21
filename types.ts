
export interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  id: string;
  timestamp: number;
  isThinking?: boolean;
  groundingSources?: { title: string; uri: string }[];
}

export enum ViewMode {
  CHAT = 'CHAT',
  VIDEO = 'VIDEO',
}

export interface VideoGenerationState {
  isGenerating: boolean;
  progress: string; // Description of current step
  videoUrl: string | null;
  error: string | null;
}
