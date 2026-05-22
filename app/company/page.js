"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import LogoAvatar from "@/components/LogoAvatar";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CompanyContent() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showPlans, setShowPlans] = useState(false);
  const [busy, setBusy] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
  const checkoutSessionId = searchParams.get("session_id");

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((response) => response.json());
      if (me.user?.type !== "company") return router.push("/official-login");
      setUser(me.user);

      if (checkoutStatus === "success" && checkoutSessionId) {
        setCheckoutMessage("Confirming your Stripe payment…");
        const syncResponse = await fetch("/api/stripe/sync-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: checkoutSessionId })
        });
        const syncData = await syncResponse.json().catch(() => ({}));
        if (!syncResponse.ok) {
          setError(syncData.error || "Payment succeeded, but subscription sync failed.");
        } else {
          setCheckoutMessage("Payment confirmed. Your verifier subscription is active.");
          window.history.replaceState({}, "", "/company");
        }
      }

      const data = await fetch("/api/company/subscription").then((response) => response.json());
      setSubscription(data.subscription);
      setPlans(data.plans || []);
      const isActive =
        data.subscription?.status === "active" && new Date(data.subscription.end_date) > new Date();
      setShowPlans(!isActive);
    }
    load();
  }, [router, checkoutStatus, checkoutSessionId]);

  async function subscribe(planId) {
    setBusy(planId);
    setError("");
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setBusy("");
    }
  }

  async function updateLogo(file) {
    if (!file) return;
    setLogoBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("logo", file);
      const response = await fetch("/api/auth/official/logo", {
        method: "POST",
        body
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Logo upload failed.");
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed.");
    } finally {
      setLogoBusy(false);
    }
  }

  const active = subscription?.status === "active" && new Date(subscription.end_date) > new Date();
  const used = subscription?.verifications_used ?? 0;
  const limit = subscription?.verifications_limit;
  const usagePct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="dashboardHeader">
          <div className="identityRow">
            <LogoAvatar src={user?.logoUrl} name={user?.name} />
            <div>
              <span className="sectionEyebrow">Verifier portal</span>
              <h1>{user?.name || "Company"}</h1>
              <p>Subscribe before verifying uploaded PDFs or opening citizen share links.</p>
              <label className="logoUploader">
                <span className="uploaderButton">{logoBusy ? "Uploading…" : "Change logo"}</span>
                <input
                  disabled={logoBusy}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => updateLogo(event.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
          <div className="dashboardMeta">
            <span className={`badge ${active ? "green" : "red"} dot`}>
              {active ? "Subscription active" : "No active subscription"}
            </span>
          </div>
        </div>

        {checkoutStatus === "cancelled" && <div className="status error">Stripe checkout was cancelled.</div>}
        {checkoutMessage && <div className="status ok">{checkoutMessage}</div>}
        {error && <div className="status error">{error}</div>}

        <section className="panel" style={{ marginBottom: 24 }}>
          <div className="panelHeader">
            <div>
              <h2>Subscription</h2>
              <p>
                {active
                  ? `Active ${subscription.plan} plan. Verifications are billed per document.`
                  : "Verification is locked until a paid plan is active."}
              </p>
            </div>
            <Link className="button" href="/company/verify">
              Verify a document
            </Link>
          </div>

          {active && (
            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "var(--text-sm)",
                  color: "var(--ink-muted)",
                  fontWeight: 500
                }}
              >
                <span>
                  Verifications used: <strong style={{ color: "var(--ink-strong)" }}>{used}</strong> /{" "}
                  {limit || "unlimited"}
                </span>
                {limit ? <span>{usagePct}%</span> : null}
              </div>
              {limit ? (
                <div className="downloadTrack" style={{ marginTop: 8, height: 8 }}>
                  <span
                    style={{
                      background: "var(--jade)",
                      display: "block",
                      height: "100%",
                      width: `${usagePct}%`,
                      borderRadius: "inherit"
                    }}
                  />
                </div>
              ) : null}
              <div className="buttonRow" style={{ marginTop: 18 }}>
                <button className="button secondary" onClick={() => setShowPlans((visible) => !visible)} type="button">
                  {showPlans ? "Hide plans" : "Upgrade plan"}
                </button>
              </div>
            </div>
          )}
        </section>

        {showPlans && (
          <>
            <div style={{ marginBottom: 14 }}>
              <span className="sectionEyebrow">Choose a plan</span>
              <h2 className="sectionTitle">Pay only for what you verify.</h2>
            </div>
            <div className="grid three">
              {plans.map((plan) => (
                <section className={`planCard ${plan.popular ? "popular" : ""}`} key={plan.id}>
                  {plan.popular && (
                    <span className="badge gold" style={{ position: "absolute", right: 16, top: 16 }}>
                      Most popular
                    </span>
                  )}
                  <h3>{plan.name}</h3>
                  <div className="planPrice">
                    {plan.price}
                    <span>/month</span>
                  </div>
                  <p className="muted">
                    {plan.limit ? `${plan.limit} verifications per month` : "Unlimited verifications"}
                  </p>
                  <ul className="planFeatures">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    className={`button ${plan.popular ? "" : "secondary"} full`}
                    disabled={busy === plan.id}
                    onClick={() => subscribe(plan.id)}
                    type="button"
                  >
                    {busy === plan.id ? "Redirecting…" : active ? "Switch plan" : "Subscribe"}
                  </button>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default function CompanyPage() {
  return (
    <Suspense>
      <CompanyContent />
    </Suspense>
  );
}
