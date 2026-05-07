import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetMe, useGetDashboardSummary, getGetMeQueryKey, getGetDashboardSummaryQueryKey, useListMyCourses, getListMyCoursesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, TrendingUp, Video, ArrowRight, Clock, Award } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/use-language";

export default function DashboardPage() {
  const { t, isRTL } = useLanguage();
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: summary, isLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: enrolledCourses } = useListMyCourses({ query: { queryKey: getListMyCoursesQueryKey() } });

  if (me?.approved === false) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{t.pendingTitle}</h2>
            <p className="text-muted-foreground max-w-md">{t.pendingDesc}</p>
          </div>
          <div className="flex gap-2">
            <div className="status-dot bg-amber-400" />
            <span className="text-sm text-muted-foreground">Awaiting approval</span>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: t.enrolledCourses,
      value: summary?.enrolledCourses ?? 0,
      icon: BookOpen,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      label: t.overallProgress,
      value: `${Math.round(summary?.overallProgress ?? 0)}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      progress: summary?.overallProgress ?? 0,
    },
    {
      label: t.videosWatched,
      value: summary?.videosWatched ?? 0,
      icon: Video,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t.progressOverview}</p>
            <h1 className="text-2xl md:text-3xl font-bold">
              {t.welcomeBack} <span className="gradient-text">{me?.name}</span> 👋
            </h1>
          </div>
          <div className="flex gap-2">
            <Link href="/courses">
              <Button variant="outline" size="sm">{t.browseCourses}</Button>
            </Link>
            <Link href="/my-courses">
              <Button size="sm" className="gap-1.5">
                {t.myCourses}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.progress !== undefined && (
                  <div className="progress-premium mt-3">
                    <div className="progress-premium-bar" style={{ width: `${stat.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Continue Learning */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t.continueLearning}</h2>
            <Link href="/my-courses">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {!enrolledCourses || enrolledCourses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Award className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-4">No courses yet. Start learning today!</p>
              <Link href="/courses">
                <Button size="sm">{t.browseCourses}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(enrolledCourses as any[])?.slice(0, 4).map((course: any) => (
                <Link href={`/courses/${course.id}`} key={course.id}>
                  <div className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 card-hover cursor-pointer">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{course.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{Math.round(course.progress ?? 0)}% {t.progress}</p>
                      <div className="progress-premium mt-2 h-1.5">
                        <div className="progress-premium-bar" style={{ width: `${Math.round(course.progress ?? 0)}%` }} />
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
