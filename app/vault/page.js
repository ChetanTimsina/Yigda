"use client";

import DocumentCard from "@/components/DocumentCard";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VaultPage() {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((response) => response.json());
      if (me.user?.type !== "citizen") return router.push("/");
      setUser(me.user);
      const data = await fetch("/api/documents/vault").then((response) => response.json());
      if (data.error) setError(data.error);
      setDocuments(data.documents || []);
      setLoading(false);
    }
    load();
  }, [router]);

  function share(document) {
    router.push(`/vault/share?docId=${document.id}`);
  }

  const active = documents.filter((doc) => doc.status === "active").length;
  const revoked = documents.filter((doc) => doc.status === "revoked").length;

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="dashboardHeader">
          <div>
            <span className="sectionEyebrow">Citizen vault</span>
            <h1>My documents</h1>
            <p>Documents issued by approved organizations to your NDI-verified CID.</p>
          </div>
          <div className="dashboardMeta">
            {user && (
              <span className="badge green dot">
                CID {user.cid}
              </span>
            )}
            <span className="badge neutral">
              {active} active{revoked ? ` · ${revoked} revoked` : ""}
            </span>
          </div>
        </div>

        {error && <div className="status error">{error}</div>}

        {loading ? (
          <div className="grid three">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="panel" key={index} style={{ minHeight: 200 }}>
                <span className="skeleton" style={{ height: 20, width: "65%" }} />
                <span className="skeleton" style={{ height: 14, width: "45%", marginTop: 10 }} />
                <span className="skeleton" style={{ height: 14, width: "55%", marginTop: 8 }} />
                <span className="skeleton" style={{ height: 44, width: "100%", marginTop: 24 }} />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="empty">
            <span className="emptyMark">
              <img src="/images/yigda-seal.png" alt="" />
            </span>
            <h2>No documents yet</h2>
            <p>
              Documents will appear here once an approved organization issues one to your CID. You'll be able to
              download or share them from this vault.
            </p>
          </div>
        ) : (
          <div className="grid three">
            {documents.map((document) => (
              <DocumentCard key={document.id} document={document} onShare={share} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
