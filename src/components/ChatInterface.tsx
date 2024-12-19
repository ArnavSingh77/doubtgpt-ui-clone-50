import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SearchBar } from "./SearchBar";
import { ChatMessage } from "./ChatMessage";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";

interface Message {
  content: string;
  isUser: boolean;
  image?: string;
}

interface ChatInterfaceProps {
  initialQuery?: string;
}

const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ChatInterface = ({ initialQuery }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, []);

  const handleSendMessage = async (query: string, image?: File) => {
    try {
      setIsLoading(true);
      console.log("Processing message with image:", image ? "Yes" : "No");

      let imageUrl: string | undefined;
      let base64Image: string | undefined;

      if (image) {
        imageUrl = URL.createObjectURL(image);
        base64Image = await convertImageToBase64(image);
        console.log("Image converted to base64");
      }

      // Add user message with image to chat
      setMessages((prev) => [...prev, {
        content: query || "Image analysis request",
        isUser: true,
        image: imageUrl
      }]);

      const genAI = new GoogleGenerativeAI("AIzaSyBqvDih8yCI-jhE2HNkbBdMkaKxXIxT3eA");
      // Using a different model with potentially higher quotas
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      let result;
      let retries = 3;
      
      while (retries > 0) {
        try {
          if (image && base64Image) {
            console.log("Sending image to Gemini");
            const imageParts = base64Image.split(',');
            const base64Data = imageParts[1];
            
            result = await model.generateContent([
              {
                inlineData: {
                  data: base64Data,
                  mimeType: image.type
                }
              },
              query || "Please analyze this image"
            ]);
          } else {
            console.log("Sending text-only query to Gemini");
            result = await model.generateContent(query);
          }
          break; // If successful, exit the retry loop
        } catch (error: any) {
          console.log("Gemini API error:", error);
          if (error.status === 429 && retries > 1) {
            retries--;
            console.log(`Rate limited. Retrying in 2 seconds... (${retries} retries left)`);
            await delay(2000); // Wait 2 seconds before retrying
            continue;
          }
          throw error; // If we're out of retries or it's a different error, rethrow
        }
      }

      if (!result) {
        throw new Error("Failed to generate response after retries");
      }

      const response = await result.response;
      const text = response.text();
      console.log("Received response from Gemini");

      setMessages((prev) => [...prev, { content: text, isUser: false }]);
    } catch (error: any) {
      console.error("Error generating response:", error);
      let errorMessage = "Failed to generate response. Please try again.";
      
      if (error.status === 429) {
        errorMessage = "We've hit the API rate limit. Please try again in a few minutes.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      description: "Chat history cleared",
      duration: 2000,
    });
  };

  return (
    <div className={`w-full max-w-4xl mx-auto transition-all duration-500 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
      <div className="bg-card rounded-2xl shadow-lg p-6 min-h-[600px] flex flex-col">
        <div className="flex justify-end mb-4">
          {messages.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearChat}
            >
              Clear Chat
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              content={message.content}
              isUser={message.isUser}
              image={message.image}
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