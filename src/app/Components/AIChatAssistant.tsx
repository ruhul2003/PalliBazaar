"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, ShoppingBag, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    district: string;
    shortDescription: string;
    category: string;
    image: string;
  }>;
}

export default function AIChatAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "Browse fresh crops",
    "Show handicrafts",
    "What is PalliBazaar?",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Load welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi ${user ? user.name.split(" ")[0] : "there"}! 👋 Welcome to PalliBazaar AI Assistant. I can help you search local crops, dairy products, handicrafts, check your cart, or answer platform questions. How can I help you today?`
        }
      ]);
    }
  }, [isOpen, messages.length, user]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!res.ok) throw new Error("Failed to connect to AI server");

      const data = await res.json();
      
      let products = undefined;
      if (data.products && Array.isArray(data.products)) {
        products = data.products;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I encountered an issue.",
        products
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.suggestedPrompts && data.suggestedPrompts.length > 0) {
        setSuggestedPrompts(data.suggestedPrompts);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "❌ Sorry, I'm having trouble connecting. Please make sure the Gemini API key is configured correctly in .env.local.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-5 py-4 bg-primary text-white rounded-full shadow-2xl hover:bg-primary-hover transition-colors focus:outline-none cursor-pointer"
            id="open-ai-chat-btn"
          >
            <Sparkles className="w-5 h-5 animate-pulse text-accent" />
            <span className="font-semibold text-sm">Bazaar Assistant</span>
            <MessageSquare className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[90vw] sm:w-[400px] h-[550px] bg-white border border-border-light rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary-hover rounded-lg">
                  <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">PalliBazaar AI Agent</h3>
                  <span className="text-[10px] text-accent-light">Online & Ready to Assist</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-primary-hover rounded-full transition-colors text-white focus:outline-none cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                    
                    {/* Inline Products display */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-primary block mb-1">Found Products:</span>
                        {msg.products.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/products/${prod.id}`}
                            className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-100 hover:border-accent hover:bg-accent-light transition-colors block text-left bg-white"
                            onClick={() => setIsOpen(false)}
                          >
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-10 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary-light rounded-md flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className="flex-grow min-w-0">
                              <h4 className="font-semibold text-xs text-slate-900 truncate leading-tight">{prod.name}</h4>
                              <div className="flex items-center gap-2 text-[10px] text-slate-550 mt-0.5">
                                <span className="font-bold text-primary">{prod.price} BDT</span>
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {prod.district}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>AI is finding products...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {suggestedPrompts.length > 0 && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-xs bg-white text-primary border border-border-light px-2.5 py-1 rounded-full hover:bg-primary-light hover:text-primary transition-colors cursor-pointer font-medium focus:outline-none"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about crops, district origin, orders..."
                className="flex-grow text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-slate-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none cursor-pointer"
                id="send-message-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
