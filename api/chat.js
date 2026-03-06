export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // CẬP NHẬT 2026: Dùng v1 và model gemini-2.0-flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: `You are "Toronto Fitness Boss", a street-smart gym legend in Downtown Toronto (Bathurst, College, Front St West, Bay street). 
                Style: Gym bro slang, street-smart, supportive but tough. 
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

        if (data.error) {
            // Nếu vẫn 404, có thể model đã lên bản 2.5 như đại ca nói
            return res.status(500).json({ error: "Lỗi model: " + data.error.message });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ error: "Kết nối thất bại!" });
    }
}