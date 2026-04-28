import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAdminListUsers, getAdminListUsersQueryKey, useAdminApproveUser, useAdminDenyUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminUsersPage() {
  const { adminToken, setAdminToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useAdminListUsers({ query: { enabled: !!adminToken, queryKey: getAdminListUsersQueryKey() } });
  const approveMutation = useAdminApproveUser();
  const denyMutation = useAdminDenyUser();

  const handleApprove = (id: number) => {
    approveMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
          toast({ title: "User approved" });
        },
      }
    );
  };

  const handleDeny = (id: number) => {
    denyMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
          toast({ title: "User denied" });
        },
      }
    );
  };

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
          <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/admin/courses" className="text-sm font-medium hover:text-primary transition-colors">Courses</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />Sign Out</Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">User Management</h1>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : (
          <div className="space-y-4">
            {users?.map((user) => (
              <Card key={user.id} data-testid={`card-user-${user.id}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      <Badge variant={user.approved ? "secondary" : "outline"}>{user.approved ? "Approved" : "Pending"}</Badge>
                      {user.role === "admin" && <Badge>Admin</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email} - Enrolled in {user.enrollmentCount} courses - Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!user.approved && (
                      <Button size="sm" onClick={() => handleApprove(user.id)} data-testid={`button-approve-${user.id}`}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    )}
                    {user.approved && user.role !== "admin" && (
                      <Button variant="destructive" size="sm" onClick={() => handleDeny(user.id)} data-testid={`button-deny-${user.id}`}>
                        <X className="w-4 h-4 mr-1" /> Deny
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
