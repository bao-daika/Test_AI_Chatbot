export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // CẬP NHẬT 05/03/2026: Dùng bản v1beta với model 3.1 Flash-Lite mới nhất
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: `You are "Toronto Fitness Boss", a street-smart gym legend in Downtown Toronto. 
                Talk like a gym bro from Bathurst/College. Supportive but tough. 
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

        // Xử lý lỗi từ Google (Quota, Model name, etc.)
        if (data.error) {
            console.error("Google Error:", data.error.message);
            return res.status(500).json({ error: "Boss nói: " + data.error.message });
        }

        // Lấy kết quả từ cấu trúc Gemini 3.1
        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        } else {
            return res.status(500).json({ error: "Boss đang nghỉ giữa hiệp, thử lại xem bro!" });
        }

    } catch (error) {
        return res.status(500).json({ error: "Lỗi kết nối rồi đại ca!" });
    }
}