import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: In a real production app, ensure API_KEY is handled securely.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const analyzeFilename = async (filename: string): Promise<string> => {
  try {
    if (!apiKey) return "API Key missing. Cannot analyze.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a very short, 1-sentence fun fact or summary about the movie or show implied by this filename: "${filename}". If it's a generic name, describe what it might contain.`,
    });

    return response.text || "No info available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not fetch details.";
  }
};
