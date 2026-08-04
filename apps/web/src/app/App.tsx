import { useEffect, useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { api, type UserProfile } from "../api/client";
import { initTelegram } from "../lib/telegram";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { ProductScreen } from "../screens/ProductScreen";
import { DiaryScreen } from "../screens/DiaryScreen";
import { HistoryScreen } from "../screens/HistoryScreen";

function Shell({ profile }: { profile: UserProfile }) {
  const location = useLocation();
  const hideNav =
    location.pathname.startsWith("/onboarding") ||
    location.pathname.startsWith("/products/");

  return (
    <div className="app-shell">
      <Routes>
        <Route
          path="/"
          element={
            profile.onboarded_at ? (
              <Navigate to="/search" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/products/:id" element={<ProductScreen />} />
        <Route path="/diary" element={<DiaryScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
      </Routes>

      {!hideNav && (
        <nav className="nav">
          <NavLink to="/search" className={({ isActive }) => (isActive ? "active" : "")}>
            Поиск
          </NavLink>
          <NavLink to="/diary" className={({ isActive }) => (isActive ? "active" : "")}>
            Дневник
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : "")}>
            История
          </NavLink>
        </nav>
      )}
    </div>
  );
}

function Root() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initTelegram();
    api
      .me()
      .then(setProfile)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (!profile.onboarded_at && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [profile, location.pathname, navigate]);

  if (error) {
    return (
      <div className="app-shell">
        <p className="empty">Ошибка API: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return <div className="loading">Загрузка…</div>;
  }

  return <Shell profile={profile} />;
}

export function App() {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
}
