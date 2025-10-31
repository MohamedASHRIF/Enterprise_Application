"use client";

import React from 'react';
import { BotIcon } from './icons/Icons';

export default function LoadingDots() {
  try {
    return (
      <div 
        className="flex justify-start"
        data-name="loading-dots"
      >
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
            <BotIcon className="text-[var(--text-secondary)]" size={12} />
          </div>
          <div className="chat-bubble chat-bubble-ai p-2.5 flex items-center">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('LoadingDots component error:', error);
    return null;
  }
}