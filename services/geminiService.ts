import { GoogleGenAI, Type } from "@google/genai";
import { AiResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-3-flash-preview";

export const generateKnowledgeGraph = async (topic: string, existingNodes: string[] = []): Promise<AiResponse> => {
  const systemInstruction = `
    Bạn là một chuyên gia về bản đồ tư duy và kiến thức cho ứng dụng "Feynman Hub".
    Mục tiêu của bạn là phân tích các chủ đề phức tạp thành một mạng lưới các khái niệm liên kết (Knowledge Graph).
    
    QUAN TRỌNG: Tất cả nội dung trả về (nhãn, mô tả, quan hệ) phải bằng TIẾNG VIỆT.
    
    1. Xác định khái niệm trung tâm.
    2. Xác định 5-10 khái niệm phụ hoặc thực thể liên quan.
    3. Định nghĩa mối quan hệ giữa chúng.
    4. Cung cấp mô tả ngắn gọn cho các node (khái niệm).
    5. 'type' (loại) phải là một trong các giá trị: 'root' (gốc), 'concept' (khái niệm), 'person' (nhân vật), 'tool' (công cụ), 'history' (lịch sử).
    
    Đảm bảo ID của node là duy nhất và dạng slug (ví dụ: 'vat-ly-luong-tu').
  `;

  const prompt = `Tạo một bản đồ kiến thức cho chủ đề: "${topic}".
  Tập trung vào cấu trúc và sự liên kết.
  Bối cảnh hiện có (đừng tạo trùng lặp chính xác các ID này, nhưng có thể liên kết tới chúng): ${existingNodes.slice(0, 50).join(', ')}`;

  return await callGemini(systemInstruction, prompt);
};

export const expandConcept = async (concept: string, contextNodes: string[] = []): Promise<AiResponse> => {
    const systemInstruction = `
      Bạn là trợ lý mở rộng kiến thức. Người dùng muốn đào sâu vào khái niệm: "${concept}".
      Hãy tạo ra 3-5 node con chi tiết hơn liên quan trực tiếp đến "${concept}".
      Nội dung phải bằng TIẾNG VIỆT.
      Node gốc của lần tạo này chính là "${concept}" (nhưng không cần trả về node này trong danh sách nodes, chỉ trả về các node con mới).
      Tạo links kết nối từ "${concept}" đến các node mới.
    `;

    const prompt = `Hãy phân tích sâu hơn về "${concept}". Bối cảnh hiện tại: ${contextNodes.join(', ')}`;

    return await callGemini(systemInstruction, prompt);
}

// Helper function to keep code DRY
async function callGemini(systemInstruction: string, prompt: string): Promise<AiResponse> {
    try {
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "Unique slug id" },
                      label: { type: Type.STRING, description: "Tên hiển thị (Tiếng Việt)" },
                      type: { type: Type.STRING, description: "Loại node: 'concept', 'detail', 'example'" },
                      description: { type: Type.STRING, description: "Giải thích ngắn gọn (Tiếng Việt)" },
                    },
                    required: ["id", "label", "type", "description"]
                  }
                },
                links: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      source: { type: Type.STRING, description: "ID node nguồn" },
                      target: { type: Type.STRING, description: "ID node đích" },
                      relation: { type: Type.STRING, description: "Quan hệ" },
                    },
                    required: ["source", "target"]
                  }
                }
              },
              required: ["nodes", "links"]
            }
          }
        });
    
        const jsonText = response.text || "{}";
        return JSON.parse(jsonText) as AiResponse;
    
      } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Lỗi kết nối AI.");
      }
}
