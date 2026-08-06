import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { TRAINING_QUESTIONS, type TrainingQuestion } from "@shared/training-questions";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSupplierAuth } from "@/lib/supplier-auth";

const SECTION_TITLES = {
  philosophy: "Style Philosophy",
  client_approach: "Client Approach", 
  expertise: "Expertise & Specialties",
  personality: "Personality & Voice"
};

const SECTION_DESCRIPTIONS = {
  philosophy: "Help us understand your unique design aesthetic and fashion philosophy",
  client_approach: "Share your approach to working with clients and understanding their needs",
  expertise: "Tell us about your specialized knowledge and areas of expertise",
  personality: "Let your authentic voice shine through - this shapes how your AI communicates"
};

interface TrainingResponse {
  id: string;
  stylistId: string;
  questionId: string;
  questionText: string;
  answer: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function AiTraining() {
  const { toast } = useToast();
  const { supplier, profile } = useSupplierAuth();
  const [currentSection, setCurrentSection] = useState<"philosophy" | "client_approach" | "expertise" | "personality">("philosophy");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Load stylist profile to get ID
  const { data: stylistProfile, isLoading: isLoadingProfile } = useQuery<any>({
    queryKey: [`/api/v1/supplier/${supplier?.id}/stylist-profile`],
    enabled: !!supplier?.id,
  });
  
  const stylistId = stylistProfile?.id;
  
  // Load existing responses
  const { data: existingResponses = [], isLoading: isLoadingResponses } = useQuery<TrainingResponse[]>({
    queryKey: [`/api/v1/stylist/${stylistId}/training-responses`],
    enabled: !!stylistId,
  });
  
  // Initialize responses from existing data
  useEffect(() => {
    if (existingResponses.length > 0) {
      const responseMap: Record<string, string> = {};
      existingResponses.forEach(r => {
        responseMap[r.questionId] = r.answer;
      });
      setResponses(responseMap);
    }
  }, [existingResponses]);
  
  // Save response mutation
  const saveResponseMutation = useMutation({
    mutationFn: async ({ questionId, questionText, answer, category }: { questionId: string; questionText: string; answer: string; category: string }) => {
      return apiRequest('POST', `/api/v1/stylist/${stylistId}/training-responses`, { questionId, questionText, answer, category });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/stylist/${stylistId}/training-responses`] });
      setHasUnsavedChanges(false);
    }
  });
  
  // Generate prompt mutation
  const generatePromptMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/v1/stylist/${stylistId}/generate-prompt`);
    },
    onSuccess: () => {
      toast({
        title: "AI Clone Generated!",
        description: "Your personalized AI stylist is ready to preview.",
      });
      // TODO: Navigate to preview page
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate AI prompt",
        variant: "destructive"
      });
    }
  });
  
  const sections = Object.keys(SECTION_TITLES) as Array<keyof typeof SECTION_TITLES>;
  const currentSectionIndex = sections.indexOf(currentSection);
  const sectionQuestions = TRAINING_QUESTIONS.filter(q => q.section === currentSection);
  
  // Calculate progress
  const totalQuestions = TRAINING_QUESTIONS.length;
  const answeredQuestions = Object.keys(responses).filter(key => responses[key]?.trim()).length;
  const progressPercent = (answeredQuestions / totalQuestions) * 100;
  const sectionAnswered = sectionQuestions.filter(q => responses[q.id]?.trim()).length;
  
  const handleAnswerChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    setHasUnsavedChanges(true);
  };
  
  const handleSaveSection = async () => {
    const questionsToSave = sectionQuestions.filter(q => responses[q.id]?.trim());
    
    for (const question of questionsToSave) {
      await saveResponseMutation.mutateAsync({
        questionId: question.id,
        questionText: question.questionText,
        answer: responses[question.id],
        category: question.section
      });
    }
    
    toast({
      title: "Section Saved",
      description: `${questionsToSave.length} responses saved successfully`,
    });
  };
  
  const handleNextSection = async () => {
    if (hasUnsavedChanges) {
      await handleSaveSection();
    }
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSection(sections[currentSectionIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSection(sections[currentSectionIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleGenerateAI = async () => {
    if (hasUnsavedChanges) {
      await handleSaveSection();
    }
    
    const requiredQuestions = TRAINING_QUESTIONS.filter(q => q.required);
    const answeredRequired = requiredQuestions.filter(q => responses[q.id]?.trim()).length;
    
    if (answeredRequired < requiredQuestions.length) {
      toast({
        title: "Incomplete Training",
        description: `Please answer all required questions (${answeredRequired}/${requiredQuestions.length} complete)`,
        variant: "destructive"
      });
      return;
    }
    
    await generatePromptMutation.mutateAsync();
  };
  
  const renderQuestionInput = (question: TrainingQuestion) => {
    const value = responses[question.id] || "";
    
    switch (question.type) {
      case "short_text":
        return (
          <Input
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="mt-2"
            data-testid={`input-question-${question.id}`}
          />
        );
        
      case "long_text":
        return (
          <Textarea
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="mt-2 min-h-[120px]"
            data-testid={`textarea-question-${question.id}`}
          />
        );
        
      case "single_select":
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleAnswerChange(question.id, val)}
            className="mt-2 space-y-2"
            data-testid={`radio-question-${question.id}`}
          >
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${idx}`} data-testid={`radio-option-${question.id}-${idx}`} />
                <Label htmlFor={`${question.id}-${idx}`} className="cursor-pointer font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case "multi_select":
        const selectedValues = value ? value.split("|||") : [];
        return (
          <div className="mt-2 space-y-2" data-testid={`checkbox-question-${question.id}`}>
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${idx}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    let newValues = [...selectedValues];
                    if (checked) {
                      if (!question.maxSelections || newValues.length < question.maxSelections) {
                        newValues.push(option);
                      }
                    } else {
                      newValues = newValues.filter(v => v !== option);
                    }
                    handleAnswerChange(question.id, newValues.join("|||"));
                  }}
                  data-testid={`checkbox-option-${question.id}-${idx}`}
                />
                <Label htmlFor={`${question.id}-${idx}`} className="cursor-pointer font-normal">
                  {option}
                </Label>
              </div>
            ))}
            {question.maxSelections && (
              <p className="text-sm text-muted-foreground">
                Select up to {question.maxSelections} options
              </p>
            )}
          </div>
        );
        
      case "scale":
        const scaleValue = value ? parseInt(value) : question.scaleMin || 1;
        return (
          <div className="mt-4 space-y-4" data-testid={`slider-question-${question.id}`}>
            <Slider
              value={[scaleValue]}
              onValueChange={([val]) => handleAnswerChange(question.id, val.toString())}
              min={question.scaleMin || 1}
              max={question.scaleMax || 10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{question.scaleLeftLabel}</span>
              <Badge variant="secondary" data-testid={`text-scale-value-${question.id}`}>{scaleValue}</Badge>
              <span>{question.scaleRightLabel}</span>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  if (isLoadingProfile) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading stylist profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!stylistId) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete your stylist profile setup first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isLoadingResponses) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading your training data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Stylist Training
              </CardTitle>
              <CardDescription className="mt-2">
                Train your AI clone to think, speak, and style like you
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" data-testid="text-progress-count">{answeredQuestions}/{totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Questions Complete</p>
            </div>
          </div>
          <Progress value={progressPercent} className="mt-4" data-testid="progress-overall" />
        </CardHeader>
      </Card>
      
      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section, idx) => {
          const sectionQs = TRAINING_QUESTIONS.filter(q => q.section === section);
          const answeredInSection = sectionQs.filter(q => responses[q.id]?.trim()).length;
          const isComplete = answeredInSection === sectionQs.length;
          
          return (
            <Button
              key={section}
              variant={currentSection === section ? "default" : "outline"}
              onClick={() => setCurrentSection(section)}
              className="flex-shrink-0 gap-2"
              data-testid={`button-section-${section}`}
            >
              {isComplete && <Check className="w-4 h-4" />}
              <span className="hidden sm:inline">{SECTION_TITLES[section]}</span>
              <span className="sm:hidden">Section {idx + 1}</span>
              <Badge variant="secondary" className="ml-1">
                {answeredInSection}/{sectionQs.length}
              </Badge>
            </Button>
          );
        })}
      </div>
      
      {/* Current Section */}
      <Card>
        <CardHeader>
          <CardTitle>{SECTION_TITLES[currentSection]}</CardTitle>
          <CardDescription>{SECTION_DESCRIPTIONS[currentSection]}</CardDescription>
          <Progress value={(sectionAnswered / sectionQuestions.length) * 100} className="mt-2" data-testid="progress-section" />
        </CardHeader>
        <CardContent className="space-y-8">
          {sectionQuestions.map((question, idx) => (
            <div key={question.id} className="space-y-2 pb-6 border-b last:border-0">
              <div className="flex items-start gap-2">
                <Label className="text-base font-medium flex-1">
                  {idx + 1}. {question.questionText}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {question.note && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{question.note}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              {question.example && (
                <Alert className="bg-muted/50 border-muted">
                  <AlertDescription className="text-sm">
                    <span className="font-medium">Example:</span> {question.example}
                  </AlertDescription>
                </Alert>
              )}
              
              {renderQuestionInput(question)}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePreviousSection}
            disabled={currentSectionIndex === 0}
            data-testid="button-previous-section"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveSection}
              disabled={!hasUnsavedChanges || saveResponseMutation.isPending}
              data-testid="button-save-section"
            >
              {saveResponseMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
            
            {currentSectionIndex === sections.length - 1 ? (
              <Button
                onClick={handleGenerateAI}
                disabled={generatePromptMutation.isPending}
                data-testid="button-generate-ai"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generatePromptMutation.isPending ? "Generating..." : "Generate AI Clone"}
              </Button>
            ) : (
              <Button
                onClick={handleNextSection}
                data-testid="button-next-section"
              >
                Next Section
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> The more detailed and authentic your responses, the better your AI clone will represent you. 
            Don't worry about being perfect - your unique voice and perspective is what makes you valuable!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
