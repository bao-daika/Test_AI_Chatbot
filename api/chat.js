import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    try {
        const { message } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // SỬA TÊN MODEL TẠI ĐÂY: Bỏ cái "-001" đi, chỉ để "gemini-1.5-flash"
        // Đây là tên "quốc dân" mà bản v1 hay v1beta đều phải nhận.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are "Toronto Fitness Boss", a street-smart gym legend in Downtown Toronto. 
        Style: Gym bro slang, street-smart, supportive. 
        User says: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return res.status(200).json({ reply: response.text() });
    } catch (error) {
        console.error("Lỗi Log:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
