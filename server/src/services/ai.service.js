import dotenv from "dotenv";

dotenv.config();

const getAIResponse = async (userMessage) => {
    try {
        const { GoogleGenAI } = await import("@google/genai");
        
        if (!process.env.GOOGLE_GENAI_API_KEY) {
            throw new Error("GOOGLE_GENAI_API_KEY not configured");
        }
        
        const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

        const systemPrompt = `You are Swachh Sathi AI Assistant for a volunteer management platform. Your role is to help users with:
1. EVENT PARTICIPATION: How to join events, participate as volunteer, find nearby events
2. QR CHECK-IN: How to scan QR codes, mark attendance, get credits
3. CREDITS & REWARDS: Earning credits, rewards system, leaderboard
4. EVENT CREATION: How organizers create events, manage volunteers
5. WASTE REPORTING: Report garbage spots, track cleanup progress
6. BADGES: Achievement system, unlocking badges
7. ADMIN: Verify completions, manage users, dashboard
Be helpful, concise, and friendly.`;

        const fullPrompt = `${systemPrompt}\n\nUser question: ${userMessage}`;
        
        const result = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        });
        
        const response = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
        
        return {
            success: true,
            response: response
        };
    } catch (error) {
        console.error("AI Service Error:", error.message);
        return {
            success: false,
            response: "Sorry, I'm having trouble answering that right now. Please try again."
        };
    }
};

export { getAIResponse };