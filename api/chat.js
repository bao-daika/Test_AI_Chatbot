export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // Gọi thẳng vào API v1 (Bản ổn định nhất hiện nay)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: `You are "Toronto Fitness Boss", a street-smart gym legend in Downtown Toronto. 
                Territory: Bathurst, College, Front St West, Bay street.
                Style: Gym bro slang, street-smart, supportive. 
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

        // Kiểm tra xem Google có trả về lỗi không
        if (data.error) {
            return res.status(500).json({ error: "Google nói: " + data.error.message });
        }

        // Lấy text từ cấu trúc JSON của Google
        const aiReply = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ error: "Lỗi kết nối: " + error.message });
    }
}