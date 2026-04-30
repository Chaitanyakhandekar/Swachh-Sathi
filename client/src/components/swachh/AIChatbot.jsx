import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2, Trash2 } from 'lucide-react';
import { aiApi } from '../../api/ai.api.js';

const fallbacks = [
    {
        keywords: ['join', 'participate', 'volunteer'],
        answer: "To join an event: 1) Browse events on Home or Nearby, 2) Click on any event, 3) Click 'Join Event' button. You'll be added to the volunteer list and can check in at the event using the QR code."
    },
    {
        keywords: ['qr', 'check in', 'attendance'],
        answer: "Check-in using QR code: 1) At the event location, click 'Check In' button, 2) Scan the QR code displayed by the organizer (or enter manually), 3) You'll be marked as PRESENT and earn credits when the event completes."
    },
    {
        keywords: ['credits', 'reward', 'earn'],
        answer: "Credits are earned by: 1) Attending events and checking in, 2) Completing volunteer tasks. Credits are awarded when events are marked COMPLETED. Use credits to unlock badges and climb the leaderboard!"
    },
    {
        keywords: ['create event', 'organize'],
        answer: "To create an event: 1) Be an ORGANIZER (request from admin), 2) Go to 'Create Event', 3) Fill in details (title, description, date, time, location), 4) Set max volunteers and credit reward, 5) Publish. A unique QR code will be generated."
    },
    {
        keywords: ['waste report', 'garbage'],
        answer: "Report waste spots: 1) Go to 'Waste Reports' in navigation, 2) Click 'Report Waste', 3) Add description, type, quantity estimate, 4) Add photo if possible, 5) Your location is auto-detected. Reports help organize cleanups!"
    },
    {
        keywords: ['leaderboard', 'rank'],
        answer: "Leaderboard shows top volunteers by credits. Earn more credits by: 1) Attending more events, 2) Completing events. Compete with others and earn badges!"
    },
    {
        keywords: ['badge', 'achievement'],
        answer: "Badges are earned by completing milestones: FIRST_EVENT, TOP_VOLUNTEER, CLEAN_CHAMPION, ECO_WARRIOR. Check your profile to see earned badges!"
    },
    {
        keywords: ['help', 'how'],
        answer: "I'm here to help! Ask me about: joining events, checking in, earning credits, creating events, waste reporting, leaderboards, badges, or any other Swachh Sathi features."
    }
];

const getFallback = (question) => {
    const lowerQ = question.toLowerCase();
    for (const item of fallbacks) {
        for (const keyword of item.keywords) {
            if (lowerQ.includes(keyword)) {
                return item.answer;
            }
        }
    }
    return null;
};

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hi! I'm your Swachh Sathi Assistant. Ask me anything about events, volunteering, credits, or the platform!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const result = await aiApi.chat(userMsg);
            console.log("MESSAGE CHATBOT :::::::: ", result.message)

            if (result.success && result.message.trim().length > 0) {
                setMessages(prev => [...prev, { role: 'bot', text: result.message }]);
            } else {
                const fallback = getFallback(userMsg);
                if (fallback) {
                    setMessages(prev => [...prev, { role: 'bot', text: fallback }]);
                } else {
                    setMessages(prev => [...prev, { role: 'bot', text: "I couldn't find a specific answer. Try asking about joining events, QR check-in, credits, or waste reporting!" }]);
                }
            }
        } catch (error) {
            const fallback = getFallback(userMsg);
            if (fallback) {
                setMessages(prev => [...prev, { role: 'bot', text: fallback }]);
            } else {
                setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting right now. Please try again!" }]);
            }
        }

        setLoading(false);
    };

    const handleClear = () => {
        setMessages([
            { role: 'bot', text: "Hi! I'm your Swachh Sathi Assistant. Ask me anything about events, volunteering, credits, or the platform!" }
        ]);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center hover:scale-110 transition-transform z-50"
            >
                <Bot size={28} className="text-white" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 lg:w-96 bg-[#13151c] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600">
                <div className="flex items-center gap-2">
                    <Bot size={20} className="text-white" />
                    <span className="text-white font-semibold">Swachh Sathi AI</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleClear} className="p-1 hover:bg-white/20 rounded-lg" title="Clear chat">
                        <Trash2 size={16} className="text-white" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                        <X size={18} className="text-white" />
                    </button>
                </div>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${msg.role === 'user'
                            ? 'bg-green-500 text-white rounded-br-md'
                            : 'bg-white/10 text-gray-200 rounded-bl-md'
                            }`}>
                            {msg.role === 'bot' && <Bot size={12} className="text-green-400 mb-1" />}
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 px-4 py-2 rounded-2xl rounded-bl-md">
                            <Loader2 size={18} className="text-green-500 animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="flex-1 bg-[#0a0b0f] border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatbot;