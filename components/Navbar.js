"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  Building2,
  Wallet,
  Send,
  BadgeCheck,
  ShieldCheck,
  LogOut
} from "lucide-react";

const linksByType = {
  admin: [{ href: "/admin", label: "Admin", icon: Shield }],
  org: [{ href: "/org", label: "Issuer", icon: Building2 }],
  company: [
    { href: "/company", label: "Subscription", icon: BadgeCheck },
    { href: "/company/verify", label: "Verify", icon: ShieldCheck }
  ],
  citizen: [
    { href: "/vault", label: "Vault", icon: Wallet },
    { href: "/vault/share", label: "Share", icon: Send }
  ]
};

const roleLabel = {
  admin: "Administrator",
  org: "Issuing organization",
  company: "Verifier",
  citizen: "Citizen"
};

export default function Navbar({ variant }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const isLanding = variant === "landing" || pathname === "/";

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => {
        if (mounted) setUser(data.user || null);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/official/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const links = user ? linksByType[user.type] || [] : [];
  const displayName = user?.cid ? `CID ${user.cid}` : user?.name;

  return (
    <nav className="nav">
      <Link className="brand" href="/" aria-label="Yigda home">
        <span className="brandMark">
          <img src="/images/yigda-seal.png" alt="" />
        </span>
        <span className="brandText">
          <span className="brandWord">Yigda</span>
          <span className="brandWordSub">Authentic Documents</span>
        </span>
      </Link>
      <div className="navLinks">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
          return (
            <Link key={link.href} href={link.href} className={active ? "active" : undefined}>
              <Icon size={15} strokeWidth={1.8} />
              {link.label}
            </Link>
          );
        })}
        {user ? (
          <>
            <span className="navIdentity" title={roleLabel[user.type] || "Account"}>
              <span className="navIdentityDot" />
              {displayName}
            </span>
            <button className="navLogout" onClick={logout} type="button">
              <LogOut size={14} strokeWidth={1.8} />
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login" className="active">
            <Wallet size={15} strokeWidth={1.8} />
            Citizen Login
          </Link>
        )}
      </div>
    </nav>
  );
}
