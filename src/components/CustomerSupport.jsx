import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supportService from '../services/supportService';
import { FaPaperPlane, FaRobot, FaUser, FaArrowLeft, FaHeadset, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import './CustomerSupport.css';

// Initial chat state with the welcome message
const INITIAL_MESSAGES = [{
    sender: 'bot',
    text: 'Hello! I am ConnectCom\'s virtual assistant. Type "hi" to see the main menu options.',
    optionsVisible: false,
    isEnd: false
}];

const CustomerSupport = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);

    // --- Core Chat Logic ---

    const processMessage = async (userMessage) => {
        // Clear options from the last bot message before adding the new user message
        setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 ? { ...msg, optionsVisible: false } : msg
        ));
        
        // 1. Add user message to chat history
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInput(''); // Clear input field
        setIsLoading(true);
        setError(null);

        try {
            // 2. Call backend service
            const response = await supportService.sendMessage(userMessage);

            // 3. Add bot response
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: response.message,
                optionsVisible: response.optionsVisible,
                isEnd: response.isEnd
            }]);
        } catch (err) {
            console.error('Chat API Error:', err);
            // Check for unauthorized error from the service and redirect
            if (err.message && err.message.includes('Authentication required')) {
                navigate('/login');
                return;
            }
            setError(err.message || 'Could not reach the support service.');
            setMessages(prev => [...prev, { sender: 'bot', text: 'Service error. Please try again later.', optionsVisible: false, isEnd: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (trimmedInput === '') return;
        processMessage(trimmedInput);
    };

    const handleOptionClick = (option) => {
        processMessage(option.toString());
    };

    // Scroll to the latest message whenever messages state changes
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // --- Helper Components ---

    const MessageBubble = ({ message }) => (
        <div className={`message-bubble ${message.sender}`}>
            <span className="sender-icon">
                {message.sender === 'user' ? <FaUser /> : <FaRobot />}
            </span>
            <div className="text-content">
                {/* Format the text content for line breaks (from the backend \n) */}
                {message.text.split('\n').map((line, index) => (
                    <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/(\d+)\s*️⃣/g, '<strong>$1️⃣</strong>') }} />
                ))}
            </div>
        </div>
    );

    const OptionsMenu = ({ lastMessage }) => {
        if (!lastMessage.optionsVisible) return null;

        // Parse options from the message text (e.g., "1️⃣ Current plan\n...")
        // This regex extracts the number (the key) and the full line (the text)
        const optionsRegex = /(\d+)[\s*]?[^\n]+/g;
        const optionMatches = [...lastMessage.text.matchAll(optionsRegex)];

        if (optionMatches.length === 0) return null;
        
        // Extract the number (which is the input expected by the backend)
        const options = optionMatches.map(match => ({ 
            key: match[1], 
            text: match[0].trim().replace(/(\d+)\s*️⃣/, '$1. ') // Display: "1. Current plan"
        }));

        return (
            <div className="options-menu">
                {options.map(option => (
                    <button 
                        key={option.key} 
                        onClick={() => handleOptionClick(option.key)} 
                        disabled={isLoading}
                        className="option-btn"
                    >
                        {option.text}
                    </button>
                ))}
            </div>
        );
    };
    
    // Determine if we should show the typing indicator or the options menu
    const lastBotMessage = messages.slice(-1).find(m => m.sender === 'bot');
    const showOptionsMenu = lastBotMessage && lastBotMessage.optionsVisible && !isLoading;

    return (
        <div className="chat-page-container">
            <header className="chat-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn"><FaArrowLeft /> Back to Dashboard</button>
                <h1><FaHeadset /> Customer Support Chat</h1>
            </header>

            <div className="chat-container">
                <div className="chat-window">
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="typing-indicator-bubble">
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                
                {error && (
                    <div className="chat-error-bar">
                        <FaTimesCircle /> {error}
                    </div>
                )}
                
                {showOptionsMenu && (
                    <OptionsMenu lastMessage={lastBotMessage} />
                )}

                <form className="chat-input-form" onSubmit={handleSend}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message or a menu number..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} className="send-btn">
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomerSupport;
