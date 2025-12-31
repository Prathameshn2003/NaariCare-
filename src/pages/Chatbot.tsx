import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const suggestedQuestions = [
  "What are the symptoms of PCOS?",
  "How can I track my menstrual cycle?",
  "What foods help with hormonal balance?",
  "When should I see a doctor?",
];

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your NaariCare Health Assistant 🌸 I'm here to help you with questions about women's health, menstrual cycles, PCOS, menopause, and general wellness. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "pcos": "PCOS (Polycystic Ovary Syndrome) is a hormonal disorder common among women of reproductive age. Common symptoms include irregular periods, excess androgen levels, and polycystic ovaries. Would you like me to tell you more about treatment options or lifestyle changes that can help?",
        "cycle": "Tracking your menstrual cycle is a great way to understand your body! You can use our Menstrual Health module to log your periods, symptoms, and get predictions. The average cycle is 28 days, but anywhere from 21-35 days is considered normal. Would you like tips on what to track?",
        "food": "A balanced diet can significantly impact hormonal health! Foods rich in fiber, lean proteins, and anti-inflammatory ingredients like leafy greens, fatty fish, and berries are excellent choices. Limiting processed foods and sugar can also help. Shall I suggest a sample meal plan?",
        "doctor": "It's important to consult a healthcare provider if you experience: irregular periods lasting more than 3 months, severe pain, heavy bleeding, or symptoms affecting your daily life. Would you like me to help you find doctors or healthcare providers near you?",
      };

      let response = "I understand you're asking about women's health. While I can provide general information, please remember that I'm an AI assistant and not a substitute for professional medical advice. Could you tell me more specifically what you'd like to know about?";

      const lowerText = messageText.toLowerCase();
      if (lowerText.includes("pcos") || lowerText.includes("symptom")) {
        response = responses.pcos;
      } else if (lowerText.includes("cycle") || lowerText.includes("track") || lowerText.includes("period")) {
        response = responses.cycle;
      } else if (lowerText.includes("food") || lowerText.includes("diet") || lowerText.includes("eat")) {
        response = responses.food;
      } else if (lowerText.includes("doctor") || lowerText.includes("see") || lowerText.includes("consult")) {
        response = responses.doctor;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-4 flex flex-col">
        <div className="container mx-auto px-4 flex-1 flex flex-col max-w-3xl">
          {/* Header */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">AI Health Assistant</span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Chat with NaariCare
            </h1>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-accent text-accent-foreground rounded-br-md"
                      : "glass-card rounded-bl-md"
                  }`}
                >
                  <p className={`text-sm leading-relaxed ${message.role === "user" ? "" : "text-foreground"}`}>
                    {message.content}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="w-5 h-5 text-foreground" />
                </div>
                <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 2 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/20 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="glass-card rounded-2xl p-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about women's health..."
              className="flex-1 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              variant="accent"
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            This AI assistant provides general information only. Always consult a healthcare provider for medical advice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
