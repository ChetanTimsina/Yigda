import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

export default function VerifyResult({ result }) {
  if (!result) return null;

  if (result.status === "VERIFIED") {
    return (
      <section className="panel resultVerified">
        <div className="resultHeader">
          <span className="resultIcon ok" aria-hidden="true">
            <ShieldCheck size={22} strokeWidth={2} />
          </span>
          <div>
            <span className="sectionEyebrow">Verification result</span>
            <h2 className="resultTitle">Verified</h2>
          </div>
        </div>
        <p>This PDF's fingerprint matches a document issued on Yigda and anchored on chain.</p>
        <div className="resultMeta">
          <div>
            <strong>Issued by</strong>
            <p>{result.issuedBy || "Unknown"}</p>
          </div>
          <div>
            <strong>Document type</strong>
            <p>{result.documentType || "Official document"}</p>
          </div>
          <div>
            <strong>Recipient CID</strong>
            <p>{result.recipient || "Hidden"}</p>
          </div>
          <div>
            <strong>Network</strong>
            <p>{result.blockchainProof?.network || "—"}</p>
          </div>
        </div>
      </section>
    );
  }

  if (result.status === "REVOKED") {
    return (
      <section className="panel resultRevoked">
        <div className="resultHeader">
          <span className="resultIcon warn" aria-hidden="true">
            <ShieldAlert size={22} strokeWidth={2} />
          </span>
          <div>
            <span className="sectionEyebrow">Verification result</span>
            <h2 className="resultTitle">Revoked</h2>
          </div>
        </div>
        <p>This document was issued by an approved organization, but is no longer valid.</p>
        <div className="status warn">Reason: {result.reason}</div>
      </section>
    );
  }

  return (
    <section className="panel resultFailed">
      <div className="resultHeader">
        <span className="resultIcon fail" aria-hidden="true">
          <ShieldX size={22} strokeWidth={2} />
        </span>
        <div>
          <span className="sectionEyebrow">Verification result</span>
          <h2 className="resultTitle">Not verified</h2>
        </div>
      </div>
      <p>{result.message || "This PDF was not found on Yigda."}</p>
    </section>
  );
}
