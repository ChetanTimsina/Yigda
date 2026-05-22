"use client";

import Navbar from "@/components/Navbar";
import LogoAvatar from "@/components/LogoAvatar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const docTypes = [
  "Degree",
  "Transcript",
  "Medical Certificate",
  "Birth Certificate",
  "Vaccination Record",
  "Work Permit",
  "National ID"
];

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [tab, setTab] = useState("orgs");
  const [approving, setApproving] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((response) => response.json());
      if (me.user?.type !== "admin") return router.push("/official-login");
      setUser(me.user);
      await refresh();
    }
    load();
  }, [router]);

  async function refresh() {
    const [orgRes, companyRes] = await Promise.all([
      fetch("/api/admin/organizations").then((response) => response.json()),
      fetch("/api/admin/companies").then((response) => response.json())
    ]);
    setOrgs(orgRes.organizations || []);
    setCompanies(companyRes.companies || []);
  }

  function toggle(type) {
    setSelected((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  }

  async function approve() {
    setError("");
    const response = await fetch(`/api/admin/organizations/${approving.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentTypes: selected })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setError(data.error || "Approval failed.");
    setApproving(null);
    setSelected([]);
    await refresh();
  }

  async function reject(org) {
    await fetch(`/api/admin/organizations/${org.id}/reject`, { method: "POST" });
    await refresh();
  }

  async function setCompanyStatus(company, status) {
    await fetch(`/api/admin/companies/${company.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await refresh();
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="page">
          <div className="panel">
            <span className="skeleton" style={{ height: 24, width: 220 }} />
            <span className="skeleton" style={{ height: 14, width: 320, marginTop: 12 }} />
            <span className="skeleton" style={{ height: 14, width: 280, marginTop: 8 }} />
          </div>
        </main>
      </>
    );
  }

  const pending = orgs.filter((org) => org.status === "pending");
  const approved = orgs.filter((org) => org.status === "approved");
  const rejected = orgs.filter((org) => org.status === "rejected");

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="dashboardHeader">
          <div>
            <span className="sectionEyebrow">Yigda registry</span>
            <h1>Administrator console</h1>
            <p>Approve issuing organizations and manage verifier companies across the platform.</p>
          </div>
          <div className="dashboardMeta">
            <span className="badge green dot">{user.name}</span>
            <span className="badge neutral">{pending.length} pending</span>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "orgs" ? "active" : ""}`} onClick={() => setTab("orgs")} type="button">
            Organizations
          </button>
          <button
            className={`tab ${tab === "companies" ? "active" : ""}`}
            onClick={() => setTab("companies")}
            type="button"
          >
            Companies
          </button>
        </div>

        {tab === "orgs" ? (
          <div className="grid" style={{ gap: 24 }}>
            <section className="panel">
              <div className="panelHeader">
                <div>
                  <h2>Pending approval</h2>
                  <p>Review each organization, then grant the document types it may issue.</p>
                </div>
                <span className="badge gold">{pending.length}</span>
              </div>
              <div className="tableList">
                {pending.length === 0 && (
                  <div className="empty" style={{ padding: 32 }}>
                    <p>No organizations are waiting for approval.</p>
                  </div>
                )}
                {pending.map((org) => (
                  <div className="listItem" key={org.id}>
                    <div className="identityRow">
                      <LogoAvatar src={org.logo_url} name={org.name} size="sm" />
                      <div>
                        <strong>{org.name}</strong>
                        <p>
                          {org.type || "Organization"} · {org.country || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="listActions">
                      <button
                        className="button"
                        onClick={() => {
                          setApproving(org);
                          setSelected([]);
                        }}
                        type="button"
                      >
                        Approve
                      </button>
                      <button className="button danger" onClick={() => reject(org)} type="button">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panelHeader">
                <div>
                  <h2>Approved issuers</h2>
                  <p>Active organizations with their permitted document types.</p>
                </div>
                <span className="badge green">{approved.length}</span>
              </div>
              <div className="tableList">
                {approved.length === 0 && (
                  <div className="empty" style={{ padding: 32 }}>
                    <p>No approved issuers yet.</p>
                  </div>
                )}
                {approved.map((org) => (
                  <div className="listItem" key={org.id}>
                    <div className="identityRow">
                      <LogoAvatar src={org.logo_url} name={org.name} size="sm" />
                      <div>
                        <strong>{org.name}</strong>
                        <p>{(org.document_types || []).join(" · ") || "No document types assigned"}</p>
                      </div>
                    </div>
                    <span className="badge green dot">Approved</span>
                  </div>
                ))}
              </div>
            </section>

            {rejected.length > 0 && (
              <section className="panel">
                <div className="panelHeader">
                  <div>
                    <h2>Rejected</h2>
                    <p>Applications that were declined.</p>
                  </div>
                  <span className="badge red">{rejected.length}</span>
                </div>
                <div className="tableList">
                  {rejected.map((org) => (
                    <div className="listItem" key={org.id}>
                      <div className="identityRow">
                        <LogoAvatar src={org.logo_url} name={org.name} size="sm" />
                        <div>
                          <strong>{org.name}</strong>
                          <p>{org.type || "Organization"}</p>
                        </div>
                      </div>
                      <span className="badge red dot">Rejected</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <section className="panel">
            <div className="panelHeader">
              <div>
                <h2>Registered companies</h2>
                <p>Subscribed verifiers who can open share links and verify uploaded PDFs.</p>
              </div>
              <span className="badge neutral">{companies.length}</span>
            </div>
            <div className="tableList">
              {companies.length === 0 && (
                <div className="empty" style={{ padding: 32 }}>
                  <p>No companies have registered yet.</p>
                </div>
              )}
              {companies.map((company) => (
                <div className="listItem" key={company.id}>
                  <div className="identityRow">
                    <LogoAvatar src={company.logo_url} name={company.name} size="sm" />
                    <div>
                      <strong>{company.name}</strong>
                      <p>
                        {company.country || "—"} · subscription {company.subscription_status || "inactive"}
                      </p>
                    </div>
                  </div>
                  <div className="listActions">
                    <span className={`badge ${company.status === "active" ? "green" : "red"} dot`}>
                      {company.status}
                    </span>
                    <button
                      className="button secondary"
                      onClick={() =>
                        setCompanyStatus(company, company.status === "active" ? "suspended" : "active")
                      }
                      type="button"
                    >
                      {company.status === "active" ? "Suspend" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {approving && (
        <div className="modalBackdrop">
          <div className="modal">
            <h2>Approve {approving.name}</h2>
            <p className="muted">Choose the document types this organization may issue.</p>
            <div className="checkGrid">
              {docTypes.map((type) => (
                <label className="checkRow" key={type}>
                  <input type="checkbox" checked={selected.includes(type)} onChange={() => toggle(type)} />
                  <span>{type}</span>
                </label>
              ))}
            </div>
            {error && <div className="status error">{error}</div>}
            <div className="buttonRow" style={{ marginTop: 18 }}>
              <button className="button" onClick={approve} type="button">
                Approve
              </button>
              <button className="button secondary" onClick={() => setApproving(null)} type="button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
