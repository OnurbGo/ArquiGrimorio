import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ItemDetailsPage from "./components/ItemDetails";
import CreateItem from "./screens/CreateItem";
import Home from "./screens/Home";
import LoginAccount from "./screens/LoginAccount";
import NotFound from "./screens/NotFound";
import Search from "./screens/Search";
import Profile from "./screens/UserProfile";

import { AuthProvider } from "./utils/AuthContext";
import PrivateRoute from "./utils/PrivateRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* rota pública */}
          <Route path="/login" element={<LoginAccount />} />
          <Route path="/" element={<Home />} />

          {/* rotas privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/create" element={<CreateItem />} />
            <Route path="/search" element={<Search />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
