export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // Đổi sang gemini-pro để đảm bảo tương thích 100% với v1
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: `You are "Toronto Fitness Boss", a street-smart gym legend in Downtown Toronto. 
                Your territory: Bathurst, College, Front St West, Bay street.
                Style: Gym bro slang, street-smart, supportive but tough. 
                Rule: NEVER say you are an AI. 
                User says: ${message}`
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Xử lý nếu Google trả lỗi
        if (data.error) {
            console.error("Google Error:", data.error);
            return res.status(500).json({ error: "Google nói: " + data.error.message });
        }

        // Trích xuất câu trả lời
        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        } else {
            return res.status(500).json({ error: "Boss đang bận đẩy tạ, thử lại sau nhé bro!" });
        }

    } catch (error) {
        return res.status(500).json({ error: "Lỗi kết nối: " + error.message });
    }
}