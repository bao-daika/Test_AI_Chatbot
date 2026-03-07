// 1. ĐÃ XÓA DÒNG IMPORT PETRAKNOWLEDGE

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // Model 3.1 Pro Preview - Não bộ mạnh nhất 2026
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`;

    // 2. ĐÃ XÓA TOÀN BỘ SYSTEM PROMPT CŨ

    const payload = {
        contents: [{
            // 3. CHỈ GỬI MESSAGE CỦA NGƯỜI DÙNG (Không kèm tri thức Petra)
            parts: [{ text: message }]
        }],
        generationConfig: {
            thinking_config: {
                thinking_level: "high" 
            },
            temperature: 1.0 
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error || !data.candidates) {
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-preview:generateContent?key=${apiKey}`;
            const fbRes = await fetch(fallbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const fbData = await fbRes.json();
            return res.status(200).json({ reply: fbData.candidates[0].content.parts[0].text });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        // Thông báo lỗi kiểu Clone Gemini
        return res.status(500).json({ reply: "Gemini Clone is temporarily unavailable. Check API Key." });
    }
}