"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

function statusClass(status) {
  if (status === "VERIFIED") return "green";
  if (status === "REVOKED") return "gold";
  return "red";
}

function resultFor(results, documentId) {
  return results?.documents?.find((document) => document.id === documentId) || null;
}

function shortHash(value) {
  if (!value) return "Pending";
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

export default function SharedDocumentsPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [documents, setDocuments] = useState([]);
  const [verification, setVerification] = useState(null);
  const [verificationInfo, setVerificationInfo] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((response) => response.json());
      if (me.user?.type !== "company") {
        setStatus("login");
        return;
      }
      const response = await fetch(`/api/share/${token}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to open share link.");
        setStatus(response.status === 403 ? "subscription" : "error");
        return;
      }
      setDocuments(data.documents || []);
      setVerificationInfo(data.verification || null);
      setStatus("ready");
    }
    load();
  }, [router, token]);

  const requiredCredits = useMemo(
    () => verificationInfo?.requiredCredits ?? documents.length,
    [documents.length, verificationInfo]
  );

  async function verifySharedDocuments() {
    setBusy(true);
    setError("");
    setVerification(null);
    try {
      const response = await fetch(`/api/share/${token}`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403 && data.action === "subscribe") router.push("/company");
        throw new Error(data.error || "Shared document verification failed.");
      }
      setVerification(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Shared document verification failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page" style={{ maxWidth: 980 }}>
        {status === "loading" && (
          <section className="panel">
            <span className="skeleton" style={{ height: 24, width: 240 }} />
            <span className="skeleton" style={{ height: 14, width: 320, marginTop: 12 }} />
            <span className="skeleton" style={{ height: 14, width: 280, marginTop: 8 }} />
          </section>
        )}

        {status === "login" && (
          <section className="panel">
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 500 }}>
              Company sign-in required
            </h1>
            <p style={{ color: "var(--ink-muted)", marginTop: 8 }}>
              Only subscribed verifier companies can open shared document links.
            </p>
            <button
              className="button"
              onClick={() => router.push("/official-login")}
              style={{ marginTop: 18 }}
              type="button"
            >
              Official sign-in
            </button>
          </section>
        )}

        {status === "subscription" && (
          <section className="panel">
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 500 }}>
              Subscription required
            </h1>
            <p style={{ color: "var(--ink-muted)", marginTop: 8 }}>{error}</p>
            <button className="button" onClick={() => router.push("/company")} style={{ marginTop: 18 }} type="button">
              View plans
            </button>
          </section>
        )}

        {status === "error" && (
          <section className="panel">
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 500 }}>
              Share link unavailable
            </h1>
            <p style={{ color: "var(--ink-muted)", marginTop: 8 }}>{error}</p>
          </section>
        )}

        {status === "ready" && (
          <>
            <div className="dashboardHeader">
              <div>
                <span className="sectionEyebrow">Shared with you</span>
                <h1>Documents to verify</h1>
                <p>
                  Review the shared documents first. Credits are consumed only after you confirm verification.
                </p>
              </div>
              <div className="dashboardMeta">
                <span className="badge neutral">{documents.length} shared</span>
              </div>
            </div>

            <div className="grid two">
              {documents.map((document) => {
                const result = resultFor(verification, document.id);
                return (
                  <article className="docCard" key={document.id}>
                    <div className="docCardHeader">
                      <div>
                        <span className="documentLabel">{document.org_name || "Issuing organization"}</span>
                        <h3 className="docCardTitle">{document.document_type}</h3>
                      </div>
                      <span className={`badge ${document.status === "active" ? "green" : "red"} dot`}>
                        {document.status}
                      </span>
                    </div>

                    <dl className="documentMeta">
                      <div>
                        <dt>Recipient</dt>
                        <dd>CID {document.cid}</dd>
                      </div>
                      <div>
                        <dt>Issued</dt>
                        <dd>{new Date(document.issue_date).toLocaleDateString()}</dd>
                      </div>
                      <div>
                        <dt>Fingerprint</dt>
                        <dd>{shortHash(document.doc_hash)}</dd>
                      </div>
                      <div>
                        <dt>Chain</dt>
                        <dd>{document.tx_hash ? shortHash(document.tx_hash) : "Pending"}</dd>
                      </div>
                    </dl>

                    {result && (
                      <div className="docCardActions" style={{ marginTop: 8 }}>
                        <span className={`badge ${statusClass(result.status)} dot`}>{result.status}</span>
                        {result.status === "VERIFIED" && (
                          <span className="muted" style={{ fontSize: "var(--text-xs)" }}>
                            Fingerprint matched the issued record.
                          </span>
                        )}
                        {result.status === "REVOKED" && (
                          <span className="muted" style={{ fontSize: "var(--text-xs)" }}>
                            Revoked. {result.revokedReason || ""}
                          </span>
                        )}
                        {result.status === "NOT_VERIFIED" && (
                          <span className="muted" style={{ fontSize: "var(--text-xs)" }}>
                            Fingerprint not found on Yigda.
                          </span>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <section className="panel" style={{ marginTop: 28, textAlign: "center" }}>
              <p style={{ color: "var(--ink-strong)", fontSize: "var(--text-md)" }}>
                Verifying will use <strong>{requiredCredits}</strong> credit
                {requiredCredits === 1 ? "" : "s"}.
              </p>
              {verificationInfo?.remainingCredits !== null && verificationInfo?.remainingCredits !== undefined && (
                <p className="muted" style={{ marginTop: 4, fontSize: "var(--text-sm)" }}>
                  Credits remaining before verification: {verificationInfo.remainingCredits}
                </p>
              )}
              <div className="buttonRow" style={{ justifyContent: "center", marginTop: 18 }}>
                <button
                  className="button"
                  disabled={busy || !documents.length || Boolean(verification)}
                  onClick={verifySharedDocuments}
                  type="button"
                >
                  {busy ? "Verifying…" : verification ? "Verification complete" : "Verify documents"}
                </button>
              </div>
              {verification && (
                <div className="status ok">
                  {verification.creditsUsed} credit{verification.creditsUsed === 1 ? "" : "s"} used.
                  {verification.remainingCredits !== null && ` ${verification.remainingCredits} remaining.`}
                </div>
              )}
              {error && <div className="status error">{error}</div>}
            </section>
          </>
        )}
      </main>
    </>
  );
}
