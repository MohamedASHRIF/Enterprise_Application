"use client";

import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingDots from './LoadingDots';
import { chatAgentHandler } from '@/app/utils/chatAgent';  // Adjusted import path
import { MessageCircleIcon, CloseIcon } from './icons/Icons';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, _setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">Something went wrong. Please refresh.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
      {
        id: 1,
        role: 'ai',
        content: 'Hello! I\'m your AI assistant for customer service. How can I help with bookings, vehicles, or appointments?',
        timestamp: new Date().toISOString()
      }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (userMessage: string) => {
      const newUserMessage = {
        id: Date.now(),
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, newUserMessage]);
      setIsLoading(true);

      try {
        const chatHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const aiResponse = await chatAgentHandler(userMessage, chatHistory);

        const aiMessage = {
          id: Date.now() + 1,
          role: 'ai',
          content: aiResponse,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1,
          role: 'ai',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <ErrorBoundary>
        <div className="chat-widget-container" data-name="chat-widget">
          {isOpen && (
            <div className="chat-widget-window w-[380px] h-[600px] max-h-[80vh]">
              <ChatHeader onClose={() => setIsOpen(false)} />
              <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin bg-[var(--bg-chat)]">
                <div className="space-y-3">
                  {messages.map(message => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && <LoadingDots />}
                </div>
              </div>
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          )}
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="chat-toggle-button"
            aria-label="Toggle chat"
          >
            {isOpen ? (
              <CloseIcon className="text-3xl" size={18} />
            ) : (
              <MessageCircleIcon className="text-3xl" size={20} />
            )}
          </button>
        </div>
      </ErrorBoundary>
    );
}