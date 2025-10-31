'use client';

import React from 'react';
import { BotIcon, ChevronDownIcon } from './icons/Icons';

export default function ChatHeader({ onClose }: { onClose: () => void }) {
  try {
    return (
      <div 
        className="bg-[var(--primary-color)] px-4 py-3 shadow-sm"
        data-name="chat-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg  bg-opacity-20 flex items-center justify-center">
              <BotIcon className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Customer Service AI</h1>
              <p className="text-xs text-white text-opacity-80">Online now</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-blue-950 hover:bg-opacity-10 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <ChevronDownIcon className="text-white" size={18} />
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ChatHeader component error:', error);
    return null;
  }
}