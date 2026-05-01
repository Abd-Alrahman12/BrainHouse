import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useListMyEnrolledCourses, getListMyEnrolledCoursesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/use-language";

export default function MyCoursesPage() {
  const { t, isRTL } = useLanguage();
  const { data: courses, isLoading } = useListMyEnrolledCourses({ query: { queryKey: getListMyEnrolledCoursesQueryKey() } });

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t.myCourses}</h1>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses?.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <Badge variant="secondary">{Math.round(course.progress ?? 0)}%</Badge>
                  </div>
                  <Progress value={course.progress ?? 0} className="h-2" />
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full">{t.continue}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            {courses?.length === 0 && (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
                <p className="text-lg">No enrolled courses yet.</p>
                <Link href="/courses">
                  <Button className="mt-4">{t.browseCourses}</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
