export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // THAY ĐỔI QUAN TRỌNG: Đổi v1 thành v1beta
    // Tài khoản của đại ca đang nằm trong nhóm bắt buộc dùng beta endpoint.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

        if (data.error) {
            console.error("Google Error:", data.error);
            return res.status(500).json({ error: "Google nói: " + data.error.message });
        }

        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        } else {
            return res.status(500).json({ error: "Boss đang nghỉ giữa hiệp, thử lại nhé!" });
        }

    } catch (error) {
        return res.status(500).json({ error: "Lỗi kết nối: " + error.message });
    }
}