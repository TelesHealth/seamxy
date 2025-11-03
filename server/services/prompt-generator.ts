import { AiTrainingResponse, StylistProfile, StylistPortfolioItem } from "../../shared/schema";

interface PortfolioWithContext {
  item: StylistPortfolioItem;
  context: {
    description: string;
    clientType: string;
    problemSolved: string;
    unique: string;
    occasion: string;
  };
}

export interface GeneratePromptInput {
  stylist: StylistProfile;
  trainingResponses: AiTrainingResponse[];
  portfolioItems: PortfolioWithContext[];
}

export class PromptGenerator {
  private responses: Map<string, string> = new Map();

  private loadResponses(trainingResponses: AiTrainingResponse[]) {
    this.responses.clear();
    for (const response of trainingResponses) {
      this.responses.set(response.questionId, response.answer);
    }
  }

  private get(questionId: string, defaultValue: string = ""): string {
    return this.responses.get(questionId) || defaultValue;
  }

  private getMultiple(questionIds: string[]): string[] {
    return questionIds.map(id => this.get(id)).filter(Boolean);
  }

  generate(input: GeneratePromptInput): string {
    this.loadResponses(input.trainingResponses);
    const { stylist } = input;

    const sections = [
      this.generateIntro(stylist),
      this.generateAbout(stylist),
      this.generatePhilosophy(),
      this.generateClientApproach(),
      this.generateExpertise(),
      this.generatePersonality(),
      this.generatePortfolio(input.portfolioItems),
      this.generateBoundaries(stylist),
      this.generateGuidelines(stylist)
    ];

    return sections.filter(Boolean).join("\n\n");
  }

  private generateIntro(stylist: StylistProfile): string {
    return `You are ${stylist.displayName}AI, the AI assistant for ${stylist.displayName}, a professional fashion stylist.`;
  }

  private generateAbout(stylist: StylistProfile): string {
    const parts = [`# ABOUT ${stylist.displayName.toUpperCase()}`];
    
    if (stylist.bio) {
      parts.push(stylist.bio);
    }
    
    if (stylist.location) {
      parts.push(`Location: ${stylist.location}`);
    }
    
    if (stylist.styleSpecialties && stylist.styleSpecialties.length > 0) {
      parts.push(`Specialties: ${stylist.styleSpecialties.join(", ")}`);
    }

    return parts.join("\n");
  }

  private generatePhilosophy(): string {
    const parts = ["# STYLE PHILOSOPHY"];

    const aesthetic = this.get("PHIL_01");
    if (aesthetic) {
      parts.push(`Core Aesthetic: ${aesthetic}`);
    }

    const icons = this.get("PHIL_02");
    if (icons) {
      parts.push(`Style Icons: ${icons}`);
    }

    const colorApproach = this.get("PHIL_05");
    if (colorApproach) {
      parts.push(`Approach to Color: ${colorApproach}`);
    }

    const fashionPhilosophy = this.get("PHIL_04");
    if (fashionPhilosophy) {
      parts.push(`Fashion Philosophy: ${fashionPhilosophy}`);
    }

    const ruleBreak = this.get("PHIL_03");
    if (ruleBreak) {
      parts.push(`Rule I Always Break: ${ruleBreak}`);
    }

    const trendsVsTimeless = this.get("PHIL_08");
    if (trendsVsTimeless) {
      parts.push(`Trends vs. Timeless: ${trendsVsTimeless}`);
    }

    const elevatedBasics = this.get("PHIL_11");
    if (elevatedBasics) {
      parts.push(`Elevated Basics: ${elevatedBasics}`);
    }

    const accessories = this.get("PHIL_12");
    if (accessories) {
      parts.push(`Accessories Approach: ${accessories}`);
    }

    return parts.join("\n");
  }

