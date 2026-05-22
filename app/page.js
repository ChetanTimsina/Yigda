import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  Wallet,
  Settings2,
  KeyRound,
  FileSignature,
  Send,
  Stamp
} from "lucide-react";

const steps = [
  {
    n: "01",
    icon: FileSignature,
    name: "Issue",
    text: "Approved organizations upload a PDF. Yigda hashes it and writes the fingerprint to a public chain."
  },
  {
    n: "02",
    icon: Wallet,
    name: "Hold",
    text: "The document lands in the citizen's NDI-verified vault. No PDFs leave the platform without consent."
  },
  {
    n: "03",
    icon: Send,
    name: "Share",
    text: "Citizens generate scoped, expiring links for a specific verifier company — no broad sharing."
  },
  {
    n: "04",
    icon: Stamp,
    name: "Verify",
    text: "Subscribed companies upload a PDF or open a share link. The chain confirms authenticity in one click."
  }
];

const roles = [
  {
    href: "/login",
    icon: Wallet,
    eyebrow: "For citizens",
    title: "Sign in with Bhutan NDI",
    body: "Open your document vault, download credentials, and create scoped share links for verifiers.",
    cta: "Continue with NDI",
    primary: true
  },
  {
    href: "/official-login",
    icon: KeyRound,
    eyebrow: "For institutions",
    title: "Official sign-in",
    body: "Administrators, approved issuing organizations, and verifier companies sign in here.",
    cta: "Sign in",
    primary: false
  }
];

export default function HomePage() {
  return (
    <>
      <Navbar variant="landing" />
      <main className="page">
        <header className="landingHeader">
          <div className="landingHeaderText">
            <span className="sectionEyebrow">Bhutan · Verifiable credentials</span>
            <h1 className="landingTitle">A trusted ledger for official documents.</h1>
            <p className="landingLede">
              Yigda lets approved institutions issue tamper-evident PDF documents, citizens hold them privately,
              and authorized companies verify authenticity in seconds — anchored to a public blockchain.
            </p>
            <ul className="landingProofRow">
              <li>
                <img className="proofIcon" src="/images/ethereum.png" alt="" />
                Anchored on Sepolia
              </li>
              <li>
                <img className="proofIcon ndi" src="/images/ndi-logo.png" alt="" />
                Identity by Bhutan NDI
              </li>
              <li>
                <Settings2 size={16} strokeWidth={1.8} />
                Admin-curated issuer registry
              </li>
            </ul>
          </div>
          <div className="landingHeaderMark" aria-hidden="true">
            <img src="/images/yigda-seal.png" alt="" />
          </div>
        </header>

        <section className="roleSplit">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link key={role.href} href={role.href} className={`roleEntry ${role.primary ? "primary" : ""}`}>
                <div className="roleEntryHead">
                  <span className="roleEntryIcon">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span className="roleEntryEyebrow">{role.eyebrow}</span>
                </div>
                <h2 className="roleEntryTitle">{role.title}</h2>
                <p>{role.body}</p>
                <span className="roleEntryCta">
                  {role.cta}
                  <ArrowRight size={16} strokeWidth={2} />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="howSection">
          <div className="howHeader">
            <span className="sectionEyebrow">How Yigda works</span>
            <h2 className="sectionTitle">Issue, hold, share, verify.</h2>
          </div>
          <div className="stepGrid">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article className="stepCell" key={step.n}>
                  <div className="stepCellHead">
                    <span className="stepIcon">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <span className="stepNumber">{step.n}</span>
                  </div>
                  <h3 className="stepName">{step.name}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
