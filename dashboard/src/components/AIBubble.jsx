import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

// ============================================
// FLOATING AI BUBBLE COMPONENT
// ============================================

export default function AIBubble() {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [chatMode, setChatMode] = useState(null) // 'quick' or 'deep'
    const [isLoading, setIsLoading] = useState(false)
    const [analysisContext, setAnalysisContext] = useState('')
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef(null)

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Fetch initial analysis based on mode
    const handleOptionClick = async (mode) => {
        setChatMode(mode)
        setShowChat(true)
        setIsExpanded(false)
        setIsLoading(true)
        setMessages([])

        try {
            const endpoint = mode === 'quick'
                ? 'http://localhost:8000/api/ai/explain'
                : 'http://localhost:8000/api/ai/deep-analysis'

            const options = mode === 'quick'
                ? {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        focus_score: 75,
                        duration_minutes: 45,
                        active_time_minutes: 38,
                        idle_time_minutes: 7,
                        app_switches: 15,
                        top_apps: ['VSCode', 'Chrome'],
                        session_date: new Date().toISOString().split('T')[0]
                    })
                }
                : { method: 'POST', headers: { 'Content-Type': 'application/json' } }

            const response = await fetch(endpoint, options)
            const data = await response.json()

            if (data.response) {
                setAnalysisContext(data.response)
                setMessages([{
                    role: 'assistant',
                    content: data.response,
                    isCached: data.is_cached,
                    sessionsAnalyzed: data.sessions_analyzed
                }])
            }
        } catch (error) {
            console.error('Analysis fetch error:', error)
            setMessages([{
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                isError: true
            }])
        } finally {
            setIsLoading(false)
        }
    }

    // Send chat message
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        const userMessage = inputValue.trim()
        setInputValue('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            // Build message history for API (excluding metadata)
            const messageHistory = messages.map(m => ({
                role: m.role,
                content: m.content
            }))
            messageHistory.push({ role: 'user', content: userMessage })

            const response = await fetch('http://localhost:8000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: analysisContext,
                    messages: messageHistory
                })
            })

            const data = await response.json()

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || 'Sorry, I could not generate a response.'
            }])
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                isError: true
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Just hide the chat window (persist messages)
    const hideChat = () => {
        setShowChat(false)
        setIsExpanded(false)
    }

    // Completely restart - clear everything and fetch new analysis
    const restartAnalysis = async () => {
        setMessages([])
        setAnalysisContext('')
        setIsLoading(true)

        try {
            const endpoint = chatMode === 'quick'
                ? 'http://localhost:8000/api/ai/explain'
                : 'http://localhost:8000/api/ai/deep-analysis'

            const options = chatMode === 'quick'
                ? {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        focus_score: 75,
                        duration_minutes: 45,
                        active_time_minutes: 38,
                        idle_time_minutes: 7,
                        app_switches: 15,
                        top_apps: ['VSCode', 'Chrome'],
                        session_date: new Date().toISOString().split('T')[0]
                    })
                }
                : { method: 'POST', headers: { 'Content-Type': 'application/json' } }

            const response = await fetch(endpoint, options)
            const data = await response.json()

            if (data.response) {
                setAnalysisContext(data.response)
                setMessages([{
                    role: 'assistant',
                    content: data.response,
                    isCached: data.is_cached,
                    sessionsAnalyzed: data.sessions_analyzed
                }])
            }
        } catch (error) {
            console.error('Restart analysis error:', error)
            setMessages([{
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                isError: true
            }])
        } finally {
            setIsLoading(false)
        }
    }

    // Handle bubble click - show existing chat or show menu
    const handleBubbleClick = () => {
        if (showChat) {
            // If chat is open, hide it
            hideChat()
        } else if (messages.length > 0 && chatMode) {
            // If we have previous messages, reopen the same chat
            setShowChat(true)
        } else {
            // Otherwise show the menu to choose
            setIsExpanded(!isExpanded)
        }
    }

    return (
        <>
            {/* Floating Bubble */}
            <motion.div
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 1000
                }}
            >
                {/* Expanded Menu */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            style={{
                                position: 'absolute',
                                bottom: '70px',
                                right: 0,
                                background: 'linear-gradient(145deg, rgba(30, 30, 45, 0.98), rgba(20, 20, 35, 0.98))',
                                borderRadius: '16px',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                padding: '0.5rem',
                                minWidth: '200px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.15)'
                            }}
                        >
                            <motion.button
                                whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                                onClick={() => handleOptionClick('quick')}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>🧠</span>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Quick Tips</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Current session feedback</div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                                onClick={() => handleOptionClick('deep')}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>📊</span>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Deep Analysis</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>7-day insights + chat</div>
                                </div>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Bubble Button */}
                <motion.button
                    onClick={handleBubbleClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={!isExpanded && !showChat && messages.length === 0 ? {
                        boxShadow: [
                            '0 0 20px rgba(139, 92, 246, 0.3)',
                            '0 0 40px rgba(139, 92, 246, 0.5)',
                            '0 0 20px rgba(139, 92, 246, 0.3)'
                        ]
                    } : {}}
                    transition={!isExpanded && !showChat && messages.length === 0 ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    } : {}}
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: 'none',
                        background: showChat
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : messages.length > 0
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        color: '#fff',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                    }}
                >
                    {showChat ? '✕' : messages.length > 0 ? '💬' : '🧠'}
                </motion.button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        style={{
                            position: 'fixed',
                            bottom: '96px',
                            right: '24px',
                            width: '380px',
                            maxHeight: '500px',
                            background: 'linear-gradient(145deg, rgba(25, 25, 40, 0.98), rgba(15, 15, 25, 0.98))',
                            borderRadius: '20px',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 999
                        }}
                    >
                        {/* Chat Header */}
                        <div style={{
                            padding: '1rem 1.25rem',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>
                                {chatMode === 'quick' ? '🧠' : '📊'}
                            </span>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {chatMode === 'quick' ? 'Focus Coach' : 'AI Deep Analysis'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                    {chatMode === 'deep' ? 'Ask me anything about your data' : 'Quick session tips'}
                                </div>
                            </div>
                            {/* Restart Analysis Button */}
                            <motion.button
                                onClick={restartAnalysis}
                                disabled={isLoading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Restart Analysis"
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#f87171',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                🔄 Restart
                            </motion.button>
                        </div>

                        {/* Messages Area */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            minHeight: '200px',
                            maxHeight: '300px'
                        }}>
                            {isLoading && messages.length === 0 && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '2rem',
                                    gap: '0.75rem'
                                }}>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        style={{ fontSize: '1.5rem' }}
                                    >
                                        {chatMode === 'quick' ? '🧠' : '📊'}
                                    </motion.div>
                                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                        {chatMode === 'deep' ? 'Analyzing 7 sessions...' : 'Getting tips...'}
                                    </span>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%'
                                    }}
                                >
                                    {msg.role === 'assistant' && idx === 0 && msg.sessionsAnalyzed && (
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: '#a78bfa',
                                            marginBottom: '0.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            📈 Analyzed {msg.sessionsAnalyzed} sessions
                                            {msg.isCached && <span style={{ color: '#fbbf24' }}> • Demo</span>}
                                        </div>
                                    )}
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                                            : 'rgba(255,255,255,0.08)',
                                        color: '#fff',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.5,
                                        whiteSpace: 'pre-wrap'
                                    }}
                                        dangerouslySetInnerHTML={{
                                            __html: msg.content
                                                .replace(/^### (.*$)/gm, '<strong style="color:#a78bfa;">$1</strong>')
                                                .replace(/^## (.*$)/gm, '<strong style="color:#8b5cf6;font-size:1rem;">$1</strong>')
                                                .replace(/^# (.*$)/gm, '<strong style="color:#6366f1;font-size:1.1rem;">$1</strong>')
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br/>')
                                                .replace(/- /g, '• ')
                                        }}
                                    />
                                </div>
                            ))}

                            {isLoading && messages.length > 0 && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '16px 16px 16px 4px',
                                    background: 'rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    gap: '0.25rem'
                                }}>
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >●</motion.span>
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                    >●</motion.span>
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                    >●</motion.span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area - Only show for deep analysis */}
                        {chatMode === 'deep' && (
                            <div style={{
                                padding: '1rem',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                gap: '0.5rem'
                            }}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about your data..."
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        fontSize: '0.875rem',
                                        outline: 'none'
                                    }}
                                />
                                <motion.button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: inputValue.trim()
                                            ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                                            : 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        fontSize: '1.1rem',
                                        cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: isLoading ? 0.5 : 1
                                    }}
                                >
                                    ↗
                                </motion.button>
                            </div>
                        )}

                        {/* Close hint for quick tips */}
                        {chatMode === 'quick' && !isLoading && messages.length > 0 && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                color: 'rgba(255,255,255,0.5)'
                            }}>
                                Click the bubble to close
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
