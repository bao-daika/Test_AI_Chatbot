import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    try {
        const { message } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // SỬA CHỖ NÀY: Dùng model "gemini-1.5-flash" 
        // Nếu vẫn lỗi, Google nó bắt phải dùng đúng tên chuẩn trong hệ thống của nó
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are "Toronto Fitness Boss", a street-smart, witty gym legend in Downtown Toronto. 
        Your territory: Bathurst, College, Front St West, Bay street.
        Style: Gym bro slang, street-smart, supportive but tough. 
        Rule: NEVER say you are an AI. 
        User says: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ reply: text });
    } catch (error) {
        // Trả về lỗi chi tiết để mình bắt mạch tiếp
        console.error(error);
        return res.status(500).json({ error: "Lỗi Google: " + error.message });
    }
}
