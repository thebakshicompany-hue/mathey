import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Smile, Trophy, Zap } from 'lucide-react';
import { ChatMessage } from '../../types/game';

interface ChatSystemProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  playerName: string;
  isGameActive: boolean;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  messages,
  onSendMessage,
  playerName,
  isGameActive
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickMessages = [
    { text: "Good luck! 🍀", emoji: "🍀" },
    { text: "Nice job! 👏", emoji: "👏" },
    { text: "So close! 😅", emoji: "😅" },
    { text: "Amazing! 🤩", emoji: "🤩" },
    { text: "Let's go! 🚀", emoji: "🚀" },
    { text: "GG! 🎮", emoji: "🎮" }
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (!isOpen && messages.length > 0) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickMessage = (message: string) => {
    onSendMessage(message);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'system':
        return <Zap className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        } transition-all duration-200`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <span className="text-white text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </motion.div>
            )}
          </>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 h-96 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl z-40 flex flex-col"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">Game Chat</h3>
                <div className="flex-1"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.playerName === playerName ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`max-w-[70%] ${
                      message.type === 'system' 
                        ? 'bg-blue-500/20 border border-blue-400/30' 
                        : message.type === 'achievement'
                        ? 'bg-yellow-500/20 border border-yellow-400/30'
                        : message.playerName === playerName
                        ? 'bg-blue-500/30 border border-blue-400/30'
                        : 'bg-white/10 border border-white/20'
                    } rounded-xl p-3`}>
                      {message.type !== 'system' && (
                        <div className="flex items-center space-x-2 mb-1">
                          {getMessageIcon(message.type)}
                          <span className="text-xs font-semibold text-gray-300">
                            {message.playerName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <p className={`text-sm ${
                        message.type === 'system' ? 'text-blue-300 text-center' :
                        message.type === 'achievement' ? 'text-yellow-300' :
                        'text-white'
                      }`}>
                        {message.message}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Messages */}
            {!isGameActive && (
              <div className="px-4 py-2 border-t border-white/20">
                <div className="flex flex-wrap gap-2">
                  {quickMessages.map((quick, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickMessage(quick.text)}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {quick.emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  maxLength={100}
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                    newMessage.trim()
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                  }`}
                  whileHover={newMessage.trim() ? { scale: 1.05 } : {}}
                  whileTap={newMessage.trim() ? { scale: 0.95 } : {}}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};