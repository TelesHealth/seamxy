import { useState } from "react";
import { Ruler, ChevronUp, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cmToFeetInches, feetInchesToCm } from "@/lib/sizeRecommendation";

interface HeightCalibrationProps {
  initialHeightCm?: number | null;
  onSaved?: (heightCm: number) => void;
}

export function HeightCalibration({ initialHeightCm, onSaved }: HeightCalibrationProps) {
  const [unit, setUnit] = useState<"cm" | "ft">("ft");
  const [cm, setCm] = useState<number>(initialHeightCm ?? 170);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const { feet, inches } = cmToFeetInches(cm);

  const adjustCm = (delta: number) => {
    setCm((prev) => Math.max(120, Math.min(220, prev + delta)));
    setSaved(false);
  };

  const adjustFeet = (delta: number) => {
    const newCm = feetInchesToCm(feet + delta, inches);
    setCm(Math.max(120, Math.min(220, Math.round(newCm))));
    setSaved(false);
  };

  const adjustInches = (delta: number) => {
    const newCm = feetInchesToCm(feet, inches + delta);
    setCm(Math.max(120, Math.min(220, Math.round(newCm))));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiRequest("PATCH", "/api/v1/user/height", { heightCm: cm });
      if (response.ok) {
        setSaved(true);
        onSaved?.(cm);
        toast({ title: "Height saved", description: "Your measurements will improve fit accuracy." });
      } else {
        toast({ title: "Could not save height", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving height", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Ruler className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Your Height</h3>
        <div className="ml-auto flex gap-1">
          <Button
            size="sm"
            variant={unit === "ft" ? "default" : "outline"}
            onClick={() => setUnit("ft")}
            data-testid="button-unit-ft"
          >
            ft/in
          </Button>
          <Button
            size="sm"
            variant={unit === "cm" ? "default" : "outline"}
            onClick={() => setUnit("cm")}
            data-testid="button-unit-cm"
          >
            cm
          </Button>
        </div>
      </div>

      {unit === "cm" ? (
        <div className="flex items-center justify-center gap-4">
          <Button size="icon" variant="outline" onClick={() => adjustCm(-1)} data-testid="button-cm-down">
            <ChevronDown className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[80px]">
            <span className="text-3xl font-bold" data-testid="text-height-cm">{cm}</span>
            <span className="text-lg text-muted-foreground ml-1">cm</span>
          </div>
          <Button size="icon" variant="outline" onClick={() => adjustCm(1)} data-testid="button-cm-up">
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => adjustFeet(1)} data-testid="button-feet-up">
              <ChevronUp className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <span className="text-3xl font-bold" data-testid="text-height-feet">{feet}</span>
              <span className="text-lg text-muted-foreground ml-1">ft</span>
            </div>
            <Button size="icon" variant="outline" onClick={() => adjustFeet(-1)} data-testid="button-feet-down">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => adjustInches(1)} data-testid="button-inches-up">
              <ChevronUp className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <span className="text-3xl font-bold" data-testid="text-height-inches">{inches}</span>
              <span className="text-lg text-muted-foreground ml-1">in</span>
            </div>
            <Button size="icon" variant="outline" onClick={() => adjustInches(-1)} data-testid="button-inches-down">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Approx. {cm} cm · {feet}′{inches}″
      </p>

      <Button
        className="w-full"
        onClick={handleSave}
        disabled={isSaving || saved}
        data-testid="button-save-height"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Saved
          </>
        ) : isSaving ? (
          "Saving..."
        ) : (
          "Save Height"
        )}
      </Button>
    </Card>
  );
}
