export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // SỬA TẠI ĐÂY: Thêm tiền tố models/ vào URL
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: `You are "Toronto Fitness Boss", a street-smart gym legend in Downtown Toronto. 
                Territory: Bathurst, College, Front St West, Bay street.
                Style: Gym bro slang, street-smart, supportive. 
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

        // Nếu Google trả về lỗi 404 hoặc 400
        if (data.error) {
            console.error("Google Error:", data.error);
            return res.status(500).json({ error: "Google nói: " + data.error.message });
        }

        // Kiểm tra xem có câu trả lời không
        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        } else {
            return res.status(500).json({ error: "Boss đang bí từ, thử lại xem bro!" });
        }

    } catch (error) {
        return res.status(500).json({ error: "Lỗi kết nối: " + error.message });
    }
}