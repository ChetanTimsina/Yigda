"use client";

import Navbar from "@/components/Navbar";
import LogoAvatar from "@/components/LogoAvatar";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function shortHash(value) {
  if (!value) return "Pending";
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

export default function OrgPage() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("single");
  const [documentTypes, setDocumentTypes] = useState([]);
  const [issuedDocs, setIssuedDocs] = useState([]);
  const [form, setForm] = useState({ cid: "", documentType: "", issueDate: "" });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [bulkForm, setBulkForm] = useState({ documentType: "", issueDate: "" });
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkResults, setBulkResults] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((response) => response.json());
      if (me.user?.type !== "org") return router.push("/official-login");
      setUser(me.user);
      await Promise.all([loadPermissions(), loadIssuedDocs()]);
    }
    load();
  }, [router]);

  async function loadPermissions() {
    const data = await fetch("/api/org/permissions").then((response) => response.json());
    setDocumentTypes(data.documentTypes || []);
  }

  async function loadIssuedDocs() {
    const data = await fetch("/api/org/documents").then((response) => response.json());
    setIssuedDocs(data.documents || []);
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
      setMessage("Logo updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed.");
    } finally {
      setLogoBusy(false);
    }
  }

  const selectedType = useMemo(() => {
    if (form.documentType) return form.documentType;
    return documentTypes[0] || "";
  }, [documentTypes, form.documentType]);

  const selectedBulkType = useMemo(() => {
    if (bulkForm.documentType) return bulkForm.documentType;
    return documentTypes[0] || "";
  }, [documentTypes, bulkForm.documentType]);

  async function issueDocument(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!file) return setError("Choose a PDF file first.");
    if (!selectedType) return setError("No permitted document types are assigned to this organization.");

    setBusy(true);
    try {
      const body = new FormData();
      body.append("cid", form.cid);
      body.append("document_type", selectedType);
      body.append("issue_date", form.issueDate);
      body.append("pdf", file);

      const response = await fetch("/api/documents/issue", {
        method: "POST",
        body
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Document issue failed.");

      setMessage(
        `Document issued. Fingerprint ${data.document.doc_hash} recorded for CID ${data.document.cid}. Chain confirmation will follow.`
      );
      setForm({ cid: "", documentType: "", issueDate: "" });
      setFile(null);
      await loadIssuedDocs();
      setTab("issued");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document issue failed.");
    } finally {
      setBusy(false);
    }
  }

  async function revokeDocument() {
    if (!revokeReason.trim()) return setError("Enter a revocation reason.");
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/documents/${revokeTarget.id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: revokeReason })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Revocation failed.");
      setMessage("Document revoked. Blockchain revocation will update shortly.");
      setRevokeTarget(null);
      setRevokeReason("");
      await loadIssuedDocs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revocation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function issueBulk(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setBulkResults(null);
    if (!bulkFile) return setError("Choose a ZIP file first.");
    if (!selectedBulkType) return setError("No permitted document types are assigned to this organization.");

    setBusy(true);
    try {
      const body = new FormData();
      body.append("document_type", selectedBulkType);
      body.append("issue_date", bulkForm.issueDate);
      body.append("zip", bulkFile);

      const response = await fetch("/api/documents/issue/bulk", {
        method: "POST",
        body
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Bulk issue failed.");
      setBulkResults(data);
      setMessage(`${data.success.length} documents issued. ${data.errors.length} files need attention.`);
      await loadIssuedDocs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk issue failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="dashboardHeader">
          <div className="identityRow">
            <LogoAvatar src={user?.logoUrl} name={user?.name} />
            <div>
              <span className="sectionEyebrow">Issuing portal</span>
              <h1>{user?.name || "Organization"}</h1>
              <p>Issue documents to citizen NDI accounts. Every document is hashed and anchored on chain.</p>
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
            <span className="badge green dot">{documentTypes.length} document types</span>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "single" ? "active" : ""}`} onClick={() => setTab("single")} type="button">
            Issue single
          </button>
          <button className={`tab ${tab === "bulk" ? "active" : ""}`} onClick={() => setTab("bulk")} type="button">
            Bulk issue
          </button>
          <button
            className={`tab ${tab === "issued" ? "active" : ""}`}
            onClick={() => setTab("issued")}
            type="button"
          >
            Issued documents
          </button>
        </div>

        {message && <div className="status ok">{message}</div>}
        {error && <div className="status error">{error}</div>}

        {tab === "single" && (
          <form className="panel" onSubmit={issueDocument} style={{ display: "grid", gap: 16 }}>
            <div className="panelHeader" style={{ marginBottom: 4 }}>
              <div>
                <h2>Issue a single document</h2>
                <p>Hash a PDF, anchor it on Sepolia, and deliver it to a citizen's vault.</p>
              </div>
            </div>

            <label className="label">
              Citizen CID
              <input
                className="input"
                value={form.cid}
                onChange={(event) => setForm({ ...form, cid: event.target.value })}
                placeholder="11001234567"
                required
              />
            </label>

            <label className="label">
              Document type
              <select
                className="select"
                value={selectedType}
                onChange={(event) => setForm({ ...form, documentType: event.target.value })}
                required
              >
                <option value="">Select type…</option>
                {documentTypes.map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="label">
              Issue date
              <input
                className="input"
                type="date"
                value={form.issueDate}
                onChange={(event) => setForm({ ...form, issueDate: event.target.value })}
                required
              />
            </label>

            <label className="label">
              PDF file
              <input
                className="input"
                key={file ? "file-selected" : "file-empty"}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                required
              />
              <span className="hint">{file ? file.name : "PDF only. The file is hashed before upload."}</span>
            </label>

            <button className="button" disabled={busy || !documentTypes.length}>
              {busy ? "Issuing…" : "Issue document"}
            </button>

            {!documentTypes.length && (
              <p className="muted" style={{ fontSize: "var(--text-sm)" }}>
                Admin must assign document types before this organization can issue.
              </p>
            )}
          </form>
        )}

        {tab === "bulk" && (
          <form className="panel" onSubmit={issueBulk} style={{ display: "grid", gap: 16 }}>
            <div className="panelHeader" style={{ marginBottom: 4 }}>
              <div>
                <h2>Bulk issue from a ZIP</h2>
                <p>
                  Put PDFs inside a single ZIP. Each filename must be the citizen CID, e.g.{" "}
                  <code>11001234567.pdf</code>.
                </p>
              </div>
            </div>

            <label className="label">
              Document type
              <select
                className="select"
                value={selectedBulkType}
                onChange={(event) => setBulkForm({ ...bulkForm, documentType: event.target.value })}
                required
              >
                <option value="">Select type…</option>
                {documentTypes.map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="label">
              Issue date
              <input
                className="input"
                type="date"
                value={bulkForm.issueDate}
                onChange={(event) => setBulkForm({ ...bulkForm, issueDate: event.target.value })}
                required
              />
            </label>

            <label className="label">
              ZIP file
              <input
                className="input"
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={(event) => setBulkFile(event.target.files?.[0] || null)}
                required
              />
              <span className="hint">{bulkFile ? bulkFile.name : "ZIP archive with named PDFs."}</span>
            </label>

            <button className="button" disabled={busy || !documentTypes.length}>
              {busy ? "Processing ZIP…" : "Bulk issue documents"}
            </button>

            {bulkResults && (
              <div className="panel compact" style={{ background: "var(--surface-sunken)" }}>
                <strong>Results</strong>
                <p style={{ color: "var(--ink-muted)", marginTop: 6 }}>
                  {bulkResults.success.length} issued successfully.
                </p>
                {bulkResults.errors.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <p className="muted">{bulkResults.errors.length} errors:</p>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                      {bulkResults.errors.map((item, index) => (
                        <li key={`${item.file}-${index}`} style={{ fontSize: "var(--text-sm)" }}>
                          <code>{item.file}</code> — {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </form>
        )}

        {tab === "issued" && (
          <section className="panel">
            <div className="panelHeader">
              <div>
                <h2>Issued documents</h2>
                <p>Every document this organization has issued, with chain status.</p>
              </div>
              <span className="badge neutral">{issuedDocs.length}</span>
            </div>
            {issuedDocs.length === 0 ? (
              <div className="empty">
                <span className="emptyMark">
                  <img src="/images/yigda-seal.png" alt="" />
                </span>
                <h2>No documents issued yet</h2>
                <p>Issued documents will appear here with their fingerprint and Sepolia transaction status.</p>
              </div>
            ) : (
              <div className="tableList">
                {issuedDocs.map((doc) => (
                  <article className="listItem" key={doc.id}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                        <strong>{doc.document_type}</strong>
                        <span className={`badge ${doc.status === "active" ? "green" : "red"} dot`}>
                          {doc.status}
                        </span>
                      </div>
                      <p>
                        CID <code>{doc.cid}</code> · Issued {new Date(doc.issue_date).toLocaleDateString()}
                      </p>
                      <p>
                        Fingerprint <code>{shortHash(doc.doc_hash)}</code>
                      </p>
                      <p>
                        Chain{" "}
                        <code>{doc.tx_hash ? shortHash(doc.tx_hash) : "Pending Sepolia confirmation"}</code>
                      </p>
                    </div>
                    <div className="listActions">
                      <a className="button secondary" href={`/api/documents/${doc.id}/download`}>
                        Download
                      </a>
                      {doc.status === "active" && (
                        <button className="button danger" onClick={() => setRevokeTarget(doc)} type="button">
                          Revoke
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {revokeTarget && (
        <div className="modalBackdrop">
          <div className="modal">
            <h2>Revoke {revokeTarget.document_type}</h2>
            <p className="muted">
              This marks the document as revoked immediately and sends a revocation transaction in the background.
            </p>
            <label className="label" style={{ marginTop: 16 }}>
              Reason
              <textarea
                className="textarea"
                value={revokeReason}
                onChange={(event) => setRevokeReason(event.target.value)}
                placeholder="Reason for revocation"
              />
            </label>
            <div className="buttonRow" style={{ marginTop: 16 }}>
              <button className="button danger" disabled={busy} onClick={revokeDocument} type="button">
                Revoke
              </button>
              <button className="button secondary" onClick={() => setRevokeTarget(null)} type="button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
