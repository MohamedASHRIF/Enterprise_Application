// components/ui/scroll-area.jsx
import React from "react";

export function ScrollArea({ children, className = "", height = "h-64" }) {
  return (
    <div
      className={`overflow-y-auto ${height} rounded-lg border border-gray-200 p-2 ${className}`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#CBD5E1 #F1F5F9",
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        div::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 8px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
      {children}
    </div>
  );
}
