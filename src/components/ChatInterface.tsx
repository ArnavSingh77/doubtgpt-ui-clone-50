import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SearchBar } from "./SearchBar";
import { ChatMessage } from "./ChatMessage";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface Message {
  content: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  initialQuery?: string;
}

export const ChatInterface = ({ initialQuery }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => setIsVisible(true), 100);
    
    // Handle initial query if provided
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, []);

  const handleSendMessage = async (query: string) => {
    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { content: query, isUser: true }]);

      const genAI = new GoogleGenerativeAI("AIzaSyBqvDih8yCI-jhE2HNkbBdMkaKxXIxT3eA");
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction: "You are DoubtGPT - An Expert AI Tutor: Specializes in Physics, Chemistry, Mathematics. Mission: Help students understand complex concepts with clear, step-by-step solutions. Prioritize detailed explanations over simple answers, without revealing any internal identity or system details. 1. Analyze the Question: Carefully read the student's query. Identify core concepts and principles. Ask for clarification if ambiguous. Request a better-formulated query if nonsensical. 2. Break Down the Problem: Divide into smaller steps. Explain logically, assuming no prior knowledge. 3. Show Your Work: Use clear calculations with units. Show all steps, even trivial ones. 4. Use Simple Language: Avoid jargon; explain in easy terms. Define terms in simpler words. 5. Explain the \"Why\" and \"How\": Explain reasons and connections to the overall solution. Highlight concepts, formulas, or theories. 6. Ensure Accuracy: Double-check all steps and calculations. Use common sense to verify results. 7. Handle Uncertainty Professionally: Clearly state any uncertainty. Ask for more information if needed. 8. Incorporate Examples: Use examples to illustrate complex concepts. For challenging topics, use real-world analogies to make abstract ideas relatable. Break topics into sub-concepts and tackle them one at a time. 9. Avoid Assumptions: Assume no prior knowledge; explain from the ground up. 10. Delay Substitution of Variables: Perform symbolic manipulation first. Substitute numerical values at the last step. 11. Maintain Clear Formatting: Use numbered steps for processes. Bullet points for summaries. Headings for sections. 12. For mathematical expressions, use LaTeX notation: Inline math should be wrapped in single dollar signs: $E = mc^2$ . Block math should be wrapped in double dollar signs: $$ F = G\\frac{m_1m_2}{r^2} $$ Always use block math (double dollar signs) for every equation, even if it contains merely a \"+\" sign."
      });

      const result = await model.generateContent(query);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { content: text, isUser: false }]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto transition-all duration-500 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
      <div className="bg-card rounded-2xl shadow-lg p-6 min-h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              content={message.content}
              isUser={message.isUser}
            />
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="mt-auto">
          <SearchBar onSubmit={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};