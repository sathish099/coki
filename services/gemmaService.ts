import { ChatMessage } from "../types";

/**
 * Mocks a streaming chat response from the Gemma model.
 * In a real implementation, this would call the Gemma API.
 */
export const streamChat = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<void> => {
  console.log("Using Gemma model (mocked)");
  const mockResponse = `This is a mocked response from the Gemma model. You said: "${newMessage}"`;

  // Simulate a streaming response
  const chunks = mockResponse.split(" ");
  for (let i = 0; i < chunks.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
    onChunk(chunks[i] + (i === chunks.length - 1 ? "" : " "));
  }
};