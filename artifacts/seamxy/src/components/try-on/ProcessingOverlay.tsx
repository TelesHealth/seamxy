import { Progress } from "@/components/ui/progress";
import { Shirt } from "lucide-react";

interface ProcessingOverlayProps {
  progress: number;
  message?: string;
}

export function ProcessingOverlay({ progress, message }: ProcessingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
      <div className="relative mb-8">
        <div className="w-32 h-40 bg-muted rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/5 animate-pulse" />
          <div className="absolute inset-0 flex flex-col justify-around py-4">
            <div className="h-0.5 bg-primary animate-pulse" />
            <div className="h-0.5 bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="h-0.5 bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
            <div className="h-0.5 bg-primary animate-pulse" style={{ animationDelay: "0.6s" }} />
          </div>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shirt className="w-6 h-6 text-primary animate-bounce" />
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">Analyzing Your Photo</h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {message || "Detecting body shape and measurements..."}
      </p>
      <div className="w-48 mb-2">
        <Progress value={progress} className="h-2" />
      </div>
      <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
    </div>
  );
}
