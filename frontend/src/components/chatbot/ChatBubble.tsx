"use client";
import React from "react";
import styles from "./chatbot.module.css";

type Props = {
  message: string;
  sender: "user" | "bot";
};

export default function ChatBubble({ message, sender }: Props) {
  const cls = sender === "user" ? styles.bubbleUser : styles.bubbleBot;
  return (
    <div className={styles.messageRow + (sender === "user" ? ` ${styles.right}` : ` ${styles.left}`)}>
      <div className={cls}>
        <div className={styles.bubbleText}>{message}</div>
      </div>
    </div>
  );
}
