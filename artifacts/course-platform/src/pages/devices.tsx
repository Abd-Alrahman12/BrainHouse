import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useListDevices, getListDevicesQueryKey, useRemoveDevice, useLogout } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Smartphone, LogOut, Trash2 } from "lucide-react";

export default function DevicesPage() {
  const { token, setToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: devices, isLoading } = useListDevices({ query: { enabled: !!token, queryKey: getListDevicesQueryKey() } });
  const removeDevice = useRemoveDevice();
  const logoutMutation = useLogout();

  const handleRemove = (id: number) => {
    removeDevice.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
          toast({ title: "Device removed" });
        },
      }
    );
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { setToken(null); queryClient.clear(); setLocation("/"); },
    });
  };

  const getDeviceIcon = (ua: string) => {
    if (ua.toLowerCase().includes("mobile")) return <Smartphone className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">LH</div>
          <span className="font-bold text-xl">LearnHub</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/my-courses" className="text-sm font-medium hover:text-primary transition-colors">My Courses</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />Sign Out</Button>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Active Devices</h1>
          <p className="text-muted-foreground mt-1">Manage your active sessions (max 2 devices)</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {devices?.map((device) => (
              <Card key={device.id} data-testid={`card-device-${device.id}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getDeviceIcon(device.userAgent)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{device.userAgent.substring(0, 60)}{device.userAgent.length > 60 ? "..." : ""}</p>
                        {device.current && <Badge variant="secondary">Current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">IP: {device.ip} - Last active: {new Date(device.lastActive).toLocaleString()}</p>
                    </div>
                  </div>
                  {!device.current && (
                    <Button variant="destructive" size="sm" onClick={() => handleRemove(device.id)} data-testid={`button-remove-device-${device.id}`}>
                      <Trash2 className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
