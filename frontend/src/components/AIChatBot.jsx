import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Zap, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const TypewriterMessage = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[index]);
                setIndex(prev => prev + 1);
            }, 20); // Typing speed
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, text, onComplete]);

    return <span>{displayedText}</span>;
};

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! How can I help you find your dream car today?', animate: false }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const suggestions = [
        "Best car under 10 lakh?",
        "Top safe SUVs in India",
        "Best mileage diesel car",
        "Explain AI matching"
    ];

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (text) => {
        const query = text || input;
        if (!query.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text: query, animate: false }]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await axios.post('http://localhost:8000/chat', { query });
            // Artificial delay to show dots
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, { role: 'ai', text: response.data.answer, animate: true }]);
            }, 1500);
        } catch (error) {
            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'ai', text: "I'm having a bit of trouble connecting to my database. Please try again in a moment!", animate: true }]);
        }
    };

    return (
        <>
            <motion.button 
                className="chat-widget-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className="chat-window"
                        initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
                    >
                        <div className="chat-header">
                            <div style={{ background: 'var(--gradient)', width: '35px', height: '35px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Zap size={18} color="white" fill="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Zenith AI Assistant</div>
                                <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div> Live Insight
                                </div>
                            </div>
                        </div>

                        <div className="chat-messages" ref={scrollRef}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`message ${msg.role}`}>
                                    {msg.animate ? (
                                        <TypewriterMessage text={msg.text} onComplete={scrollToBottom} />
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message ai" style={{ display: 'flex', gap: '4px', width: 'fit-content' }}>
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%' }} />
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%' }} />
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%' }} />
                                </div>
                            )}
                        </div>

                        <div className="chat-input-area">
                            {/* ... suggestions ... */}
                            <div className="chat-suggestions">
                                {suggestions.map((s, i) => (
                                    <div key={i} className="chat-suggestion" onClick={() => handleSend(s)}>{s}</div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ borderRadius: '25px', padding: '10px 20px' }}
                                    placeholder="Type your message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '0', width: '45px', height: '45px', borderRadius: '50%', flexShrink: 0, justifyContent: 'center' }}
                                    onClick={() => handleSend()}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatBot;
