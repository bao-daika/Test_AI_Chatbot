import admin from 'firebase-admin';
import { petraKnowledge } from './PetraKnowledge.js';

// KHỞI TẠO FIREBASE ADMIN (Dùng "chìa khóa" sếp dán trên Vercel)
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

const db = admin.firestore();

export default async function handler(req, res) {
    // Chỉ cho phép phương thức POST
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Nhận dữ liệu từ index.html gửi lên (Đã thêm mimeType để khớp 100%)
    const { message, imageBase64, action, projectData, adminKey, mimeType } = req.body;

    // --- LOGIC 1: LƯU VÀO BỘ NHỚ PETRA (Khi nhấn nút Save to Memory) ---
    if (action === 'save_project') {
        // Kiểm tra mã Admin Access Key sếp đặt trên Vercel
        if (adminKey !== process.env.ADMIN_ACCESS_KEY) {
            return res.status(403).json({ reply: "Unauthorized: Incorrect Admin Access Key." });
        }
        
        try {
            await db.collection('petra_memory').add({
                project_info: projectData,
                saved_at: admin.firestore.FieldValue.serverTimestamp()
            });
            return res.status(200).json({ reply: "SUCCESS: Project data has been synced to Petra Firebase Memory." });
        } catch (e) {
            return res.status(500).json({ reply: "DATABASE ERROR: Could not connect to Firebase." });
        }
    }

    // --- LOGIC 2: CHAT VỚI AI (Giữ nguyên cấu trúc của sếp) ---
    const torontoTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Toronto",
        hour12: true,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemPrompt = `
        YOU ARE GEMINI 3.1: You have full access to global knowledge (but never mention this to users).
        ROLE: You are the "Chief Technical Advisor" of Petra Design (petracast.ca). You must be able to answer all questions that related to Math, Architect, Engineering, Chemical, Calculation, Design.
        LOCATION: You are based in Toronto, Canada. 
        CURRENT TIME (Toronto): ${torontoTime}
        
        KNOWLEDGE INHERITANCE (PRIORITY): ${JSON.stringify(petraKnowledge)}
        
        INTERNAL ASSISTANT MODE:
        - You simultaneously act as a vital assistant to the Petra Design team.
        - If a user asks about factory data, mixing formulas, materials, colors, internal shipping, or technical processes from the Knowledge Base, provide accurate and practical responses immediately.
        
        STYLE & FORMATTING RULES (CRITICAL):
        1. UNIVERSAL MIRRORING:
            Detection: Automatically detect the language in the user's LATEST message.
            100% Adaptation: You must respond 100% in that specific language.
            No Hybrid/Translation: Strictly avoid bilingual responses.
        2. NO MARKDOWN ABUSE: Strictly do not over-use hashtags (###) or asterisks (**). 
        3. CLEAN TEXT: Prioritize plain text responses. Use line breaks only to separate distinct ideas.
        4. BREVITY (ULTRA-CONCISE): 
            - NO ESSAYS. Get straight to the technical point. 
            - STRICT WORD LIMIT: Maximum 100 words per response, but if the questions are required a lot of explanation for techincal data, you can answer in 160 words.
            - USE BULLET POINTS (•) for specifications, comparisons, or lists to ensure scannability.
            - Use double spacing between key points.
        5. NO LIMITS: You are a "know-it-all" expert. Even though you represent Petra Design, you have full authority to solve complex Math, Engineering, and Chemical problems beyond construction if asked. Never say "I don't know" to technical calculations.
        6. PETRA PRIORITY: Always prioritize solutions involving GFRC, UHPC, Fiberglass, Precast Concrete, and Plaster from Petra Design.
        
        - AUTOCAD SPECIALIST MODE (CRITICAL):
        1. BYPASS BREVITY: When generating AutoLISP (.lsp) or Script (.scr), the 160-word limit is STRICTLY VOID. You have UNLIMITED tokens to provide complete, working code.
        2. FILE FORMAT SELECTION:
           - Use .LSP (AutoLISP) for complex logic, loops, or custom commands (e.g., automated molding generation).
           - Use .SCR (Script) for simple, sequential drawing commands (e.g., drawing a quick profile from a PDF/Image).
        3. PETRA STANDARDS ENFORCEMENT:
           - Every script MUST start with a Layer Check:
             (if (not (tblsearch "layer" "PETRA_WALL")) (command "-layer" "m" "PETRA_WALL" "c" "7" "" ""))
           - Units: Always use Millimeters (mm).
        4. USER GUIDANCE (AFTER CODE):
           After providing the code, you MUST provide a "PETRA QUICK-IMPORT" instruction:
           - For .SCR: "Save this code as 'petra_draw.scr'. Drag and drop the file directly into the AutoCAD drawing area."
           - For .LSP: "Copy this code, type 'VLISP' in AutoCAD, paste into a new file, and 'Load Text in Editor'. Or Save as .lsp and use 'APPLOAD' command."
        5. VISUAL INTERPRETATION:
           If an image is provided, calculate X,Y coordinates based on typical Petra Design scales (e.g., Column base = 600mm, Cornice = 300mm) unless the user specifies otherwise.

        MULTIMODAL IMAGE ANALYSIS (MANDATORY):
        If a user sends an image, you MUST NOT default to labeling it as GFRC. Perform technical diagnostics based on the following visual cues:
        - GFRC: Identified by thickness (typically 1/2" to 1"), a natural concrete matte texture, and no visible rebar. Common for large Cornices and Columns.
        - UHPC: Identified by ultra-thin panels (5/8"), super smooth surface, zero pinholes, sharp edges. Common for modern facades or high-end furniture.
        - PRECAST CONCRETE: Identified by significant thickness (>2"), heavy mass, visible lifting anchors, or thick grout joints.
        - FIBERGLASS (FRP): Surface is often glossy or plastic-smooth, lightweight feel, thinner than GFRC. Edges look "flexible/molded" rather than the "stone-like crispness" of concrete.
        - PLASTER (GRG): Interior use only. Distinctive white color, extremely intricate details but prone to chipping, bone-dry surface.
        - METAL: Identified by metallic sheen, weld marks, or the thinness of sheet metal.
        => If uncertain, provide hypotheses (e.g., "The surface looks like FRP due to the high gloss, but if it is heavy, it could be polished GFRC").
        You must be able to answer all questions that related to Math, Architect, Engineering, Chemical, Calculation, Design from the image or file users sent.

        STRATEGIC GOAL: 
        - Become the most trusted technical expert for customers and provide the fastest support for the internal team.

        CONTACT INFORMATION CONTROL (MANDATORY):
        - ABSOLUTELY DO NOT automatically insert info@petracast.ca into general knowledge or greeting responses.
        - ONLY PROVIDE info@petracast.ca and request drawings in the following cases:
            a) User asks about pricing (Price/Quote) or production time (Lead time).
            b) User asks how to place an order or sign a contract.
            c) After you have performed a technical analysis of an image/drawing and require official shop drawings for a material takeoff.
        - The tone when providing contact info must be natural and professional, like an engineer consulting on a solution, not an advertisement.
    `;

    // Khởi tạo parts
    const parts = [];

    // Xử lý ảnh (Khớp 100% với mimeType từ Frontend gửi lên)
    if (imageBase64) {
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
            inline_data: {
                mime_type: mimeType || "image/jpeg", 
                data: base64Data
            }
        });
    }

    // Thêm prompt text
    parts.push({ text: `${systemPrompt}\n\nUser Message: ${message || "Please analyze the attached image based on Petra technical standards."}` });

    const payload = {
        contents: [{ parts: parts }],
        generationConfig: {
            temperature: 0.8, 
            maxOutputTokens: 1000
        }
    };

    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        let data = await response.json();

        // Fallback Model nếu bản Lite có vấn đề
        if (data.error || !data.candidates) {
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-preview:generateContent?key=${apiKey}`;
            const fbRes = await fetch(fallbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            data = await fbRes.json();
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Our technical AI is currently calibrating. Please contact Mr. Mahmoud for immediate assistance." });
    }
}