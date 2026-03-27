import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
你是一位资深的二手手机评估专家，负责通过对话引导用户完成手机状况描述并给出合理报价。

# Workflow
1. 意图确认：确认用户是否有卖机意图。
2. 槽位填充 (Slot Filling)：
   - 必须按顺序询问：型号 -> 存储 -> 屏幕情况 -> 维修史 -> 账号锁。
   - 如果用户一次性提供多个信息，自动跳过对应步骤。
3. 报价调用：当关键参数收齐后，调用 calculate_price 工具。
4. 结论建议：输出报价单，并告知用户价格有效期（如24小时）。

# Guidelines
- 语言风格：专业、高效、亲切。
- 严禁承诺：明确告知用户最终价格以实机检测为准。
- 异常处理：若用户描述不清晰（如“挺新的”），应追问“是否有肉眼可见的细微划痕？”。

# 报价逻辑 (Mock)
- 基础价：iPhone 15 (5000), iPhone 14 (4000), iPhone 13 (3000)
- 存储加成：256G (+500), 512G (+1000)
- 屏幕扣减：碎屏 (-1000), 划痕 (-300)
- 维修扣减：换过件 (-800)
- 账号锁：有锁 (无法报价)
`;

export const calculatePrice = (params: {
  model: string;
  storage: string;
  screen: string;
  repair: string;
  lock: string;
}) => {
  let price = 0;
  const model = params.model.toLowerCase();
  
  if (model.includes("15")) price = 5000;
  else if (model.includes("14")) price = 4000;
  else if (model.includes("13")) price = 3000;
  else price = 2000;

  if (params.storage.includes("256")) price += 500;
  if (params.storage.includes("512")) price += 1000;

  if (params.screen.includes("碎") || params.screen.includes("坏")) price -= 1000;
  else if (params.screen.includes("划痕")) price -= 300;

  if (params.repair.includes("有") || params.repair.includes("换过")) price -= 800;

  if (params.lock.includes("有") || params.lock.includes("锁")) return null;

  return price;
};

export const chatWithExpert = async (messages: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey || "" });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [
          {
            functionDeclarations: [
              {
                name: "calculate_price",
                description: "根据手机参数计算预估报价",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    model: { type: Type.STRING, description: "手机型号" },
                    storage: { type: Type.STRING, description: "存储容量" },
                    screen: { type: Type.STRING, description: "屏幕情况" },
                    repair: { type: Type.STRING, description: "维修史" },
                    lock: { type: Type.STRING, description: "账号锁情况" },
                  },
                  required: ["model", "storage", "screen", "repair", "lock"],
                },
              },
            ],
          },
        ],
      },
    });

    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
