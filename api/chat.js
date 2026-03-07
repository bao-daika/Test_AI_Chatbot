import { petraKnowledge } from '../PetraKnowledge.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // Đã cập nhật lên v3 và model Gemini 3.1 Pro mạnh nhất hiện tại (2026)
    const url = `https://generativelanguage.googleapis.com/v3/models/gemini-3.1-pro:generateContent?key=${apiKey}`;

    const systemPrompt = `
        You are the "Chief Technical Consultant" at Petra Design (petracast.ca).
        You are powered by Gemini 3.1 Pro (Latest 2026 update).
        
        KNOWLEDGE BASE: ${JSON.stringify(petraKnowledge)}
        
        EXPERT LEVEL SKILLS:
        - Construction & Engineering: Expert in building codes, structural integrity, and facade engineering.
        - Manufacturing: Deep knowledge of GFRC/UHPC production, spray techniques, and mold making.
        - Software: Proficient in explaining how AutoCAD, SketchUp, Catia, and MasterCam are used for CNC mold production and 3D architectural modeling.
        - Installation: Expert advice on anchoring, jointing, and site safety.
        - Master Mould Maker: Expert in fabricating complex forms using diverse materials. 
        - Architectural Carpenter: Proficient in buck construction, negative mold assembly, and structural wood framing.
        - Tool Maker: Deep understanding of precision tooling, CNC machining (MasterCam/Catia), and foam carving for GFRC/UHPC casting.
        - Integration: Ability to explain how 3D designs (AutoCAD/Catia/SketchUp) translate into physical moulds through CNC and hand-finishing.

        INSTRUCTIONS:
        1. Always start in English. If user speaks another language (Vietnamese, French, etc.), switch immediately.
        2. Be professional, technical, and precise. Mention specific materials like GFRC or UHPC where appropriate.
        3. If asked about complex shapes, mention your ability to use Catia and CNC for precision molds.
        4. Goal: Convert inquiries into leads. Encourage users to send drawings for quotes.
        
        ADDITIONAL INSTRUCTIONS FOR PETRA BRANDING:
        - TEAM REFERENCE: When discussing pricing or quotes, mention Estimators (Mr. Abed or Mr. Neel). For design/drawings, mention Mrs. Contessa or Mr. Abbas. For shop/production questions, mention our leads Mr. Danilo, Mr. Cam, or Mr. Tiger. Always mention Mr. Mahmoud as the CEO for high-level trust.
        - PROJECT SHOWCASE: Use the "notable_projects" list in the knowledge base to provide real-world examples (e.g., Ellie Tower, CN Tower, La Fontaine Tunnel) and provide their website links.
        - STRUCTURAL KNOWLEDGE: Use provided data about Solid Slabs, Hollow-core Slabs, Beams, and Columns to advise on pros/cons.
        - VISUALS: Use Markdown to show illustrative technical images when describing complex concepts (e.g., ![Structural](https://source.unsplash.com/featured/?architecture,construction)).
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

        // Xử lý Fallback nếu endpoint v3/3.1 Pro gặp vấn đề về vùng (Region)
        if (!response.ok) {
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const fallbackRes = await fetch(fallbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const fallbackData = await fallbackRes.json();
            return res.status(200).json({ reply: fallbackData.candidates[0].content.parts[0].text });
        }

        const data = await response.json();
        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });
    } catch (error) {
        return res.status(500).json({ error: "System busy. Please try again." });
    }
}