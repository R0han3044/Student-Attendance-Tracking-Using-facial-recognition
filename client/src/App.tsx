import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import TeacherDashboard from "@/pages/teacher-dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";

function AuthenticatedApp() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !user?.user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={() => {
        switch (user.user.role) {
          case 'teacher':
            return <TeacherDashboard user={user.user} />;
          case 'student':
            return <StudentDashboard user={user.user} />;
          case 'parent':
            return <ParentDashboard user={user.user} />;
          default:
            return <NotFound />;
        }
      }} />
      <Route path="/teacher" component={() => <TeacherDashboard user={user.user} />} />
      <Route path="/student" component={() => <StudentDashboard user={user.user} />} />
      <Route path="/parent" component={() => <ParentDashboard user={user.user} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
