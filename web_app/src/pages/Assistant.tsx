import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function Assistant() {
    const { token, fetchWithAuth } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI Welding Assistant. How can I help you today? I can answer questions about metallurgy, recommend parameters, or help troubleshoot defects.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading || !token) return;

        const newMessages = [...messages, { role: 'user' as const, content: text }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetchWithAuth(`${API_BASE}/v1/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!res.ok) throw new Error('Failed to get response');

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to my servers. Please try again in a moment.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedPrompts = [
        "What are the best MIG settings for 5mm aluminum?",
        "How do I prevent porosity?",
        "Explain rolled-in scale defects to me."
    ];

    return (
        <DashboardLayout title="Welding AI Assistant">
            <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col glass-card border-primary-500/20 overflow-hidden">

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'assistant' ? 'bg-gradient-to-br from-primary-600 to-primary-400' : 'bg-dark-800 border border-white/10'}`}>
                                {msg.role === 'assistant' ? <Bot className="w-6 h-6 text-white" /> : <User className="w-5 h-5 text-white/60" />}
                            </div>

                            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-dark-800 border-white/10 border text-white' : 'bg-primary-900/10 border border-primary-500/20 text-blue-50'}`}>
                                <div className="text-sm prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary-600 to-primary-400 shadow-lg">
                                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                            </div>
                            <div className="bg-primary-900/10 border border-primary-500/20 rounded-2xl p-4 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                                <span className="text-sm text-primary-200">Analyzing knowledge base...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-dark-950/50 backdrop-blur-md">
                    {messages.length === 1 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                            {suggestedPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(prompt)}
                                    className="whitespace-nowrap px-4 py-2 rounded-lg bg-dark-800 border border-white/5 hover:border-primary-500/50 hover:bg-dark-700 text-xs text-white/70 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                        className="relative flex items-center"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about welding..."
                            disabled={isLoading}
                            className="w-full bg-dark-900 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2 bg-primary-600 hover:bg-primary-500 disabled:bg-dark-800 disabled:text-white/20 text-white rounded-lg transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>

            </div>
        </DashboardLayout>
    );
}
