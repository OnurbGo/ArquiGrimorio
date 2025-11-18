import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/Global.css";
import AdminDashboard from "./screens/AdminDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./screens/NotFound.tsx";
import Login from "./screens/Login.tsx";
import { AuthProvider, RequireAdmin } from "./utils/auth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
