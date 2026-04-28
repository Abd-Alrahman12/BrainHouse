import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useListMyCourses, getListMyCoursesQueryKey, useLogout } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, LogOut, Monitor } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function MyCoursesPage() {
  const { token, setToken } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: courses, isLoading } = useListMyCourses({ query: { enabled: !!token, queryKey: getListMyCoursesQueryKey() } });
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { setToken(null); queryClient.clear(); setLocation("/"); },
    });
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
          <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">Browse</Link>
          <Link href="/devices" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"><Monitor className="w-4 h-4" />Devices</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />Sign Out</Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">My Courses</h1>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden" data-testid={`card-my-course-${course.id}`}>
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{course.watchedVideos}/{course.totalVideos} videos</span>
                    <span>{Math.round(course.progress)}%</span>
                  </div>
                  <Progress value={course.progress} />
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full mt-2" data-testid={`button-continue-${course.id}`}>
                      {course.progress > 0 ? "Continue Learning" : "Start Learning"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
            <p className="text-muted-foreground mb-4">You haven't been enrolled in any courses yet.</p>
            <Link href="/courses"><Button>Browse Courses</Button></Link>
          </div>
        )}
      </main>
    </div>
  );
}
