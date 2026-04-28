import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "wouter";
import { useGetMe, useGetDashboardSummary, getGetMeQueryKey, getGetDashboardSummaryQueryKey, useLogout } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, TrendingUp, PlayCircle, Monitor, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
  const { token, setToken } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({ query: { enabled: !!token, queryKey: getGetDashboardSummaryQueryKey() } });
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setToken(null);
        queryClient.clear();
        setLocation("/");
      },
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (user && !user.approved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Account Pending Approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Your account is awaiting admin approval. You'll be able to access courses once approved.</p>
            <div className="flex gap-2 justify-center">
              <Link href="/courses"><Button variant="outline">Browse Courses</Button></Link>
              <Button variant="ghost" onClick={handleLogout}>Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">LH</div>
            <span className="font-bold text-xl">LearnHub</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">Courses</Link>
          <Link href="/my-courses" className="text-sm font-medium hover:text-primary transition-colors">My Courses</Link>
          <Link href="/devices" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"><Monitor className="w-4 h-4" />Devices</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout"><LogOut className="w-4 h-4 mr-1" />Sign Out</Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-welcome">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your learning progress</p>
        </div>

        {summaryLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-enrolled-count">{summary?.enrolledCourses ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-progress">{Math.round(summary?.totalProgress ?? 0)}%</div>
                <Progress value={summary?.totalProgress ?? 0} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Videos Watched</CardTitle>
                <PlayCircle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-videos-watched">{summary?.totalVideosWatched ?? 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {summary?.recentCourses && summary.recentCourses.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {summary.recentCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold">{course.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.watchedVideos}/{course.totalVideos} videos</span>
                      <span>{Math.round(course.progress)}%</span>
                    </div>
                    <Progress value={course.progress} />
                    <Link href={`/courses/${course.id}`}>
                      <Button className="w-full mt-2" data-testid={`button-continue-${course.id}`}>Continue</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
