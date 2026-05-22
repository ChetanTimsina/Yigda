"use client";

import Navbar from "@/components/Navbar";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Check, Link2 } from "lucide-react";

function ShareContent() {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((response) => response.json());
      if (me.user?.type !== "citizen") return router.push("/");
      const data = await fetch("/api/documents/vault").then((response) => response.json());
      const active = (data.documents || []).filter((document) => document.status === "active");
      setDocuments(active);
      const docId = searchParams.get("docId");
      if (docId) setSelected([docId]);
    }
    load();
  }, [router, searchParams]);

  function toggle(id) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function generate() {
    setError("");
    setLink("");
    const response = await fetch("/api/share/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentIds: selected, expiresInDays })
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Failed to create link.");
    setLink(data.link);
  }

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <Navbar />
      <main className="page" style={{ maxWidth: 860 }}>
        <div className="dashboardHeader">
          <div>
            <span className="sectionEyebrow">Citizen vault</span>
            <h1>Share documents</h1>
            <p>
              Choose exactly which active documents a subscribed company can view. Links expire automatically
              and can be revoked by removing access.
            </p>
          </div>
        </div>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <h2>Select documents</h2>
              <p>Only active documents can be shared. Revoked items are hidden.</p>
            </div>
            <span className="badge neutral">{selected.length} selected</span>
          </div>

          <div className="checkGrid">
            {documents.length === 0 && (
              <div className="empty" style={{ padding: 32 }}>
                <p>No active documents available to share.</p>
              </div>
            )}
            {documents.map((document) => (
              <label className="checkRow" key={document.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(document.id)}
                  onChange={() => toggle(document.id)}
                />
                <span>
                  <strong>{document.document_type}</strong>
                  <span className="muted" style={{ marginLeft: 8 }}>
                    from {document.org_name || "issuing organization"}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <label className="label" style={{ maxWidth: 280 }}>
            Link expires in
            <select
              className="select"
              value={expiresInDays}
              onChange={(event) => setExpiresInDays(Number(event.target.value))}
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </label>

          <button className="button" disabled={!selected.length} onClick={generate} style={{ marginTop: 18 }}>
            <Link2 size={15} strokeWidth={1.8} />
            Generate share link
          </button>
        </section>

        {error && <div className="status error">{error}</div>}
        {link && (
          <section className="panel" style={{ marginTop: 18 }}>
            <div className="panelHeader" style={{ marginBottom: 8 }}>
              <div>
                <h2>Share link ready</h2>
                <p>Send this link to a subscribed verifier company.</p>
              </div>
              <span className="badge green dot">Active</span>
            </div>
            <div className="shareLinkBox">
              <span style={{ flex: 1, minWidth: 0 }}>{link}</span>
            </div>
            <div className="buttonRow" style={{ marginTop: 14 }}>
              <button className="button secondary" onClick={copyLink} type="button">
                {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.8} />}
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default function VaultSharePage() {
  return (
    <Suspense>
      <ShareContent />
    </Suspense>
  );
}
