import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import CoursesPage from "@/pages/courses";
import CourseDetailPage from "@/pages/courses/detail";
import MyCoursesPage from "@/pages/my-courses";
import DevicesPage from "@/pages/devices";

import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminUsersPage from "@/pages/admin/users";
import AdminCoursesPage from "@/pages/admin/courses";
import AdminCourseDetailPage from "@/pages/admin/courses/detail";
import AdminTeachersPage from "@/pages/admin/teachers";

import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, admin = false, ...rest }: any) {
  const { token, adminToken } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (admin && !adminToken) {
      setLocation("/admin");
    } else if (!admin && !token) {
      setLocation("/login");
    }
  }, [token, adminToken, admin, setLocation]);

  if (admin && !adminToken) return null;
  if (!admin && !token) return null;

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/courses" component={CoursesPage} />
      
      {/* Protected User Routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      <Route path="/courses/:id">
        {(params) => <ProtectedRoute component={CourseDetailPage} params={params} />}
      </Route>
      <Route path="/my-courses">
        {() => <ProtectedRoute component={MyCoursesPage} />}
      </Route>
      <Route path="/devices">
        {() => <ProtectedRoute component={DevicesPage} />}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/dashboard">
        {() => <ProtectedRoute admin component={AdminDashboardPage} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute admin component={AdminUsersPage} />}
      </Route>
      <Route path="/admin/courses">
        {() => <ProtectedRoute admin component={AdminCoursesPage} />}
      </Route>
      <Route path="/admin/courses/:id">
        {(params) => <ProtectedRoute admin component={AdminCourseDetailPage} params={params} />}
      </Route>
      <Route path="/admin/teachers">
        {() => <ProtectedRoute admin component={AdminTeachersPage} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
