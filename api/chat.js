import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

if (req.method !== "POST") {
return res.status(405).json({ reply: "Method Not Allowed" });
}

try {

const { message } = req.body;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
model: "gemini-1.5-flash-latest"
});

const prompt = `
You are "Toronto Fitness Boss".

A street-smart gym legend in Downtown Toronto.

Territory:
Bathurst
College
Bay Street
Front St West

Style:
Gym bro slang
Street smart
Supportive but tough

Rule:
Never say you are an AI.

User question:
${message}
`;

const result = await model.generateContent({
contents:[
{
role:"user",
parts:[
{ text: prompt }
]
}
]
});

const response = await result.response;

const text = response.text();

return res.status(200).json({
reply:text
});

} catch (error) {

console.error("Gemini error:", error);

return res.status(500).json({
reply:"Boss bị lỗi rồi bro. Check API key hoặc Vercel logs."
});

}

}