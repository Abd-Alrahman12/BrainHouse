import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAdminDashboard, getAdminDashboardQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, UserCheck, Clock, GraduationCap, BarChart3, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";

export default function AdminDashboardPage() {
  const { adminToken, setAdminToken } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();
  const { data: stats, isLoading } = useAdminDashboard({ query: { enabled: !!adminToken, queryKey: getAdminDashboardQueryKey() } });

  const handleLogout = () => { setAdminToken(null); queryClient.clear(); setLocation("/admin"); };

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-violet-600", bg: "bg-violet-50", change: "Active accounts" },
    { label: "Approved", value: stats?.approvedUsers ?? 0, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", change: "Verified users" },
    { label: "Pending", value: stats?.pendingUsers ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", change: "Awaiting review" },
    { label: "Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50", change: "Published" },
    { label: "Enrollments", value: stats?.totalEnrollments ?? 0, icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50", change: "Total registrations" },
  ];

  const navItems = [
    { href: "/admin/users", icon: Users, label: "Users", desc: "Manage all users" },
    { href: "/admin/courses", icon: BookOpen, label: "Courses", desc: "Create & manage courses" },
    { href: "/admin/teachers", icon: GraduationCap, label: "Teachers", desc: "Manage instructors" },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Admin Sidebar Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="BrainHouse" className="h-8 w-8 object-contain" />
              <div>
                <p className="font-bold text-sm">BrainHouse</p>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Management</p>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="nav-item group cursor-pointer">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.label}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="border-b border-border bg-card/50 px-6 py-4 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="BrainHouse" className="h-7 w-7 object-contain" />
              <span className="font-bold">Admin</span>
            </div>
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" size="sm" className="text-xs">{item.label}</Button>
                </Link>
              ))}
              <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-8">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Dashboard Overview
              </h1>
              <p className="text-muted-foreground text-sm">Platform statistics at a glance</p>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((s, i) => (
                  <div key={i} className="stat-card card-hover">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.bg}`}>
                      <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs font-medium mt-0.5">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.change}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 card-hover cursor-pointer transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <item.icon className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
