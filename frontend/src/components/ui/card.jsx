// components/ui/card.jsx
import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-blue-200 border border-gray-500 rounded-2xl shadow-sm p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold  text-gray-800 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`bg-white rounded-lg text-gray-700 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={`mt-4 pt-3 border-t border-gray-200 flex justify-end gap-2 ${className}`}
    >
      {children}
    </div>
  );
}
