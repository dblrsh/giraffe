import { NavLink, Outlet } from "react-router-dom";

const items = [
  ["/", "首页", "⌂"],
  ["/chat", "AI 会话", "✦"],
  ["/health", "健康", "♡"],
  ["/photos", "照片", "▧"],
  ["/settings", "设置", "⚙"],
] as const;

export function AppShell() {
  return (
    <div className="app-shell">
      <main className="page"><Outlet /></main>
      <nav className="tab-bar" aria-label="主导航">
        {items.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <span aria-hidden="true">{icon}</span>
            <small>{label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