  private generateClientApproach(): string {
    const parts = ["# HOW I WORK WITH CLIENTS"];

    const firstQuestion = this.get("CLIENT_01");
    if (firstQuestion) {
      parts.push(`First Question I Ask: "${firstQuestion}"`);
    }

    const stylingProcess = this.get("CLIENT_02");
    if (stylingProcess) {
      parts.push(`Styling Process:\n${stylingProcess}`);
    }

    const budgetPhilosophy = this.get("CLIENT_06");
    if (budgetPhilosophy) {
      parts.push(`Budget Philosophy: ${budgetPhilosophy}`);
    }

    const bodyTypeAssessment = this.get("CLIENT_05");
    if (bodyTypeAssessment) {
      parts.push(`Body Type Assessment:\n${bodyTypeAssessment}`);
    }

    const unsureClient = this.get("CLIENT_03");
    if (unsureClient) {
      parts.push(`When Client Is Unsure:\n${unsureClient}`);
    }

    const wrongPiece = this.get("CLIENT_04");
    if (wrongPiece) {
      parts.push(`When Client Loves Wrong Piece: ${wrongPiece}`);
    }

    const buildConfidence = this.get("CLIENT_11");
    if (buildConfidence) {
      parts.push(`Building Body Confidence:\n${buildConfidence}`);
    }

    return parts.join("\n\n");
  }

  private generateExpertise(): string {
    const parts = ["# EXPERTISE & SPECIALIZATION"];

    const primaryExpertise = this.get("EXPERT_03");
    if (primaryExpertise) {
      parts.push(`Primary Expertise: ${primaryExpertise}`);
    }

    const bodyTypes = this.get("EXPERT_01");
    if (bodyTypes) {
      parts.push(`Body Types I Specialize In: ${bodyTypes}`);
    }

    const occasions = this.get("EXPERT_02");
    if (occasions) {
      parts.push(`Occasions I Style Most: ${occasions}`);
    }

    const demographics = this.get("EXPERT_04");
    if (demographics) {
      parts.push(`Demographics I Work With: ${demographics}`);
    }

    const brands = this.get("EXPERT_09");
    if (brands) {
      parts.push(`Go-To Brands:\n${brands}`);
    }

    const edge = this.get("EXPERT_14");
    if (edge) {
      parts.push(`My Unique Edge:\n${edge}`);
    }

    const topAdvice = this.get("EXPERT_15");
    if (topAdvice) {
      parts.push(`My #1 Styling Advice: "${topAdvice}"`);
    }

    const fittingFix = this.get("EXPERT_05");
    if (fittingFix) {
      parts.push(`Go-To Fix for Bad Fit:\n${fittingFix}`);
    }

    const seasonalApproach = this.get("EXPERT_06");
    if (seasonalApproach) {
      parts.push(`Seasonal Styling:\n${seasonalApproach}`);
    }

    const weddingExpertise = this.get("EXPERT_07");
    if (weddingExpertise) {
      parts.push(`Wedding Styling Expertise: ${weddingExpertise}`);
    }

    const notConfident = this.get("EXPERT_12");
    if (notConfident) {
      parts.push(`Challenges I'm Not Confident With: ${notConfident}`);
    }

    return parts.join("\n\n");
  }

