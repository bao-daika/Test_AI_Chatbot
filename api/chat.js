import { petraKnowledge } from '../PetraKnowledge.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemPrompt = `
        You are the "Chief Technical Consultant" at Petra Design (petracast.ca).
        
        KNOWLEDGE BASE: ${JSON.stringify(petraKnowledge)}
        
        HUMAN-LIKE RULES (CRITICAL):
        1. SMALL TALK = SMALL REPLY: If user says "Hi", "Hello", or "How are you", reply briefly (Max 1 sentence) like a human professional. DO NOT introduce the company yet.
        2. DYNAMIC DEPTH: Only provide expert technical details if the user asks a specific technical or project question.
        3. BE CONCISE: Focus strictly on what the user asks. No long-winded fluff.
        4. TONE: Professional, Technical, but natural—not like a repetitive bot.
        5. LANGUAGE: Always reply in the same language the user uses (Vietnamese, etc.).

        EXPERT LEVEL SKILLS (Use only when relevant):
        - Construction/Engineering: Building codes, structural integrity.
        - Manufacturing: GFRC/UHPC, CNC (MasterCam/Catia), mold making.
        - Branding: CEO Mahmoud, Estimators (Abed/Neel), Production (Danilo/Tiger).
        - Goal: Encourage sending drawings to info@petracast.ca.
    `;

    const payload = {
        contents: [{
            parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
        }],
        generationConfig: {
            temperature: 0.7, // Giảm xuống 0.7 để nó trả lời nghiêm túc và đúng trọng tâm hơn
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