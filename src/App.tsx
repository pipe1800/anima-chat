
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import OnboardingGuard from "@/components/auth/OnboardingGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmailConfirmation from "./pages/EmailConfirmation";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Chat from "./pages/Chat";
import CharacterCreator from "./pages/CharacterCreator";
import WorldInfoCreator from "./pages/WorldInfoCreator";
import UserProfile from "./pages/UserProfile";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import Moderation from "./pages/Moderation";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import CharacterProfile from "./pages/CharacterProfile";
import PublicDiscover from "./pages/PublicDiscover";
import PublicCharacterProfile from "./pages/PublicCharacterProfile";
import PublicWorldInfoProfile from "./pages/PublicWorldInfoProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/characters" element={<PublicDiscover />} />
            <Route path="/characters/:characterId" element={<PublicCharacterProfile />} />
            <Route path="/world-info/:id" element={<PublicWorldInfoProfile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={
              <OnboardingGuard>
                <Onboarding />
              </OnboardingGuard>
            } />
            <Route path="/dashboard" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <Dashboard />
              </OnboardingGuard>
            } />
            <Route path="/discover" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <Discover />
              </OnboardingGuard>
            } />
            <Route path="/chat" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <Chat />
              </OnboardingGuard>
            } />
            <Route path="/character-creator" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <CharacterCreator />
              </OnboardingGuard>
            } />
            <Route path="/world-info-creator" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <WorldInfoCreator />
              </OnboardingGuard>
            } />
            <Route path="/profile/*" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <UserProfile />
              </OnboardingGuard>
            } />
            <Route path="/subscription" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <Subscription />
              </OnboardingGuard>
            } />
            <Route path="/settings" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <Settings />
              </OnboardingGuard>
            } />
            <Route path="/moderation" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <Moderation />
              </OnboardingGuard>
            } />
            <Route path="/guidelines" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <CommunityGuidelines />
              </OnboardingGuard>
            } />
            <Route path="/character/:characterId" element={
              <OnboardingGuard requireOnboardingComplete={true}>
                <CharacterProfile />
              </OnboardingGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