  private generatePersonality(): string {
    const parts = ["# COMMUNICATION STYLE & PERSONALITY"];

    const communicationStyle = this.get("PERSONALITY_01");
    if (communicationStyle) {
      parts.push(`Communication Style: ${communicationStyle}`);
    }

    const formalityLevel = this.get("PERSONALITY_02");
    if (formalityLevel) {
      parts.push(`Formality Level: ${formalityLevel}/10 (1=super casual, 10=very formal)`);
    }

    const emojiUsage = this.get("PERSONALITY_03");
    if (emojiUsage) {
      parts.push(`Emoji Usage: ${emojiUsage}`);
    }

    const catchphrase = this.get("PERSONALITY_04");
    if (catchphrase) {
      parts.push(`Catchphrase: "${catchphrase}"`);
    }

    const signOff = this.get("PERSONALITY_12");
    if (signOff) {
      parts.push(`Message Sign-off: ${signOff}`);
    }

    const vibe = this.get("PERSONALITY_14");
    if (vibe) {
      parts.push(`My Vibe: ${vibe}`);
    }

    const humor = this.get("PERSONALITY_06");
    if (humor) {
      parts.push(`Sense of Humor: ${humor}`);
    }

    const cursingLevel = this.get("PERSONALITY_08");
    if (cursingLevel) {
      parts.push(`Language Style: ${cursingLevel}`);
    }

    const energy = this.get("PERSONALITY_09");
    if (energy) {
      parts.push(`Energy Level: ${energy}/10 (1=zen calm, 10=hype energy)`);
    }

    const feedbackStyle = this.get("PERSONALITY_10");
    if (feedbackStyle) {
      parts.push(`Feedback Style: ${feedbackStyle}/10 (1=gentle encouragement, 10=tough love)`);
    }

    const openingMessage = this.get("PERSONALITY_11");
    if (openingMessage) {
      parts.push(`Typical Opening Message:\n"${openingMessage}"`);
    }

    const confidenceBoost = this.get("PERSONALITY_05");
    if (confidenceBoost) {
      parts.push(`How I Hype People Up:\n"${confidenceBoost}"`);
    }

    const corePersonality = this.get("PERSONALITY_15");
    if (corePersonality) {
      parts.push(`Core Personality Trait: ${corePersonality}`);
    }

    return parts.join("\n\n");
  }

  private generatePortfolio(portfolioItems: PortfolioWithContext[]): string {
    if (portfolioItems.length === 0) {
      return "";
    }

    const parts = [
      "# PORTFOLIO EXAMPLES",
      "I can reference these past works in conversations:"
    ];

    for (const { item, context } of portfolioItems) {
      const title = item.title || context.description;
      const portfolioParts = [`\n${title}`];
      
      if (context.clientType) {
        portfolioParts.push(`Client: ${context.clientType}`);
      }
      
      if (context.occasion) {
        portfolioParts.push(`Occasion: ${context.occasion}`);
      }
      
      if (context.problemSolved) {
        portfolioParts.push(`Problem Solved: ${context.problemSolved}`);
      }
      
      if (context.unique) {
        portfolioParts.push(`What Made It Special: ${context.unique}`);
      }

      if (item.tags && item.tags.length > 0) {
        portfolioParts.push(`Tags: ${item.tags.join(", ")}`);
      }

      parts.push(portfolioParts.join("\n"));
    }

    return parts.join("\n");
  }

  private generateBoundaries(stylist: StylistProfile): string {
    const notConfident = this.get("EXPERT_12");

    return `# BOUNDARIES

What I CAN Do:
- Answer styling questions within my expertise
- Give personalized advice based on the information shared
- Reference my portfolio examples when relevant
- Recommend brands and techniques I know well
- Provide encouragement and confidence building
- Guide clients through style decisions

What I CANNOT Do:
- Make final decisions for complex custom work requiring hands-on consultation
- Guarantee perfect fit without taking actual measurements
- Promise ${stylist.displayName}'s availability or provide pricing
- Handle challenges I'm not confident with${notConfident ? `: ${notConfident}` : ""}
- Replace the value of an in-person styling session

When to Suggest Booking the Real ${stylist.displayName}:
- Hands-on fitting or measurement is needed
- Complex custom design work is requested
- In-person consultation would add significant value
- Question is beyond my AI capability
- Client needs guaranteed expertise in an area I'm less confident with`;
  }

  private generateGuidelines(stylist: StylistProfile): string {
    return `# CONVERSATION GUIDELINES

- Stay in character as ${stylist.displayName}AI at all times
- Use first person when giving advice ("I recommend...", "In my experience...")
- Be specific with brand names, techniques, and actionable advice
- Ask clarifying questions to understand the client's context, needs, and preferences
- Show my personality consistently (based on communication style above)
- Reference portfolio examples when they're relevant to the conversation
- Be honest about limitations and know when to suggest booking ${stylist.displayName}
- Maintain the tone, formality level, and language style that matches my personality
- End messages with my signature sign-off when appropriate
- Focus on empowering the client to make confident style choices`;
  }
}

export const promptGenerator = new PromptGenerator();
