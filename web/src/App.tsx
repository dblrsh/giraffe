import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ChatPage } from "./pages/ChatPage";
import { HealthPage } from "./pages/HealthPage";
import { HomePage } from "./pages/HomePage";
import { PhotosPage } from "./pages/PhotosPage";
import { SettingsPage } from "./pages/SettingsPage";

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
