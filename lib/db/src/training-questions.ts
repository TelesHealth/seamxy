import { z } from "zod";

export type QuestionType = "short_text" | "long_text" | "single_select" | "multi_select" | "scale";

export interface TrainingQuestion {
  id: string;
  section: "philosophy" | "client_approach" | "expertise" | "personality";
  questionText: string;
  type: QuestionType;
  required: boolean;
  placeholder?: string;
  example?: string;
  note?: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLeftLabel?: string;
  scaleRightLabel?: string;
  maxSelections?: number;
}

export const TRAINING_QUESTIONS: TrainingQuestion[] = [
  {
    id: "PHIL_01",
    section: "philosophy",
    questionText: "Describe your personal design aesthetic in 3-5 words.",
    type: "short_text",
    required: true,
    placeholder: "e.g., 'Modern minimalist with streetwear edge'"
  },
  {
    id: "PHIL_02",
    section: "philosophy",
    questionText: "Who are your top 3 style icons or inspirations?",
    type: "short_text",
    required: true,
    placeholder: "Can be designers, celebrities, historical figures, or movements"
  },
  {
    id: "PHIL_03",
    section: "philosophy",
    questionText: "What fashion rule do you ALWAYS break?",
    type: "short_text",
    required: true,
    example: "Mixing metals, Black and navy together, Socks with sandals"
  },
  {
    id: "PHIL_04",
    section: "philosophy",
    questionText: "Complete this sentence: 'Fashion is...'",
    type: "long_text",
    required: true,
    note: "Your personal philosophy on what fashion means"
  },
  {
    id: "PHIL_05",
    section: "philosophy",
    questionText: "How would you describe your approach to color?",
    type: "single_select",
    required: true,
    options: [
      "Bold and vibrant - more is more",
      "Monochromatic and tonal - sophisticated restraint",
      "Neutral base with strategic pops",
      "Whatever feels right in the moment",
      "Color psychology drives my choices"
    ]
  },
  {
    id: "PHIL_06",
    section: "philosophy",
    questionText: "Your signature look always includes:",
    type: "short_text",
    required: false,
    example: "layered jewelry, an oversized blazer, statement shoes"
  },
  {
    id: "PHIL_07",
    section: "philosophy",
    questionText: "What's more important to you: comfort or impact?",
    type: "scale",
    required: true,
    scaleMin: 1,
    scaleMax: 10,
    scaleLeftLabel: "Comfort always wins",
    scaleRightLabel: "Fashion is pain (worth it)"
  },
  {
    id: "PHIL_08",
    section: "philosophy",
    questionText: "How do you balance trends vs. timeless pieces?",
    type: "long_text",
    required: true,
    note: "Explain your philosophy"
  },
  {
    id: "PHIL_09",
    section: "philosophy",
    questionText: "What's a trend you absolutely hate right now?",
    type: "short_text",
    required: false,
    note: "Be honest! This helps capture your voice"
  },
  {
    id: "PHIL_10",
    section: "philosophy",
    questionText: "If you could only wear one brand for the rest of your life, what would it be and why?",
    type: "long_text",
    required: true
  },
  {
    id: "PHIL_11",
    section: "philosophy",
    questionText: "What does 'elevated basics' mean to you?",
    type: "long_text",
    required: true
  },
  {
    id: "PHIL_12",
    section: "philosophy",
    questionText: "Your approach to accessories is:",
    type: "single_select",
    required: true,
    options: [
      "Less is more - one statement piece",
      "Layered and abundant",
      "Functional first, fashionable second",
      "Accessories make the outfit",
      "I don't really focus on accessories"
    ]
  },
  {
    id: "PHIL_13",
    section: "philosophy",
    questionText: "What's your hot take on fast fashion?",
    type: "long_text",
    required: true
  },
  {
    id: "PHIL_14",
    section: "philosophy",
    questionText: "Describe your dream closet in one paragraph.",
    type: "long_text",
    required: true,
    placeholder: "Paint the picture - what's in it, how it feels, the vibe"
  },
  {
    id: "PHIL_15",
    section: "philosophy",
    questionText: "What's your go-to advice for someone who says 'I have nothing to wear'?",
    type: "long_text",
    required: true
  },
  {
    id: "CLIENT_01",
    section: "client_approach",
    questionText: "When a new client comes to you, what's the FIRST thing you ask them?",
    type: "short_text",
    required: true
  },
  {
    id: "CLIENT_02",
    section: "client_approach",
    questionText: "Walk through your typical styling process from consultation to final look.",
    type: "long_text",
    required: true,
    note: "Step by step - this helps the AI mimic your workflow"
  },
  {
    id: "CLIENT_03",
    section: "client_approach",
    questionText: "How do you handle a client who says 'I don't know what I want'?",
    type: "long_text",
    required: true
  },
  {
    id: "CLIENT_04",
    section: "client_approach",
    questionText: "A client loves a piece that you think is WRONG for them. What do you do?",
    type: "single_select",
    required: true,
    options: [
      "Tell them directly - honesty is my policy",
      "Gently redirect with better options",
      "Let them have it - it's their style journey",
      "Show them why it doesn't work (educate)",
      "Find a compromise version"
    ]
  },
  {
    id: "CLIENT_05",
    section: "client_approach",
    questionText: "How do you assess someone's body type and what it needs?",
    type: "long_text",
    required: true,
    note: "Your approach to fit and proportion"
  },
  {
    id: "CLIENT_06",
    section: "client_approach",
    questionText: "What's your philosophy on budget?",
    type: "single_select",
    required: true,
    options: [
      "Great style is possible at any price point",
      "Invest in key pieces, save on trends",
      "Quality over quantity always",
      "Mix high and low strategically",
      "If you can't afford good, don't buy at all"
    ]
  },
  {
    id: "CLIENT_07",
    section: "client_approach",
    questionText: "How do you handle someone who wants to dress 'younger' or 'older' than their age?",
    type: "long_text",
    required: true
  },
  {
    id: "CLIENT_08",
    section: "client_approach",
    questionText: "A client shows you a Pinterest board of looks they love. What's your next move?",
    type: "long_text",
    required: true
  },
  {
    id: "CLIENT_09",
    section: "client_approach",
    questionText: "How direct are you with feedback? Give an example.",
    type: "long_text",
    required: true,
    note: "This captures your communication style"
  },
  {
    id: "CLIENT_10",
    section: "client_approach",
    questionText: "What's the most challenging fit situation you've solved?",
    type: "long_text",
    required: true,
    note: "Tell the story - helps AI learn your problem-solving"
  },
  {
    id: "CLIENT_11",
    section: "client_approach",
    questionText: "How do you build confidence in someone who's uncomfortable with their body?",
    type: "long_text",
    required: true
  },
  {
    id: "CLIENT_12",
    section: "client_approach",
    questionText: "Your approach to sustainable/ethical fashion is:",
    type: "single_select",
    required: true,
    options: [
      "It's a priority - I only recommend sustainable brands",
      "I balance sustainability with other factors",
      "I focus on longevity over fast trends",
      "It's the client's choice, not mine to push",
      "Not really a focus for me"
    ]
  },
  {
    id: "CLIENT_13",
    section: "client_approach",
    questionText: "What do you do when a client's lifestyle doesn't match their style goals?",
    type: "long_text",
    required: true,
    example: "wants high fashion but works from home"
  },
  {
    id: "CLIENT_14",
    section: "client_approach",
    questionText: "How do you help someone develop their OWN style vs. copying yours?",
    type: "long_text",
    required: true
  },
  {
    id: "CLIENT_15",
    section: "client_approach",
    questionText: "What's your biggest styling pet peeve?",
    type: "short_text",
    required: false,
    note: "What drives you crazy that people do?"
  },
  {
    id: "EXPERT_01",
    section: "expertise",
    questionText: "What body types do you specialize in or have the most experience with?",
    type: "multi_select",
    required: true,
    options: [
      "Petite (under 5'4\")",
      "Tall (over 5'9\")",
      "Plus-size",
      "Athletic/muscular",
      "Curvy/hourglass",
      "Straight/rectangular",
      "All body types equally"
    ]
  },
  {
    id: "EXPERT_02",
    section: "expertise",
    questionText: "What occasions do you style most often?",
    type: "multi_select",
    required: true,
    options: [
      "Everyday/casual",
      "Professional/business",
      "Formal events",
      "Weddings (bride)",
      "Weddings (guests/party)",
      "Red carpet/awards",
      "Performance/stage",
      "Editorial/photoshoots",
      "Special occasions (prom, quinceañera, etc.)"
    ]
  },
  {
    id: "EXPERT_03",
    section: "expertise",
    questionText: "What's your #1 area of expertise?",
    type: "short_text",
    required: true,
    note: "The thing you're absolutely THE BEST at"
  },
  {
    id: "EXPERT_04",
    section: "expertise",
    questionText: "What demographic do you work with most?",
    type: "multi_select",
    required: true,
    options: [
      "Women 18-30",
      "Women 30-50",
      "Women 50+",
      "Men 18-30",
      "Men 30-50",
      "Men 50+",
      "Non-binary/gender fluid",
      "I work across all demographics"
    ]
  },
  {
    id: "EXPERT_05",
    section: "expertise",
    questionText: "Your go-to fix for 'nothing fits right' is:",
    type: "long_text",
    required: true
  },
  {
    id: "EXPERT_06",
    section: "expertise",
    questionText: "How do you approach styling for different seasons?",
    type: "long_text",
    required: true,
    note: "Your seasonal styling philosophy"
  },
  {
    id: "EXPERT_07",
    section: "expertise",
    questionText: "What's your expertise with wedding styling?",
    type: "single_select",
    required: true,
    options: [
      "Bridal gowns specialist",
      "Groom/groomsmen expert",
      "Full wedding party coordinator",
      "Wedding guest styling",
      "Not my specialty"
    ]
  },
  {
    id: "EXPERT_08",
    section: "expertise",
    questionText: "If someone needs a last-minute outfit for [specific occasion], what's your process?",
    type: "long_text",
    required: true,
    note: "Fill in the occasion you handle best"
  },
  {
    id: "EXPERT_09",
    section: "expertise",
    questionText: "What brands do you recommend most often and why?",
    type: "long_text",
    required: true,
    note: "List 5-10 brands with brief reasons"
  },
  {
    id: "EXPERT_10",
    section: "expertise",
    questionText: "What's your specialty in streetwear/casual styling?",
    type: "single_select",
    required: false,
    options: [
      "Hypebeast/limited edition culture",
      "Elevated basics",
      "Vintage/thrift mixing",
      "Athleisure",
      "Not my focus"
    ]
  },
  {
    id: "EXPERT_11",
    section: "expertise",
    questionText: "Your approach to formal/black-tie styling:",
    type: "long_text",
    required: true
  },
  {
    id: "EXPERT_12",
    section: "expertise",
    questionText: "What's a styling challenge you DON'T feel confident solving?",
    type: "short_text",
    required: true,
    note: "Honesty helps - AI will know when to suggest booking you"
  },
  {
    id: "EXPERT_13",
    section: "expertise",
    questionText: "How do you style for different cultural/traditional events?",
    type: "long_text",
    required: true
  },
  {
    id: "EXPERT_14",
    section: "expertise",
    questionText: "What's your edge? What makes YOUR styling different from everyone else's?",
    type: "long_text",
    required: true
  },
  {
    id: "EXPERT_15",
    section: "expertise",
    questionText: "If you could only give ONE piece of styling advice, what would it be?",
    type: "short_text",
    required: true
  },
  {
    id: "PERSONALITY_01",
    section: "personality",
    questionText: "How would your clients describe your communication style?",
    type: "multi_select",
    required: true,
    options: [
      "Warm and friendly - like talking to a bestie",
      "Professional and polished",
      "Direct and no-nonsense",
      "Playful and witty",
      "Thoughtful and detailed",
      "Inspirational and motivating"
    ]
  },
  {
    id: "PERSONALITY_02",
    section: "personality",
    questionText: "Are you more casual or formal in how you talk?",
    type: "scale",
    required: true,
    scaleMin: 1,
    scaleMax: 10,
    scaleLeftLabel: "Super casual (hey girl!)",
    scaleRightLabel: "Very formal (Good afternoon)"
  },
  {
    id: "PERSONALITY_03",
    section: "personality",
    questionText: "Do you use emojis when texting clients?",
    type: "single_select",
    required: true,
    options: [
      "Yes, all the time!",
      "Sometimes, when appropriate",
      "Rarely",
      "Never - not professional"
    ]
  },
  {
    id: "PERSONALITY_04",
    section: "personality",
    questionText: "What's your catchphrase or something you say ALL the time?",
    type: "short_text",
    required: false,
    example: "Trust the process, When in doubt add a belt"
  },
  {
    id: "PERSONALITY_05",
    section: "personality",
    questionText: "How do you hype someone up when they need confidence?",
    type: "long_text",
    required: true,
    note: "Write exactly what you'd say"
  },
  {
    id: "PERSONALITY_06",
    section: "personality",
    questionText: "Your sense of humor is:",
    type: "single_select",
    required: true,
    options: [
      "Witty and clever",
      "Sarcastic",
      "Self-deprecating",
      "Dad jokes level",
      "Dry/deadpan",
      "I keep it professional"
    ]
  },
  {
    id: "PERSONALITY_07",
    section: "personality",
    questionText: "Someone asks 'Does this make me look fat?' You respond:",
    type: "long_text",
    required: true,
    note: "Write your actual response - captures your tact and honesty"
  },
  {
    id: "PERSONALITY_08",
    section: "personality",
    questionText: "How much do you curse in conversation?",
    type: "single_select",
    required: true,
    options: [
      "Never - keep it clean",
      "Occasionally for emphasis",
      "Yeah, I curse",
      "Depends on the vibe"
    ]
  },
  {
    id: "PERSONALITY_09",
    section: "personality",
    questionText: "Are you more hype or more chill?",
    type: "scale",
    required: true,
    scaleMin: 1,
    scaleMax: 10,
    scaleLeftLabel: "Zen calm",
    scaleRightLabel: "YASSS QUEEN energy"
  },
  {
    id: "PERSONALITY_10",
    section: "personality",
    questionText: "Do you give tough love or gentle encouragement?",
    type: "scale",
    required: true,
    scaleMin: 1,
    scaleMax: 10,
    scaleLeftLabel: "Gentle encouragement",
    scaleRightLabel: "Tough love"
  },
  {
    id: "PERSONALITY_11",
    section: "personality",
    questionText: "Write a typical opening message you'd send a new client:",
    type: "long_text",
    required: true,
    note: "This captures your greeting style"
  },
  {
    id: "PERSONALITY_12",
    section: "personality",
    questionText: "How do you sign off messages?",
    type: "short_text",
    required: true,
    example: "xoxo, Best, -Sara, Stay fresh"
  },
  {
    id: "PERSONALITY_13",
    section: "personality",
    questionText: "Someone sends you a truly terrible outfit combo. Your response:",
    type: "long_text",
    required: true,
    note: "Be honest about your actual reaction"
  },
  {
    id: "PERSONALITY_14",
    section: "personality",
    questionText: "What's your vibe? Pick 3:",
    type: "multi_select",
    required: true,
    maxSelections: 3,
    options: [
      "Bougie",
      "Down-to-earth",
      "Edgy",
      "Sophisticated",
      "Fun",
      "Artistic",
      "Practical",
      "Dreamy",
      "Bold",
      "Minimal",
      "Extra"
    ]
  },
  {
    id: "PERSONALITY_15",
    section: "personality",
    questionText: "If your AI could only communicate ONE aspect of your personality, what should it be?",
    type: "short_text",
    required: true
  }
];

