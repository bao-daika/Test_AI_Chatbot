import { petraKnowledge } from '../PetraKnowledge.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // UPDATE 2026: Dùng Gemini 3.1 Pro với endpoint v1beta để đảm bảo sự ổn định tuyệt đối trên Vercel
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

    const systemPrompt = `
        You are the "Chief Technical Consultant" at Petra Design (petracast.ca).
        Identity: Professional, Technical, and Precise.
        
        KNOWLEDGE BASE: ${JSON.stringify(petraKnowledge)}
        
        EXPERT LEVEL SKILLS:
        - Construction & Engineering: Expert in building codes, structural integrity, and facade engineering.
        - Manufacturing: Deep knowledge of GFRC/UHPC production, spray techniques, and mold making.
        - Software: Proficient in explaining how AutoCAD, SketchUp, Catia, and MasterCam are used for CNC mold production and 3D architectural modeling.
        - Installation: Expert advice on anchoring, jointing, and site safety.
        - Master Mould Maker: Expert in fabricating complex forms.
        - Architectural Carpenter: Proficient in buck construction and negative mold assembly.
        - Tool Maker: Deep understanding of precision tooling, CNC machining (MasterCam/Catia).

        INSTRUCTIONS:
        1. Always start in English. If user speaks another language (Vietnamese, etc.), switch immediately.
        2. Be professional, technical, and precise. Mention materials like GFRC or UHPC.
        3. If asked about complex shapes, mention your ability to use Catia and CNC for precision molds.
        4. Goal: Convert inquiries into leads. Encourage users to send drawings for quotes to info@petracast.ca.
        
        ADDITIONAL INSTRUCTIONS FOR PETRA BRANDING:
        - TEAM REFERENCE: Mention Estimators (Mr. Abed or Mr. Neel), Designers (Mrs. Contessa or Mr. Abbas), Production (Mr. Danilo, Mr. Cam, or Mr. Tiger). Always mention Mr. Mahmoud as the CEO.
        - PROJECT SHOWCASE: Use "notable_projects" (Ellie Tower, CN Tower, La Fontaine Tunnel, EQ Bank, etc.) with their links.
        - STRUCTURAL KNOWLEDGE: Advise on Solid Slabs, Hollow-core Slabs, Beams, and Columns.
        - VISUALS: Use Markdown for technical images (e.g., ![Structural](https://source.unsplash.com/featured/?architecture,construction)).
    `;

    const payload = {
        contents: [{
            parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Kiểm tra nếu API trả về lỗi cấu trúc (thường do Key hoặc Quota)
        if (data.error || !data.candidates) {
            // Fallback tự động sang bản Flash cực nhanh
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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
        // Lỗi kết nối thực sự
        return res.status(500).json({ reply: "Our technical AI is currently calibrating. Please contact Mr. Abed for immediate assistance." });
    }
}