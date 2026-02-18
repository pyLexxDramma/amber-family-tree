import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PlatformProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirm-code" element={<ConfirmCode />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/tree" element={<FamilyTree />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/publication/:id" element={<PublicationDetails />} />
            <Route path="/create" element={<CreatePublication />} />
            <Route path="/family" element={<FamilyList />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/profile/:id" element={<ContactProfile />} />
            <Route path="/invite" element={<InviteFlow />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/ai" element={<AIDemoPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PlatformProvider>
  </QueryClientProvider>
);

export default App;
