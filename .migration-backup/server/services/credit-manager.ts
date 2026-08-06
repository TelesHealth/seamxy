import { ConversationCredit, AiSubscription, InsertConversationCredit, InsertAiSubscription } from "../../shared/schema";

export interface CreditCheck {
  hasCredits: boolean;
  creditsRemaining: number;
  isSubscribed: boolean;
  requiresUpgrade: boolean;
  periodEnd: Date;
}

export interface CreditDeduction {
  success: boolean;
  newCreditsRemaining: number;
  message?: string;
}

export class CreditManager {
  private static MONTHLY_FREE_CREDITS = 5;
  private static PREMIUM_PRICE = 9.99;
  private static STYLIST_SHARE_PERCENT = 80;
  private static PLATFORM_SHARE_PERCENT = 20;

  calculatePeriodEnd(periodStart: Date): Date {
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    return periodEnd;
  }

  createInitialCredit(userId: string, stylistId: string): InsertConversationCredit {
    const now = new Date();
    const periodEnd = this.calculatePeriodEnd(now);

    return {
      userId,
      stylistId,
      creditsRemaining: CreditManager.MONTHLY_FREE_CREDITS,
      periodStart: now,
      periodEnd
    };
  }

  shouldResetCredits(credit: ConversationCredit): boolean {
    const now = new Date();
    const periodEnd = new Date(credit.periodEnd);
    return now >= periodEnd;
  }

  resetCreditPeriod(credit: ConversationCredit): Partial<ConversationCredit> {
    const now = new Date();
    const periodEnd = this.calculatePeriodEnd(now);

    return {
      creditsRemaining: CreditManager.MONTHLY_FREE_CREDITS,
      periodStart: now,
      periodEnd,
      updatedAt: now
    };
  }

  async checkCredit(
    credit: ConversationCredit | null,
    subscription: AiSubscription | null
  ): Promise<CreditCheck> {
    const isSubscribed = subscription?.status === "active";

    if (isSubscribed) {
      return {
        hasCredits: true,
        creditsRemaining: Infinity,
        isSubscribed: true,
        requiresUpgrade: false,
        periodEnd: new Date(subscription.currentPeriodEnd)
      };
    }

    if (!credit) {
      return {
        hasCredits: false,
        creditsRemaining: 0,
        isSubscribed: false,
        requiresUpgrade: true,
        periodEnd: new Date()
      };
    }

    const needsReset = this.shouldResetCredits(credit);
    const creditsRemaining = needsReset ? CreditManager.MONTHLY_FREE_CREDITS : credit.creditsRemaining;
    const hasCredits = creditsRemaining > 0;

    return {
      hasCredits,
      creditsRemaining,
      isSubscribed: false,
      requiresUpgrade: !hasCredits,
      periodEnd: needsReset ? this.calculatePeriodEnd(new Date()) : new Date(credit.periodEnd)
    };
  }

  deductCredit(credit: ConversationCredit): CreditDeduction {
    if (credit.creditsRemaining <= 0) {
      return {
        success: false,
        newCreditsRemaining: 0,
        message: "No credits remaining. Please upgrade to premium."
      };
    }

    const newCreditsRemaining = credit.creditsRemaining - 1;

    return {
      success: true,
      newCreditsRemaining,
      message: newCreditsRemaining === 0 
        ? "This was your last free message. Upgrade to premium for unlimited messages."
        : `${newCreditsRemaining} free message${newCreditsRemaining === 1 ? "" : "s"} remaining this month.`
    };
  }

  createSubscription(userId: string, stylistId: string): InsertAiSubscription {
    const now = new Date();
    const periodEnd = this.calculatePeriodEnd(now);

    const stylistShare = (CreditManager.PREMIUM_PRICE * CreditManager.STYLIST_SHARE_PERCENT / 100).toFixed(2);
    const platformShare = (CreditManager.PREMIUM_PRICE * CreditManager.PLATFORM_SHARE_PERCENT / 100).toFixed(2);

    return {
      userId,
      stylistId,
      status: "active",
      plan: "premium",
      pricePerMonth: CreditManager.PREMIUM_PRICE.toString(),
      stylistShare,
      platformShare,
      stripeSubscriptionId: null, // Stub for Stripe integration
      stripeCustomerId: null, // Stub for Stripe integration
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd
    };
  }

  cancelSubscription(subscription: AiSubscription): Partial<AiSubscription> {
    return {
      status: "cancelled",
      cancelledAt: new Date(),
      updatedAt: new Date()
    };
  }

  renewSubscription(subscription: AiSubscription): Partial<AiSubscription> {
    const now = new Date();
    const periodEnd = this.calculatePeriodEnd(now);

    return {
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      updatedAt: now
    };
  }

  isSubscriptionExpired(subscription: AiSubscription): boolean {
    if (subscription.status !== "active") {
      return true;
    }

    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    return now >= periodEnd;
  }

  shouldRenewSubscription(subscription: AiSubscription): boolean {
    return subscription.status === "active" && this.isSubscriptionExpired(subscription);
  }
}

export const creditManager = new CreditManager();
