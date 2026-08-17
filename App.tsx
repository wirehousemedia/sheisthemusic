import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "@/pages/Home";
import Mission from "@/pages/Mission";
import Sessions from "@/pages/Sessions";
import Mentorship from "@/pages/Mentorship";
import Committees from "@/pages/Committees";
import Database from "@/pages/Database";
import JobBoard from "@/pages/JobBoard";
import Partners from "@/pages/Partners";
import Spotlight from "@/pages/Spotlight";
import Donate from "@/pages/Donate";
import News from "@/pages/News";
import Espanol from "@/pages/Espanol";
import Compliance from "@/pages/Compliance";
import Notifications from "@/pages/Notifications";
import MemberPortal from "@/pages/MemberPortal";
import Layout from "@/components/Layout";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/mission" component={Mission} />
        <Route path="/sessions" component={Sessions} />
        <Route path="/mentorship" component={Mentorship} />
        <Route path="/committees" component={Committees} />
        <Route path="/database" component={Database} />
        <Route path="/job-board" component={JobBoard} />
        <Route path="/partners" component={Partners} />
        <Route path="/women-sharing-the-spotlight" component={Spotlight} />
        <Route path="/donate" component={Donate} />
        <Route path="/news" component={News} />
        <Route path="/sitm-espanol" component={Espanol} />
        <Route path="/compliance" component={Compliance} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/member-portal" component={MemberPortal} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;