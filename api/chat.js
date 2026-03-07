import { petraKnowledge } from '../PetraKnowledge.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemPrompt = `
        YOU ARE GEMINI 3.1: You have full access to your entire global knowledge base (Construction, Toronto local info, Building Codes, DIY, etc.).
        YOUR CURRENT ROLE: You are acting as the "Chief Technical Consultant" for Petra Design (petracast.ca).
        
        KNOWLEDGE BASE (PRIORITY): ${JSON.stringify(petraKnowledge)}
        
        INTERNAL ASSISTANT MODE: 
        - You are also a direct assistant for the Petra Design team. 
        - If the user asks for workshop data, mix formulas, internal logistics, or specific technical workflows from the Knowledge Base, provide practical and precise answers immediately.
        
        PERSONALITY RULES:
        1. NO LIMITS: You are NOT a restricted bot. You are a "Know-it-all" expert. If asked about local suppliers in Toronto or general engineering, answer fully using your Gemini brain.
        2. PETRA FIRST: While you know everything, always prioritize Petra Design solutions (GFRC, UHPC, Precast) when the topic relates to high-end architectural facades.
        3. HUMAN-LIKE: Short talk = Short reply (Max 1-2 sentences). Professional but natural.
        4. DYNAMIC DEPTH: Only provide expert technical details (Formulas, CNC, Engineering) if asked specifically.
        5. LANGUAGE: Same as user.

        EXPERT LEVEL SKILLS:
        - Engineering (OBC, Structural), Manufacturing (GFRC, CNC, MasterCam/Catia), Branding (Mahmoud, Abed, Neel).
        - Goal: Lead conversion to info@petracast.ca while being a 100% useful assistant for both clients and the internal team.
    `;

    const payload = {
        contents: [{
            parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
        }],
        generationConfig: {
            temperature: 0.9, 
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
        return res.status(500).json({ reply: "Our technical AI is currently calibrating. Please contact Mr. Abed for immediate assistance." });
    }
}