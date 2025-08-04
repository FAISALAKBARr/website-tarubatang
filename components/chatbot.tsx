"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  MapPin,
  Mountain,
  Camera,
  Home,
  Phone,
  Info,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  fallback?: boolean;
  error?: boolean;
}

interface ChatbotProps {
  className?: string;
}

const QUICK_QUESTIONS = [
  {
    icon: Mountain,
    text: "Bagaimana cara mendaki Gunung Merbabu?",
    category: "Pendakian",
  },
  {
    icon: Home,
    text: "Rekomendasi basecamp untuk menginap?",
    category: "Penginapan",
  },
  {
    icon: MapPin,
    text: "Destinasi wisata apa saja yang ada?",
    category: "Wisata",
  },
  {
    icon: Camera,
    text: "Spot foto terbaik di Tarubatang?",
    category: "Fotografi",
  },
  {
    icon: Phone,
    text: "Bagaimana cara menghubungi pemandu?",
    category: "Kontak",
  },
  {
    icon: Info,
    text: "Berapa biaya wisata ke Tarubatang?",
    category: "Informasi",
  },
];

export default function Chatbot({ className = "" }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Halo! 👋 Selamat datang di Desa Tarubatang! Saya adalah asisten virtual yang siap membantu Anda dengan informasi tentang wisata, penginapan, dan segala hal tentang desa kami. \n\nAda yang bisa saya bantu? Anda bisa bertanya tentang:\n• Destinasi wisata\n• Jalur pendakian Merbabu\n• Basecamp dan penginapan\n• Fasilitas dan layanan\n• Tips berkunjung",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "online" | "offline" | "fallback"
  >("online");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText.trim(),
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update connection status based on response
      if (data.fallback) {
        setConnectionStatus("fallback");
      } else if (data.powered_by) {
        setConnectionStatus("online");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        fallback: data.fallback,
        error: data.error,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setConnectionStatus("offline");

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Maaf, saya sedang mengalami gangguan koneksi. Silakan coba lagi dalam beberapa saat atau hubungi admin website untuk bantuan langsung.",
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Chat telah dibersihkan. Ada yang bisa saya bantu?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
    setConnectionStatus("online");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "online":
        return <Wifi className="h-3 w-3 text-green-400" />;
      case "fallback":
        return <AlertCircle className="h-3 w-3 text-yellow-400" />;
      case "offline":
        return <WifiOff className="h-3 w-3 text-red-400" />;
      default:
        return <Wifi className="h-3 w-3 text-green-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "online":
        return "AI Online";
      case "fallback":
        return "Mode Dasar";
      case "offline":
        return "Offline";
      default:
        return "Online";
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ring-2 ring-green-300 ring-opacity-30"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-12 right-0 bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
          Tanya tentang Desa Tarubatang
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card
        className={`w-96 shadow-2xl transition-all duration-300 ${
          isMinimized ? "h-16" : "h-[600px]"
        }`}
      >
        {/* Header */}
        <CardHeader className="pb-3 bg-green-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-8 w-8" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <CardTitle className="text-lg">Asisten Tarubatang</CardTitle>
                <div className="flex items-center space-x-1 text-green-100 text-sm">
                  {getStatusIcon()}
                  <span>{getStatusText()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-green-700 h-8 w-8 p-0"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-700 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
            {/* Connection Status Banner */}
            {connectionStatus === "fallback" && (
              <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
                <div className="flex items-center space-x-2 text-yellow-800 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  <span>Mode dasar aktif - Respons otomatis</span>
                </div>
              </div>
            )}

            {connectionStatus === "offline" && (
              <div className="bg-red-50 border-b border-red-200 px-4 py-2">
                <div className="flex items-center space-x-2 text-red-800 text-xs">
                  <WifiOff className="h-3 w-3" />
                  <span>Koneksi terputus - Coba lagi nanti</span>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-green-600 text-white"
                          : message.error
                          ? "bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-100"
                          : message.fallback
                          ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100"
                          : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === "assistant" && (
                          <div className="flex items-center">
                            <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                            {message.fallback && (
                              <AlertCircle className="h-3 w-3 ml-1 mt-1 flex-shrink-0" />
                            )}
                            {message.error && (
                              <WifiOff className="h-3 w-3 ml-1 mt-1 flex-shrink-0" />
                            )}
                          </div>
                        )}
                        {message.role === "user" && (
                          <User className="h-4 w-4 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm leading-relaxed">
                            {formatMessage(message.content)}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              message.role === "user"
                                ? "text-green-100"
                                : message.error
                                ? "text-red-600 dark:text-red-400"
                                : message.fallback
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                            {message.fallback && " • Mode Dasar"}
                            {message.error && " • Error"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Pertanyaan populer:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_QUESTIONS.slice(0, 4).map((question, index) => {
                    const IconComponent = question.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickQuestion(question.text)}
                        className="text-left h-auto p-2 justify-start"
                        disabled={isLoading}
                      >
                        <IconComponent className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="text-xs truncate">
                          {question.text}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-white dark:bg-gray-950">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tanya tentang Desa Tarubatang..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {messages.length > 2 && (
                <div className="flex justify-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Bersihkan Chat
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
