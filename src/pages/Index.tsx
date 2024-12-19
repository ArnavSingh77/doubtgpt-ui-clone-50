import { Brain, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { SearchBar } from "@/components/SearchBar";
import { FeatureCard } from "@/components/FeatureCard";
import { StatCard } from "@/components/StatCard";

const Index = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  const handleSearchSubmit = (query: string) => {
    setInitialQuery(query);
    setIsChatVisible(true);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-primary">DoubtGPT</h1>
          <p className="text-xl text-muted-foreground">
            One-stop to all your doubts.
          </p>
        </div>

        {/* Search/Chat Section */}
        <div className="min-h-[600px] flex items-start justify-center">
          <div className={`w-full transition-all duration-500 ease-in-out ${isChatVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            {isChatVisible ? (
              <ChatInterface initialQuery={initialQuery} />
            ) : null}
          </div>

          <div className={`search-container transition-all duration-500 ease-in-out ${isChatVisible ? 'scale-95 opacity-0 hidden' : 'scale-100 opacity-100'}`}>
            <SearchBar onSubmit={handleSearchSubmit} />
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 mt-24">
          <FeatureCard
            icon={Brain}
            title="Smart Solutions"
            description="Provide detailed, step-by-step solutions to complex academic problems across various subjects."
          />
          <FeatureCard
            icon={Clock}
            title="24/7 Availability"
            description="Access educational resources anytime, anywhere, with our always-available platform."
          />
          <FeatureCard
            icon={CheckCircle}
            title="Verified Content"
            description="Every solution is thoroughly verified for accuracy and clarity by our expert team."
          />
        </div>

        {/* Stats */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-primary/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="10K+" label="Questions Solved" />
            <StatCard value="10K+" label="Happy Students" />
            <StatCard value="20+" label="Subjects Covered" />
            <StatCard value="99%" label="Accuracy Rate" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;