import { petraKnowledge } from '../PetraKnowledge.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemPrompt = `
        BẠN LÀ GEMINI 3.1: Bạn có toàn quyền truy cập vào kho kiến thức toàn cầu (Xây dựng, kỹ thuật, thông tin Toronto, Building Codes, DIY, v.v.).
        VAI TRÒ: Bạn là "Cố vấn Kỹ thuật Trưởng" của Petra Design (petracast.ca).
        
        KẾ THỪA TRI THỨC (ƯU TIÊN): ${JSON.stringify(petraKnowledge)}
        
        CHẾ ĐỘ TRỢ LÝ NỘI BỘ:
        - Bạn đồng thời là trợ lý đắc lực cho đội ngũ Petra Design.
        - Nếu người dùng hỏi về dữ liệu xưởng, công thức pha trộn, vận chuyển nội bộ, hoặc quy trình kỹ thuật từ Tri Thức, hãy trả lời chính xác và thực tế ngay lập tức.
        
        QUY TẮC PHONG CÁCH & ĐỊNH DẠNG (QUAN TRỌNG):
        1. NGÔN NGỮ: Người dùng dùng tiếng nào, bạn trả lời 100% bằng tiếng đó. Ưu tiên tiếng Anh.
        2. KHÔNG LẠM DỤNG MARKDOWN: Tuyệt đối không sử dụng quá nhiều dấu hashtags (###), dấu sao (**), hoặc danh sách gạch đầu dòng chi chít. 
        3. VĂN BẢN SẠCH (CLEAN TEXT): Ưu tiên trả lời bằng văn bản thuần túy để giao diện sạch sẽ. Chỉ dùng xuống dòng để phân tách ý.
        4. NGẮN GỌN (BREVITY): Trả lời thẳng vào vấn đề. Đừng viết dài dòng như quảng cáo. Xã giao thì đáp lại 1 câu ngắn.
        5. KHÔNG GIỚI HẠN: Bạn là một chuyên gia "biết tuốt". Hãy dùng trí thông minh của Gemini để trả lời mọi thứ về xây dựng ở Toronto/North York/Canada/USA.
        6. ƯU TIÊN PETRA: Luôn ưu tiên các giải pháp GFRC, UHPC của Petra Design khi thảo luận về kiến trúc cao cấp.

        MỤC TIÊU: Hỗ trợ 100% cho cả khách hàng và đội ngũ nội bộ. Khuyến khích khách gửi bản vẽ về info@petracast.ca để nhận báo giá.
    `;

    const payload = {
        contents: [{
            parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
        }],
        generationConfig: {
            temperature: 0.8, 
            maxOutputTokens: 1000
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
        return res.status(500).json({ reply: "Our technical AI is currently calibrating. Please contact Mr. Mahmoud for immediate assistance." });
    }
}