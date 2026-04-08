import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: any;
}

export function useChat() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isGenerating) return;

    const userMessage: Message = { role: 'user', content: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, auto_save: true }),
      });

      const data = await response.json();
      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          data: data.data,
        };
        setChatHistory((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('请求失败:', error);
    } finally {
      setIsGenerating(false);
      setMessage('');
    }
  };

  return {
    message,
    setMessage,
    chatHistory,
    isGenerating,
    handleSubmit,
  };
}
