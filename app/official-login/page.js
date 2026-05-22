"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OfficialLoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/official/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed.");
      router.push(data.redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="authShell">
      <section className="authPanel">
        <div className="authBrand">
          <span className="brandMark">
            <img src="/images/yigda-seal.png" alt="" />
          </span>
          <span className="brandWord">Yigda</span>
        </div>
        <h1>Official sign-in</h1>
        <p>For administrators, approved organizations, and verifier companies.</p>

        <form className="form" onSubmit={submit}>
          <label className="label">
            Username or organization / company name
            <input
              className="input"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              autoFocus
              required
            />
          </label>
          <label className="label">
            Password
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <button className="button full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {error && <div className="status error">{error}</div>}

        <div className="authFooter">
          New to Yigda? <Link href="/official-register">Register an organization or company</Link>
        </div>
      </section>
    </main>
  );
}
