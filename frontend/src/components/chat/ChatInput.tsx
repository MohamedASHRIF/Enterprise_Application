'use client';

import React, { useState } from 'react';
import { SendIcon } from './icons/Icons';

export default function ChatInput({ onSendMessage, isLoading }: { onSendMessage: (msg: string) => void; isLoading: boolean }) {
  try {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSendMessage(input.trim());
        setInput('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // call submit on Enter
        // call handleSubmit with a minimal fake event to satisfy typing
        handleSubmit({ preventDefault() {} } as React.FormEvent<HTMLFormElement>);
      }
    };

    return (
      <div 
        className="bg-white border-t border-[var(--border-color)] px-3 py-3"
        data-name="chat-input"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                
                placeholder="Type a message..."
                disabled={isLoading}
                rows={1}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] 
                         focus:border-transparent resize-none disabled:bg-gray-50
                         disabled:cursor-not-allowed text-sm"
                style={{ minHeight: '40px', maxHeight: '100px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-4 bg-[var(--primary-color)] text-white rounded-lg 
                       hover:bg-[var(--accent-color)] transition-colors disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center justify-center"
            >
              <SendIcon className="text-white" size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  } catch (error) {
    console.error('ChatInput component error:', error);
    return null;
  }
}