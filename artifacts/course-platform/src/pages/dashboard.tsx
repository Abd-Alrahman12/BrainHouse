import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetMe, useGetDashboardSummary, getGetMeQueryKey, getGetDashboardSummaryQueryKey, useListMyEnrolledCourses, getListMyEnrolledCoursesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, TrendingUp, Video, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/use-language";

export default function DashboardPage() {
  const { t, isRTL } = useLanguage();
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: summary, isLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: enrolledCourses } = useListMyEnrolledCourses({ query: { queryKey: getListMyEnrolledCoursesQueryKey() } });

  if (me?.approved === false) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-center p-6">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-2xl">⏳</div>
          <h2 className="text-2xl font-bold">{t.pendingTitle}</h2>
          <p className="text-muted-foreground max-w-md">{t.pendingDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t.welcomeBack} {me?.name}</h1>
          <p className="text-muted-foreground mt-1">{t.progressOverview}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.enrolledCourses}</CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary?.enrolledCourses ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.overallProgress}</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{Math.round(summary?.overallProgress ?? 0)}%</p>
                <Progress value={summary?.overallProgress ?? 0} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.videosWatched}</CardTitle>
                <Video className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary?.videosWatched ?? 0}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4">{t.continueLearning}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {enrolledCourses?.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{course.title}</p>
                    <p className="text-sm text-muted-foreground">{Math.round(course.progress ?? 0)}% {t.progress}</p>
                    <Progress value={course.progress ?? 0} className="mt-1 h-1.5" />
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
