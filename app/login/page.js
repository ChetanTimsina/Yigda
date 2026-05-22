"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [proof, setProof] = useState(null);
  const [mode, setMode] = useState("mock");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void startLogin();
  }, []);

  async function post(url, body = {}) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }

  async function startLogin() {
    setBusy(true);
    setError("");
    setStatus("Preparing your NDI login QR code.");
    try {
      const data = await post("/api/ndi/proof-request");
      setProof(data.proof);
      setMode(data.mode);
      setStatus("Scan the QR code with Bhutan NDI Wallet. This page will update after approval.");
      void fetchResult(data.proof);
    } catch (err) {
      setError(err instanceof Error ? err.message : "NDI login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function fetchResult(activeProof = proof) {
    if (!activeProof) return;
    setBusy(true);
    try {
      const data = await post("/api/ndi/proof-result", {
        threadId: activeProof.proofRequestThreadId
      });
      setStatus("NDI login verified. Opening your vault.");
      router.push(data.redirectTo || "/vault");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Proof result is not ready.";
      if (message.includes("not received") || message.includes("timeout")) {
        setStatus("Still waiting for the NDI wallet share. Keep this page open.");
        window.setTimeout(() => fetchResult(activeProof), 1600);
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <section className="panel" style={{ maxWidth: 820, margin: "32px auto" }}>
          <div className="ndiHeader">
            <span className="ndiBrandMark" aria-hidden="true">
              <img src="/images/ndi-logo.png" alt="" />
            </span>
            <div>
              <span className="badge green dot">{mode === "live" ? "Live NDI" : "Mock NDI"}</span>
              <h1 className="ndiHeaderTitle">Sign in with Bhutan NDI</h1>
              <p className="ndiHeaderLede">
                Authenticate with your National Digital Identity wallet to open your citizen document vault.
              </p>
            </div>
          </div>

          {!proof ? (
            <button className="button" disabled={busy} onClick={startLogin} style={{ marginTop: 8 }}>
              {busy ? "Preparing NDI login…" : "Create NDI QR Code"}
            </button>
          ) : (
            <div className="grid two" style={{ alignItems: "center", gap: 32, marginTop: 8 }}>
              <div style={{ display: "grid", justifyItems: "center", gap: 14 }}>
                <div className="qrFrame" style={{ position: "relative" }}>
                  <img src={proof.qrCodeDataUrl} alt="NDI proof request QR code" width="260" height="260" />
                  <span style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid #fff",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.18)",
                    display: "block",
                    background: "oklch(20% 0.020 195)"
                  }}>
                    <img src="/images/ndi-logo.png" alt="NDI" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
                  </span>
                </div>
                <a className="button secondary" href={proof.deepLinkURL}>
                  Open NDI Wallet
                </a>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.375rem", fontWeight: 500 }}>
                  Complete in your wallet
                </h2>
                <ol className="muted" style={{ lineHeight: 1.85, marginTop: 12, paddingLeft: 18 }}>
                  <li>Open the Bhutan NDI Wallet on your phone.</li>
                  <li>Scan the QR code, or tap “Open NDI Wallet”.</li>
                  <li>Approve the requested identity proof.</li>
                  <li>Return here for automatic redirect.</li>
                </ol>
                {mode !== "live" && (
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => fetchResult(proof)}
                    style={{ marginTop: 16 }}
                  >
                    Fetch Mock Proof Result
                  </button>
                )}
              </div>
            </div>
          )}

          {status && <div className="status ok">{status}</div>}
          {error && <div className="status error">{error}</div>}
        </section>
      </main>
    </>
  );
}
