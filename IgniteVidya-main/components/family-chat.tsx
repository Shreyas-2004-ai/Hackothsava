"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Shield, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  message_text: string;
  created_at: string;
  is_admin_message: boolean;
  message_type: string;
  sender: {
    first_name: string;
    last_name: string;
    photo_url?: string;
    is_admin: boolean;
  };
}

interface FamilyChatProps {
  familyId: string;
  isAdmin?: boolean;
}

export default function FamilyChat({
  familyId,
  isAdmin = false,
}: FamilyChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [familyId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/messages/list?family_id=${familyId}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        setError(data.error || "Failed to load messages");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("family-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "family_messages",
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          // Fetch the complete message with sender info
          fetchMessageWithSender(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchMessageWithSender = async (messageId: string) => {
    const { data } = await supabase
      .from("family_messages")
      .select(
        "*, sender:family_members(first_name, last_name, photo_url, is_admin)"
      )
      .eq("id", messageId)
      .single();

    if (data) {
      setMessages((prev) => [...prev, data as Message]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_text: newMessage,
          family_id: familyId,
          is_admin_message: isAdmin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewMessage("");
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - Only show if not in floating widget */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">Family Chat</h2>
        <p className="text-sm opacity-90">Stay connected with your family</p>
      </div> */}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.message_type === "system"
                  ? "justify-center"
                  : "justify-start"
              }`}
            >
              {message.message_type === "system" ? (
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {message.message_text}
                </div>
              ) : (
                <div className="flex gap-3 max-w-[70%]">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.sender.photo_url ? (
                      <img
                        src={message.sender.photo_url}
                        alt={message.sender.first_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {message.sender.first_name[0]}
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {message.sender.first_name} {message.sender.last_name}
                      </span>
                      {message.sender.is_admin && (
                        <span title="Admin">
                          <Shield className="w-4 h-4 text-blue-600" />
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.is_admin_message
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      {message.message_text}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm border-t border-red-200">
          {error}
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={sendMessage}
        className="p-3 bg-white border-t border-gray-200"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
