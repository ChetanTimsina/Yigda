export const VERIFIER_PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: "Nu.849",
    amount: 84900,
    interval: "month",
    limit: 50,
    stripePriceEnv: "STRIPE_STARTER_PRICE_ID",
    features: ["PDF upload verification", "Shareable link access", "Basic audit log"]
  },
  business: {
    id: "business",
    name: "Business",
    price: "Nu.2799",
    amount: 279900,
    interval: "month",
    limit: 350,
    stripePriceEnv: "STRIPE_BUSINESS_PRICE_ID",
    popular: true,
    features: ["PDF upload verification", "Shareable link access", "Basic audit log", "Bulk Verification", "Chatbot Access"]
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: "Nu.9999",
    amount: 999900,
    interval: "month",
    limit: null,
    stripePriceEnv: "STRIPE_ENTERPRISE_PRICE_ID",
    features: ["PDF upload verification", "Shareable link access", "Basic audit log", "Bulk Verification", "Chatbot Access"]
  }
};

export function getPlan(planId) {
  return VERIFIER_PLANS[String(planId || "").toLowerCase()] || null;
}

export function publicPlans() {
  return Object.values(VERIFIER_PLANS).map(({ stripePriceEnv, ...plan }) => plan);
}
