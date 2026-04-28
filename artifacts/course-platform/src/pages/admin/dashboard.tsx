import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAdminDashboard, getAdminDashboardQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, UserCheck, Clock, GraduationCap, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboardPage() {
  const { adminToken, setAdminToken } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: stats, isLoading } = useAdminDashboard({ query: { enabled: !!adminToken, queryKey: getAdminDashboardQueryKey() } });

  const handleLogout = () => {
    setAdminToken(null);
    queryClient.clear();
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">LH</div>
          <span className="font-bold text-xl">Admin Panel</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/admin/users" className="text-sm font-medium hover:text-primary transition-colors">Users</Link>
          <Link href="/admin/courses" className="text-sm font-medium hover:text-primary transition-colors">Courses</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />Sign Out</Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-3xl font-bold" data-testid="text-total-users">{stats?.totalUsers ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <UserCheck className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-3xl font-bold" data-testid="text-approved-users">{stats?.approvedUsers ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-3xl font-bold" data-testid="text-pending-users">{stats?.pendingUsers ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-3xl font-bold" data-testid="text-total-courses">{stats?.totalCourses ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-3xl font-bold" data-testid="text-total-enrollments">{stats?.totalEnrollments ?? 0}</div></CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
