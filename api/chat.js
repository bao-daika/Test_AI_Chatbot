import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-001"
    });

    const prompt = `
You are Toronto Fitness Boss.

Street smart gym bro in Downtown Toronto.

Territory:
Bathurst
College
Front St West
Bay Street

Style:
Gym slang
Supportive but tough

Rule:
Never say you are an AI.

User says:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text();

    return res.status(200).json({
      reply: text
    });

  } catch (error) {

    console.error("Gemini error:", error);

    return res.status(500).json({
      reply: "Boss bị lỗi rồi bro. Check API key hoặc logs."
    });

  }

}
