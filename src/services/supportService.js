// src/services/supportService.js

// Using the official Gemini API endpoint for text generation
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;
// API Key is left blank, as the environment will automatically provide it during runtime.
const API_KEY = ""; 

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string} The JWT token.
 */
const getToken = () => {
    // We still check for authentication to ensure the user is logged in before using the chat.
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.token : null;
};

/**
 * Sends a user message to the Gemini API to get a response.
 * @param {string} message The user's text input.
 * @returns {Promise<object>} The chat response object in the format { message: string, optionsVisible: boolean, isEnd: boolean }.
 */
const sendMessage = async (message) => {
    const token = getToken();
    if (!token) {
        // This keeps the client-side check from the previous version.
        throw new Error('Authentication required to use support chat.');
    }

    // Define the LLM's role and rules (System Instruction)
    const systemInstruction = `
You are ConnectCom's AI Support Assistant specializing in billing and service diagnostics.

Core Capabilities:
1. Billing Support:
   - Check bill status and payment history
   - Explain charges and fees
   - Handle payment issues and dunning events
   - Process payment arrangements

2. Service Diagnostics:
   - Internet connectivity issues
   - Mobile service problems
   - Service status checks
   - Equipment troubleshooting

Rules for interaction:
1. First Response: Always greet and ask for account verification
2. Menu Format: Use numbered emojis (e.g., "1️⃣")
3. Diagnostics Flow: 
   - Ask specific questions to diagnose issues
   - Provide step-by-step solutions
   - Escalate to human agent if needed
4. Use customer data from API when available

Main Menu:
1️⃣ Check Bill & Payment Status
2️⃣ Service Issues & Diagnostics
3️⃣ Payment Arrangements
4️⃣ Speak to Human Agent

Never share sensitive data or external links.`;

    const userQuery = `User message: ${message}`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        // Enable Google Search for grounding factual answers
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
    };

    const MAX_RETRIES = 3;
    let attempt = 0;
    
    while (attempt < MAX_RETRIES) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY // Use the header for the key
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Throw an error to trigger retry or final catch
                throw new Error(`Gemini API HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";

            // Determine if options should be shown based on content
            const optionsVisible = text.includes('1️⃣') || text.includes('2️⃣') || text.includes('3️⃣');

            return { 
                message: text, 
                optionsVisible: optionsVisible, 
                isEnd: text.includes('Speak to a Human Agent') // Mocking 'end' on human transfer
            };

        } catch (error) {
            attempt++;
            if (attempt >= MAX_RETRIES) {
                throw new Error('Failed to connect to the support service after multiple retries.');
            }
            // Implement exponential delay (1s, 2s, 4s, ...)
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            // Do not log the retry to the console to prevent clutter
        }
    }
    throw new Error('Failed to send message after multiple retries.');
};

const supportService = {
    sendMessage,
};

export default supportService;
