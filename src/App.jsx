import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ClientLayout } from "./components/layout/ClientLayout";
import { ScrollToTop } from "./components/layout/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ClientLayout>
        <AppRoutes />
      </ClientLayout>
    </BrowserRouter>
  );
}
