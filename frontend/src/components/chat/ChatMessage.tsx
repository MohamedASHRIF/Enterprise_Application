'use client';

import React from 'react';
import { UserIcon, BotIcon } from './icons/Icons';

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

export default function ChatMessage({ message }: { message: Message }) {
  try {
    const isUser = message.role === 'user';
    const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        data-name="chat-message"
      >
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-[85%]`}>
          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
            isUser ? 'bg-[var(--primary-color)] ml-2' : 'bg-gray-200 mr-2'
          }`}>
            {isUser ? (
              <UserIcon className="text-white" size={14} />
            ) : (
              <BotIcon className="text-[var(--text-secondary)]" size={14} />
            )}
          </div>
          <div className="flex-1">
            <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} p-2.5`}>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 px-1">{time}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ChatMessage component error:', error);
    return null;
  }
}