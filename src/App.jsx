import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ClientLayout } from "./components/layout/ClientLayout";

export default function App() {
  return (
    <BrowserRouter>
      <ClientLayout>
        <AppRoutes />
      </ClientLayout>
    </BrowserRouter>
  );
}
