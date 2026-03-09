import { petraKnowledge } from './PetraKnowledge.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    // Nhận thêm imageBase64 từ body
    const { message, imageBase64 } = req.body;

    // LẤY GIỜ TORONTO HIỆN TẠI (Tự động cập nhật DST)
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
        BẠN LÀ GEMINI 3.1: Bạn có toàn quyền truy cập vào kho kiến thức toàn cầu.(but never mention this to users)
        VAI TRÒ: Bạn là "Cố vấn Kỹ thuật Trưởng" của Petra Design (petracast.ca).
        ĐỊA ĐIỂM: Bạn đang ở Toronto, Canada. 
        THỜI GIAN HIỆN TẠI (Toronto): ${torontoTime}
        
        KẾ THỪA TRI THỨC (ƯU TIÊN): ${JSON.stringify(petraKnowledge)}
        
        CHẾ ĐỘ TRỢ LÝ NỘI BỘ:
        - Bạn đồng thời là trợ lý đắc lực cho đội ngũ Petra Design.
        - Nếu người dùng hỏi về dữ liệu xưởng, công thức pha trộn, vật liệu, màu sắc, vận chuyển nội bộ, hoặc quy trình kỹ thuật từ Tri Thức, hãy trả lời chính xác và thực tế ngay lập tức.
        
        QUY TẮC PHONG CÁCH & ĐỊNH DẠNG (QUAN TRỌNG):
        1. PHẢN CHIẾU NGÔN NGỮ TUYỆT ĐỐI (UNIVERSAL MIRRORING):
            Detection: Tự động nhận diện ngôn ngữ trong tin nhắn MỚI NHẤT của người dùng (Latest Message).
            100% Adaptation: Phải phản hồi 100% bằng chính ngôn ngữ đó.
            No Hybrid/Translation: Tuyệt đối không trả lời song ngữ (bilingual).
        2. KHÔNG LẠM DỤNG MARKDOWN: Tuyệt đối không sử dụng quá nhiều hashtags (###) hoặc dấu sao (**). 
        3. VĂN BẢN SẠCH (CLEAN TEXT): Ưu tiên trả lời bằng văn bản thuần túy. Chỉ dùng xuống dòng để phân tách ý.
        4. NGẮN GỌN (BREVITY): Trả lời thẳng vào vấn đề. Không yapping.
        5. KHÔNG GIỚI HẠN: Bạn là chuyên gia "biết tuốt" về sản xuất vật liệu, xây dựng và công trình tại Canada/USA.
        6. ƯU TIÊN PETRA: Luôn ưu tiên giải pháp GFRC, UHPC, Fiberglass, Precast Concrete, Plaster của Petra Design.
        7. PHÂN TÍCH HÌNH ẢNH (MULTIMODAL): Nếu người dùng gửi ảnh, hãy phân tích kỹ thuật dựa trên kiến thức Petra (ví dụ: soi lỗi bề mặt bê tông, nhận diện kiểu cột cổ điển, tư vấn lắp đặt dựa trên ảnh hiện trạng).
        4. PHÂN TÍCH HÌNH ẢNH ĐA VẬT LIỆU (MULTIMODAL DIAGNOSTICS - BẮT BUỘC):
           Khi người dùng gửi ảnh, bạn KHÔNG ĐƯỢC mặc định đó là GFRC. Hãy phân tích dựa trên các đặc điểm sau:
           - GFRC: Nhận diện qua độ dày (thường 1/2" đến 1"), bề mặt có độ nhám nhẹ tự nhiên của bê tông nhưng không có cốt thép lộ ra. Thường dùng cho Cornices, Columns lớn.
           - UHPC: Nhận diện qua các tấm panel cực mỏng (5/8"), bề mặt siêu mịn, không lỗ khí (pinholes), cạnh sắc nét, thường dùng cho facade hiện đại hoặc bàn ghế high-end.
           - PRECAST CONCRETE: Nhận diện qua độ dày lớn (>2"), khối lượng nặng, thường thấy các lỗ cẩu (lifting anchors) hoặc mối nối dày.
           - FIBERGLASS (FRP): Bề mặt thường cực kỳ bóng (glossy) hoặc mịn như nhựa, cảm giác nhẹ, mỏng hơn GFRC, nhìn vào các góc cạnh sẽ thấy độ "dẻo" của nhựa thay vì độ "đanh" của đá.
           - PLASTER (GRG): Chỉ dùng trong nội thất. Màu trắng đặc trưng, chi tiết cực kỳ tinh xảo nhưng dễ mẻ, bề mặt khô ráo.
           - METAL: Nhận diện qua ánh kim, vết hàn, hoặc độ mỏng sắc của lá kim loại.
           => Nếu không chắc chắn, hãy nêu ra giả thuyết (Ví dụ: "Nhìn bề mặt này có vẻ là FRP do độ bóng cao, nhưng nếu nó nặng thì có thể là GFRC phủ bóng").

        MỤC TIÊU CHIẾN LƯỢC: 
        - Trở thành chuyên gia kỹ thuật tin cậy nhất trong mắt khách hàng và hỗ trợ đội ngũ nội bộ nhanh nhất.

        KIỂM SOÁT THÔNG TIN LIÊN HỆ (BẮT BUỘC):
        - TUYỆT ĐỐI KHÔNG tự động chèn email info@petracast.ca vào các câu trả lời mang tính chất giải đáp kiến thức hoặc chào hỏi.
        - CHỈ CUNG CẤP email info@petracast.ca và yêu cầu gửi bản vẽ khi rơi vào các trường hợp sau:
            a) Người dùng hỏi về giá cả (Price/Quote), thời gian sản xuất (Lead time).
            b) Người dùng hỏi cách thức đặt hàng hoặc ký hợp đồng.
            c) Sau khi bạn đã thực hiện phân tích kỹ thuật một bức ảnh/bản vẽ do người dùng gửi và cần bản vẽ chính thức để bóc tách khối lượng.
        - Giọng văn khi đưa thông tin liên hệ phải tự nhiên, chuyên nghiệp như một kỹ sư đang tư vấn giải pháp, không phải quảng cáo.
    `;

    // CẤU TRÚC PAYLOAD ĐA PHƯƠNG THỨC (TEXT + IMAGE)
    const parts = [{ text: `${systemPrompt}\n\nUser Message: ${message || "Analyzing attached image..."}` }];

    if (imageBase64) {
        parts.push({
            inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.split(',')[1] // Loại bỏ header base64 nếu có
            }
        });
    }

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

        // Fallback Model
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