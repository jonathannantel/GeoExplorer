
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';

// WARNING: TEMPORARY SOLUTION FOR GITHUB PAGES.
// This will expose your API key in the client-side code.
// Only use this for very limited, trusted sharing.
// Consider removing it or using a more secure method (like a backend proxy) for wider sharing.
// Replace "YOUR_ACTUAL_GEMINI_API_KEY" with your real key.
const HARDCODED_API_KEY = "YOUR_ACTUAL_GEMINI_API_KEY"; // <<< IMPORTANT: REPLACE THIS!!!

if (!HARDCODED_API_KEY || HARDCODED_API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY") {
  console.warn("Gemini API key is not set or is still the placeholder in services/geminiService.ts. Gemini API calls will fail.");
  // You might want to throw an error or display a message to the user more prominently
}

const ai = new GoogleGenAI({ apiKey: HARDCODED_API_KEY });

export const fetchLocationDetails = async (latitude: number, longitude: number): Promise<string> => {
  if (!HARDCODED_API_KEY || HARDCODED_API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY") {
    throw new Error("Gemini API key is not configured. Please update services/geminiService.ts.");
  }

  const prompt = `Tell me about the location at latitude ${latitude} and longitude ${longitude}. Provide a concise and engaging summary of 4 to 5 sentences covering its history or most interesting facts. If it's an ocean or indistinct area, say so. Focus on unique aspects or significant historical events if applicable. Format the output as plain text sentences.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("Received an empty response from Gemini API.");
    }
    return text;

  } catch (error) {
    console.error("Error fetching location details from Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID") || error.message.includes("API key is not valid")) {
            throw new Error("Invalid or missing Gemini API key. Please check your configuration in services/geminiService.ts.");
        }
        if (error.message.includes("quota")) {
            throw new Error("Gemini API quota exceeded. Please check your usage or billing.");
        }
    }
    throw new Error(`Could not retrieve information for the selected location. ${error instanceof Error ? error.message : 'Unknown API error'}`);
  }
};
