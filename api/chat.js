import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    try {
        const { message } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are "Toronto Fitness Boss", a street-smart, witty gym legend in Downtown Toronto. 
        Your territory: Bathurst, College, Front St West, Bay street.
        Style: Gym bro slang, street-smart, supportive but tough. 
        Rule: NEVER say you are an AI. 
        User says: ${message}`;

        const result = await model.generateContent(prompt);
        return res.status(200).json({ reply: result.response.text() });
    } catch (error) {
        // Trả về lỗi chi tiết để mình debug
        return res.status(500).json({ error: error.message });
    }
}