import { useState } from "react";

const team = [
  {
    name: "Kshitij & Anuj",
    role: "Database Schema Designing",
    contribution:
      "Data Consistency, Altering Schemas for updation, Logical correctness, Testing & creating Queries, and Stored Procedures",
    detail:
      "Responsible for designing and refining the MySQL relational schema — ensuring referential integrity, correcting column mismatches, aligning stored procedures with real business logic, and creating database procedures for adding properties and handling rent/buy transactions.",
    icon: "🗄️",
    color: "#e8f4f8",
    accent: "#2a7fba",
    tag: "Schema Design · SQL · DB Design · Stored Procedures",
  },
  {
    name: "Anuj, Mohit & Anuska",
    role: "Development Part (Frontend & Backend)",
    contribution:
      "Built the interactive platform using Claude AI for code generation across backend APIs, frontend UI, triggers, and end-to-end integration",
    detail:
      "Co-developed the entire full-stack application — Spring Boot REST backend with JWT auth, React + Vite frontend with role-based dashboards (Admin, Owner, Agent, Buyer), API integration, UI components, database triggers for buyer status updates, bug resolution, and comprehensive platform validation.",
    icon: "💻",
    color: "#f0f8f0",
    accent: "#2a8a4a",
    tag: "Spring Boot · React · Vite · Tailwind CSS · REST API · QA & E2E",
  },
];

export default function AboutPage() {
  const [active, setActive] = useState(null);

  return (
    <div style={styles.page}>
      {/* Background grid */}
      <div style={styles.grid} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <p style={styles.eyebrow}>Real Estate Management Platform</p>
          <h1 style={styles.title}>Meet the Team</h1>
          <p style={styles.subtitle}>
            Four contributors. One full-stack platform — from schema to deployment.
          </p>
        </div>

        {/* Tool used badge */}
        <div style={styles.toolBadge}>
          <span style={styles.toolIcon}>🤖</span>
          <span style={styles.toolText}>
            AI Tool Used: <strong>Claude AI</strong> (claude-sonnet-4-6) via claude.ai ·{" "}
            <em>Development Assistant — ~28% of total work</em>
          </span>
        </div>

        {/* Cards */}
        <div style={styles.cardGrid}>
          {team.map((member, i) => (
            <div
              key={member.name}
              style={{
                ...styles.card,
                backgroundColor: member.color,
                borderColor: active === i ? member.accent : "#e0e0e0",
                boxShadow:
                  active === i
                    ? `0 8px 32px ${member.accent}33`
                    : "0 2px 12px rgba(0,0,0,0.06)",
                transform: active === i ? "translateY(-4px)" : "translateY(0)",
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div style={styles.cardTop}>
                <span style={{ ...styles.memberIcon, backgroundColor: member.accent + "22" }}>
                  {member.icon}
                </span>
                <div>
                  <h2 style={{ ...styles.memberName, color: member.accent }}>{member.name}</h2>
                  <p style={styles.memberRole}>{member.role}</p>
                </div>
              </div>

              <div style={{ ...styles.divider, backgroundColor: member.accent + "33" }} />

              <p style={styles.contribution}>
                <span style={{ ...styles.contribLabel, color: member.accent }}>Contribution: </span>
                {member.contribution}
              </p>

              <p
                style={{
                  ...styles.detail,
                  maxHeight: active === i ? "200px" : "0px",
                  opacity: active === i ? 1 : 0,
                  marginTop: active === i ? "12px" : "0px",
                }}
              >
                {member.detail}
              </p>

              <div style={styles.tagRow}>
                {member.tag.split(" · ").map((t) => (
                  <span key={t} style={{ ...styles.tag, color: member.accent, borderColor: member.accent + "55", backgroundColor: member.accent + "11" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Project stats */}
        <div style={styles.statsRow}>
          {[
            { label: "Tables", value: "8" },
            { label: "API Endpoints", value: "25+" },
            { label: "React Pages", value: "12+" },
            { label: "User Roles", value: "4" },
            { label: "Stored Procedures", value: "5" },
            { label: "Bugs Squashed", value: "6" },
          ].map((s) => (
            <div key={s.label} style={styles.stat}>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <p style={styles.footer}>
          Stack: React 18 · Spring Boot 3 · MySQL 8 · JWT · Tailwind CSS · Vite
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8f8f6",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(#e8e8e4 1px, transparent 1px), linear-gradient(90deg, #e8e8e4 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    opacity: 0.5,
    pointerEvents: "none",
  },
  container: {
    position: "relative",
    maxWidth: "900px",
    margin: "0 auto",
    padding: "60px 24px 48px",
  },
  header: {
    textAlign: "center",
    marginBottom: "36px",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#888",
    marginBottom: "10px",
    fontFamily: "monospace",
  },
  title: {
    fontSize: "clamp(32px, 6vw, 52px)",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 12px",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    lineHeight: 1.6,
    fontStyle: "italic",
  },
  toolBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "12px 20px",
    marginBottom: "40px",
    fontSize: "13px",
    color: "#444",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  toolIcon: { fontSize: "18px" },
  toolText: { lineHeight: 1.5 },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  card: {
    borderRadius: "14px",
    border: "1.5px solid",
    padding: "24px",
    cursor: "default",
    transition: "all 0.25s ease",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  memberIcon: {
    fontSize: "26px",
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    flexShrink: 0,
  },
  memberName: {
    fontSize: "20px",
    fontWeight: "700",
    margin: "0 0 3px",
    letterSpacing: "-0.01em",
  },
  memberRole: {
    fontSize: "12px",
    color: "#888",
    margin: 0,
    fontFamily: "monospace",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  divider: {
    height: "1px",
    marginBottom: "14px",
    borderRadius: "2px",
  },
  contribution: {
    fontSize: "14px",
    color: "#333",
    lineHeight: 1.5,
    margin: 0,
  },
  contribLabel: {
    fontWeight: "700",
  },
  detail: {
    fontSize: "13px",
    color: "#555",
    lineHeight: 1.7,
    margin: 0,
    overflow: "hidden",
    transition: "all 0.3s ease",
    fontStyle: "italic",
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "14px",
  },
  tag: {
    fontSize: "11px",
    padding: "3px 10px",
    borderRadius: "20px",
    border: "1px solid",
    fontFamily: "monospace",
    letterSpacing: "0.04em",
  },
  statsRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "0",
    backgroundColor: "#fff",
    borderRadius: "14px",
    border: "1px solid #e4e4e4",
    overflow: "hidden",
    marginBottom: "28px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 28px",
    borderRight: "1px solid #ebebeb",
    flex: "1 1 100px",
  },
  statValue: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: "-0.03em",
  },
  statLabel: {
    fontSize: "11px",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginTop: "4px",
    fontFamily: "monospace",
  },
  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "#aaa",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
  },
};
