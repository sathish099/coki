import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { ImageSize, SearchResult, ChatMessage } from "../types";

// Helper to get a fresh instance, critical for dynamic API keys
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Search with Grounding using gemini-2.5-flash
 */
export const performSearch = async (query: string): Promise<{ summary: string; links: SearchResult[] }> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text || "No summary available.";
    
    // Extract grounding chunks for links
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links: SearchResult[] = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({
        title: web.title,
        url: web.uri,
      }));

    // Deduplicate links based on URL
    const uniqueLinks = Array.from(new Map(links.map(item => [item.url, item])).values());

    return { summary, links: uniqueLinks };
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
};

/**
 * Generate High-Quality Images using gemini-3-pro-image-preview
 */
export const generateProImage = async (prompt: string, size: ImageSize): Promise<string> => {
  // Ensure we have a user-selected key for this pro feature
  // The UI should handle the prompt, but we check here for safety/re-instantiation
  const ai = getAI(); 
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1", // Default to square, could be parameterized
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

/**
 * Chat Stream using gemini-3-pro-preview
 */
export const streamChat = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, newMessage }),
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      onChunk(decoder.decode(value));
    }
  } catch (error) {
    console.error("Error streaming chat:", error);
    throw error;
  }
};

export const checkApiKey = async (): Promise<boolean> => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        return await window.aistudio.hasSelectedApiKey();
    }
    return true; // Fallback if not in the specific environment requiring selection
};

export const requestApiKey = async (): Promise<void> => {
    if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
    }
};