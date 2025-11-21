import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Constants
const CHAT_MODEL = 'gemini-3-pro-preview';
const VIDEO_MODEL = 'veo-3.1-fast-generate-preview';

// Helper to get client - creates new instance to ensure fresh key usage
const getAiClient = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const createChatSession = (): Chat => {
  const ai = getAiClient();
  return ai.chats.create({
    model: CHAT_MODEL,
    config: {
      systemInstruction: "You are PyChat, an expert Python and Full-stack engineer. You write clean, efficient, and type-safe code. You explain complex concepts simply. When asked to generate code, provide the full implementation.",
      thinkingConfig: { thinkingBudget: 4096 } // Enable thinking for smart coding
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  return chat.sendMessageStream({ message });
};

export const generateVideo = async (
  prompt: string, 
  onProgress: (status: string) => void
): Promise<string> => {
  // 1. Check for API Key Selection (Required for Veo)
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      onProgress("Waiting for API Key selection...");
      await window.aistudio.openSelectKey();
      // Assume success after dialog closes/returns, proceed immediately.
    }
  }

  // 2. Initialize Client with fresh key environment
  const ai = getAiClient();
  
  onProgress("Initializing generation...");

  try {
    // 3. Start Generation
    let operation = await ai.models.generateVideos({
      model: VIDEO_MODEL,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    // 4. Poll for completion
    onProgress("Rendering video (this may take a minute)...");
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
      onProgress("Rendering video...");
    }

    // 5. Retrieve Result
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) {
      throw new Error("No video URI returned from operation.");
    }

    // 6. Fetch final video with key appended
    onProgress("Downloading video...");
    const fetchResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    
    if (!fetchResponse.ok) {
       if (fetchResponse.status === 404) {
         // Handle possible race condition or key issue
         throw new Error("Video resource not found. Please try again.");
       }
       throw new Error(`Failed to fetch video: ${fetchResponse.statusText}`);
    }

    const blob = await fetchResponse.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Video generation error:", error);
    // If we get a specific "Requested entity was not found" usually implies key/permissions issues in this context
    if (error.message?.includes("Requested entity was not found") && window.aistudio) {
       // Reset flow suggestion
       throw new Error("Authentication lost. Please retry to re-select API key.");
    }
    throw error;
  }
};