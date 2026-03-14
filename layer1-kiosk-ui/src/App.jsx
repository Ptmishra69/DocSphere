import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import PhoneAuth from "./pages/Phoneauth";
import Vitals from "./pages/Vitals";
import Summary from "./pages/Summary";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/phone" element={<PhoneAuth />} />
        <Route path="/vitals" element={<Vitals />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}