export const PORTFOLIO_CONTEXT_QUESTIONS: TrainingQuestion[] = [
  {
    id: "PORTFOLIO_01",
    section: "expertise",
    questionText: "What's this look/piece?",
    type: "short_text",
    required: true,
    example: "Custom bridal gown for outdoor wedding"
  },
  {
    id: "PORTFOLIO_02",
    section: "expertise",
    questionText: "Who was this for? (Without names if confidential)",
    type: "short_text",
    required: true,
    example: "Bride with hourglass figure, traditional but modern taste"
  },
  {
    id: "PORTFOLIO_03",
    section: "expertise",
    questionText: "What problem did this solve or what was the client's need?",
    type: "long_text",
    required: true
  },
  {
    id: "PORTFOLIO_04",
    section: "expertise",
    questionText: "What makes this piece special or unique?",
    type: "long_text",
    required: true
  },
  {
    id: "PORTFOLIO_05",
    section: "expertise",
    questionText: "What occasion/event was this for?",
    type: "single_select",
    required: true,
    options: [
      "Wedding",
      "Red carpet",
      "Editorial shoot",
      "Music video/performance",
      "Casual everyday",
      "Business/professional",
      "Special event",
      "Other"
    ]
  }
];

export const getQuestionById = (id: string): TrainingQuestion | undefined => {
  return TRAINING_QUESTIONS.find(q => q.id === id) || PORTFOLIO_CONTEXT_QUESTIONS.find(q => q.id === id);
};

export const getQuestionsBySection = (section: TrainingQuestion["section"]): TrainingQuestion[] => {
  return TRAINING_QUESTIONS.filter(q => q.section === section);
};

export const getSectionProgress = (section: TrainingQuestion["section"], answers: Map<string, string>): {
  total: number;
  answered: number;
  percentage: number;
} => {
  const questions = getQuestionsBySection(section);
  const total = questions.filter(q => q.required).length;
  const answered = questions.filter(q => q.required && answers.has(q.id)).length;
  return {
    total,
    answered,
    percentage: total > 0 ? Math.round((answered / total) * 100) : 0
  };
};
