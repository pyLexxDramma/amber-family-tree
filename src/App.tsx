import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlatformProvider } from "@/platform/PlatformContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmCode from "./pages/ConfirmCode";
import Onboarding from "./pages/Onboarding";
import FamilyTree from "./pages/FamilyTree";
import Feed from "./pages/Feed";
import PublicationDetails from "./pages/PublicationDetails";
import CreatePublication from "./pages/CreatePublication";
import FamilyList from "./pages/FamilyList";
import MyProfile from "./pages/MyProfile";
import ContactProfile from "./pages/ContactProfile";
import InviteFlow from "./pages/InviteFlow";
import StorePage from "./pages/StorePage";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import AIDemoPage from "./pages/AIDemoPage";
import { AiShell } from "./ai/AiShell";
import { VoiceControlGlobal } from "./components/VoiceControlGlobal";
import NotFound from "./pages/NotFound";
import { CLASSIC_BASE } from "./constants/routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PlatformProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <VoiceControlGlobal />
          <Routes>
            <Route path="/" element={<AiShell />} />
            <Route path="/ai-demo" element={<Navigate to="/" replace />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirm-code" element={<ConfirmCode />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path={CLASSIC_BASE} element={<Navigate to={`${CLASSIC_BASE}/tree`} replace />} />
            <Route path={`${CLASSIC_BASE}/tree`} element={<FamilyTree />} />
            <Route path={`${CLASSIC_BASE}/feed`} element={<Feed />} />
            <Route path={`${CLASSIC_BASE}/publication/:id`} element={<PublicationDetails />} />
            <Route path={`${CLASSIC_BASE}/create`} element={<CreatePublication />} />
            <Route path={`${CLASSIC_BASE}/family`} element={<FamilyList />} />
            <Route path={`${CLASSIC_BASE}/my-profile`} element={<MyProfile />} />
            <Route path={`${CLASSIC_BASE}/profile/:id`} element={<ContactProfile />} />
            <Route path={`${CLASSIC_BASE}/invite`} element={<InviteFlow />} />
            <Route path={`${CLASSIC_BASE}/store`} element={<StorePage />} />
            <Route path={`${CLASSIC_BASE}/settings`} element={<Settings />} />
            <Route path={`${CLASSIC_BASE}/help`} element={<Help />} />
            <Route path="/ai" element={<AIDemoPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PlatformProvider>
  </QueryClientProvider>
);

export default App;
