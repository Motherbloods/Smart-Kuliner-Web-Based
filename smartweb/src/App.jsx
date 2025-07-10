import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { RegisterSellerPage } from "./pages/RegisterSeller";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-seller" element={<RegisterSellerPage />} />
      </Routes>
    </Router>
  );
}
