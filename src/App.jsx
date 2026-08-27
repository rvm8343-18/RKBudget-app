import { BrowserRouter, Routes, Route, NavLink } from "react-router";
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';
import Login from './components/Login';
import BudgetStatsPage from "./pages/BudgetStats/BudgetStatsPage";
import EditBudgetPage from "./pages/EditBudget/EditBudgetPage";
import ExpensesHistoryPage from "./pages/ExpensesHistory/ExpensesHistoryPage";

import "./App.css";

function AppContent() {
  const { user, logout } = useAuth();
  const { displayCurrency, toggleCurrency } = useCurrency();

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <main className="content">
          <nav id="desktop-nav" className="desktop-nav">
            <button className="currency-toggle-btn" onClick={toggleCurrency}>
              {displayCurrency === "JPY" ? "¥ Yen" : "$ USD"}
            </button>{" "}|

            <NavLink to="/expense-history" className="nav-link">Expense History</NavLink> |{" "}
            <NavLink to="/" className="nav-link">Budget</NavLink> |{" "}
            <NavLink to="/edit-budget" className="nav-link">Edit Budget</NavLink>

            {" "}| <button className="logout-btn" onClick={logout}>Log out</button>
          </nav>

          {/* Mobile-only utility strip*/}
          <div id="mobile-topbar" className="mobile-topbar">
            <button className="currency-toggle-btn" onClick={toggleCurrency}>
              {displayCurrency === "JPY" ? "¥ Yen" : "$ USD"}
            </button>
            <button className="logout-btn" onClick={logout}>Log out</button>
          </div>

          {/* Mobile-only bottom tab bar*/}
          <nav id="bottom-nav" className="bottom-nav">
            <NavLink to="/expense-history" className="bottom-nav-link">
              <span className="bottom-nav-icon">🧾</span>
              <span className="bottom-nav-label">History</span>
            </NavLink>
            <NavLink to="/" className="bottom-nav-link" end>
              <span className="bottom-nav-icon">💰</span>
              <span className="bottom-nav-label">Budget</span>
            </NavLink>
            <NavLink to="/edit-budget" className="bottom-nav-link">
              <span className="bottom-nav-icon">✏️</span>
              <span className="bottom-nav-label">Edit</span>
            </NavLink>
          </nav>


          <Routes>
            <Route path="/" element={<BudgetStatsPage />} />
            <Route path="/expense-history" element={<ExpensesHistoryPage />} />
            <Route path="/edit-budget" element={<EditBudgetPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;