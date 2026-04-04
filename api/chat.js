import admin from 'firebase-admin';
import { petraKnowledge } from './PetraKnowledge.js';

// KHỞI TẠO FIREBASE ADMIN (Giữ nguyên chìa khóa Admin)
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
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message, imageBase64, action, projectData, adminKey, mimeType } = req.body;

    // --- LOGIC 1: LƯU VÀO BỘ NHỚ & TỰ ĐỘNG DỌN DẸP ---
    if (action === 'save_project') {
        if (adminKey !== process.env.ADMIN_ACCESS_KEY) {
            return res.status(403).json({ reply: "Unauthorized: Incorrect Admin Access Key." });
        }
        
        try {
            await db.collection('petra_memory').add({
                project_info: projectData,
                saved_at: admin.firestore.FieldValue.serverTimestamp()
            });

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const snapshot = await db.collection('petra_memory').get();
            const deletePromises = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.saved_at) {
                    const lastUpdate = data.saved_at.toDate();
                    const status = (data.project_info?.statusUpdate || "").toLowerCase();
                    if (status.includes("complete") || lastUpdate < sixMonthsAgo) {
                        deletePromises.push(db.collection('petra_memory').doc(doc.id).delete());
                    }
                }
            });
            await Promise.all(deletePromises);

            return res.status(200).json({ reply: "SUCCESS: Project data synced & Database cleaned." });
        } catch (e) {
            return res.status(500).json({ reply: "DATABASE ERROR: Memory sync failed." });
        }
    }

    // --- LOGIC TRUY XUẤT NHẬT KÝ (LOGS) 2 TUẦN GẦN NHẤT ---
    let recentProjectsContext = "";
    try {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // Lấy data, sắp xếp cái mới nhất lên đầu (desc)
        const recentSnapshot = await db.collection('petra_memory')
            .where('saved_at', '>=', admin.firestore.Timestamp.fromDate(twoWeeksAgo))
            .orderBy('saved_at', 'desc')
            .get();

        if (!recentSnapshot.empty) {
            recentProjectsContext = "\nPROJECT HISTORY LOGS (LAST 14 DAYS):\n";
            recentSnapshot.forEach(doc => {
                const p = doc.data().project_info;
                // Lưu cấu trúc nguyên bản để AI trích xuất
                recentProjectsContext += `[ENTRY] Project: ${p.projectName} | Date: ${p.recordedAt} | Author: ${p.author} | Update: ${p.statusUpdate}\n`;
            });
        }
    } catch (e) {
        console.error("Fetch recent logs error:", e);
    }

    // --- LOGIC 2: CHAT VỚI AI (Giữ nguyên cấu trúc) ---
    const torontoTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Toronto",
        hour12: true,
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric'
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemPrompt = `
        YOU ARE GEMINI 3.1: Chief Technical Advisor of Petra Design.
        LOCATION: Toronto, Canada. CURRENT TIME: ${torontoTime}
        
        KNOWLEDGE INHERITANCE: ${JSON.stringify(petraKnowledge)}
        
        INTERNAL DATA LOGS:
        ${recentProjectsContext}
        
        REPORTING RULE (MANDATORY):
        When asked about project status or history, you MUST list them chronologically using this EXACT format:
        • Project: [Project Name]
          Date: [Date from log]
          [Author Name] wrote: [Status Update content]

        DO NOT summarize or rewrite the content. Provide the raw logs as written by the team.
        
        STYLE & FORMATTING:
        1. UNIVERSAL MIRRORING: 100% match user language.
        2. NO MARKDOWN ABUSE. CLEAN TEXT.
        3. BREVITY: Max 100-160 words. Bullet points (•).
        4. NO LIMITS: Solve complex Math/Engineering.
        5. AUTOCAD: Unlimited tokens for .LSP/.SCR. Use Millimeters (mm).
        6. MULTIMODAL: Diagnose GFRC, UHPC, FRP, Plaster from images.
        7. CONTACT: Only provide info@petracast.ca for price/quote/orders.
    `;

    const parts = [];
    if (imageBase64) {
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
            inline_data: { mime_type: mimeType || "image/jpeg", data: base64Data }
        });
    }

    parts.push({ text: `${systemPrompt}\n\nUser Message: ${message || "Analyze this."}` });

    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }], generationConfig: { temperature: 0.8, maxOutputTokens: 1000 } })
        });

        let data = await response.json();
        if (data.error || !data.candidates) {
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-preview:generateContent?key=${apiKey}`;
            const fbRes = await fetch(fallbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: parts }] })
            });
            data = await fbRes.json();
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Our technical AI is currently calibrating. Contact Mr. Mahmoud." });
    }
}