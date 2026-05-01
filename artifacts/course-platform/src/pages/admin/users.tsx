import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useAdminListUsers, getAdminListUsersQueryKey, useAdminApproveUser, useAdminDenyUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, LogOut, Search, Smartphone } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";

export default function AdminUsersPage() {
  const { adminToken, setAdminToken } = useAuth();
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useAdminListUsers({ query: { enabled: !!adminToken, queryKey: getAdminListUsersQueryKey() } });
  const approveMutation = useAdminApproveUser();
  const denyMutation = useAdminDenyUser();

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        toast({ title: "User approved" });
      },
    });
  };

  const handleDeny = (id: number) => {
    denyMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        toast({ title: "User denied" });
      },
    });
  };

  const handleLogout = () => {
    setAdminToken(null);
    queryClient.clear();
    setLocation("/admin");
  };

  const filtered = users?.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const getDeviceBadge = (count: number) => {
    if (count === 0) return <Badge variant="outline" className="text-xs gap-1"><Smartphone className="w-3 h-3" />0</Badge>;
    if (count === 1) return <Badge variant="secondary" className="text-xs gap-1 bg-green-100 text-green-800 border-green-200"><Smartphone className="w-3 h-3" />1</Badge>;
    if (count === 2) return <Badge className="text-xs gap-1 bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"><Smartphone className="w-3 h-3" />2 — Max Reached</Badge>;
    return <Badge className="text-xs gap-1 bg-red-100 text-red-800 border-red-200 hover:bg-red-100"><Smartphone className="w-3 h-3" />{count} — Over Limit</Badge>;
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="BrainHouse" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl">{t.adminPanel}</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors">{t.dashboard}</Link>
          <Link href="/admin/courses" className="text-sm font-medium hover:text-primary transition-colors">{t.courses}</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />{t.signOut}</Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t.users}</h1>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <Input
            placeholder="Search by name or email..."
            className={isRTL ? "pr-9" : "pl-9"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : (
          <div className="space-y-4">
            {filtered?.map((user) => (
              <Card key={user.id} data-testid={`card-user-${user.id}`}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{user.name}</p>
                      <Badge variant={user.approved ? "secondary" : "outline"}>
                        {user.approved ? t.approved : t.pending}
                      </Badge>
                      {user.role === "admin" && <Badge>Admin</Badge>}
                      {/* Device count indicator */}
                      {user.role !== "admin" && getDeviceBadge((user as any).deviceCount ?? 0)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {user.email} · {user.enrollmentCount} {t.enrollments} · {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!user.approved && (
                      <Button size="sm" onClick={() => handleApprove(user.id)} data-testid={`button-approve-${user.id}`}>
                        <Check className="w-4 h-4 mr-1" /> {t.approved}
                      </Button>
                    )}
                    {user.approved && user.role !== "admin" && (
                      <Button variant="destructive" size="sm" onClick={() => handleDeny(user.id)} data-testid={`button-deny-${user.id}`}>
                        <X className="w-4 h-4 mr-1" /> {t.delete}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No users found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
