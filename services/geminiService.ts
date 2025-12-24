import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Candidate } from "../types";

export const generateCandidateEmail = async (candidate: Candidate, type: 'interview' | 'rejection' | 'offer') => {
  try {
    if (!process.env.API_KEY) {
      console.warn("Missing API_KEY environment variable");
      return "Error: API Key is missing. Cannot generate email.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let prompt = "";
    switch (type) {
      case 'interview':
        prompt = `Draft a professional interview invitation email in Vietnamese for candidate ${candidate.name} applied for ${candidate.position}. Keep it polite and concise.`;
        break;
      case 'rejection':
        prompt = `Draft a polite rejection email in Vietnamese for candidate ${candidate.name} applied for ${candidate.position}. Encourage them for future opportunities.`;
        break;
      case 'offer':
        prompt = `Draft a job offer email in Vietnamese for candidate ${candidate.name} for the position of ${candidate.position}. Express excitement.`;
        break;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lỗi khi tạo email tự động. Vui lòng thử lại sau.";
  }
};

export const getChatResponse = async (message: string) => {
  try {
    if (!process.env.API_KEY) {
      return "Xin lỗi, tôi chưa được cấu hình API Key.";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: "Bạn là một trợ lý nhân sự ảo hữu ích trong hệ thống CoffeeHR. Hãy trả lời ngắn gọn, lịch sự và chuyên nghiệp bằng tiếng Việt.",
      }
    });

    return response.text || "Tôi không hiểu ý bạn.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Hệ thống đang bận, vui lòng thử lại sau.";
  }
};