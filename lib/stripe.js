import Stripe from "stripe";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function appOrigin(request) {
  // Explicit override — set APP_URL in production for a custom domain
  const configured = process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  // Vercel sets VERCEL_URL automatically on every deployment
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  // Dev: read from the actual incoming request
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}
