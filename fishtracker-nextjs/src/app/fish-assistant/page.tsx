"use client";

import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '../../components/PageHeader';
import { ChatMessage } from '../../types/dto';
import { fishTrackerApi } from '../../services/fishTrackerApi';
import { deviceIdService } from '../../services/deviceIdService';

const FishAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      isUser: false,
      content: "Welcome to the Fish Assistant!",
      timeStamp: new Date().toISOString(),
    };
    const introMessage: ChatMessage = {
      isUser: false,
      content: "How can I help you today?",
      timeStamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage, introMessage]);

    const currentDeviceId = deviceIdService.getOrCreateDeviceId();
    setDeviceId(currentDeviceId);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendChat = async () => {
    if (!userInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      isUser: true,
      content: userInput,
      timeStamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setChatLoading(true);

    try {
      const response = await fishTrackerApi.chat(deviceId, { message: userInput });
      const assistantMessage: ChatMessage = {
        isUser: false,
        content: response.data.response,
        timeStamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send chat message:", error);
      const errorMessage: ChatMessage = {
        isUser: false,
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        timeStamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Fish Assistant" />
      <div ref={chatContainerRef} className="flex-grow overflow-auto p-4 bg-gray-100">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`rounded-lg px-4 py-2 ${message.isUser ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
            placeholder="Type your message..."
            className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={chatLoading}
          />
          <button
            onClick={handleSendChat}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
            disabled={chatLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default FishAssistantPage;

