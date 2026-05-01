import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useListCourses, getListCoursesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageCircle, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/use-language";

export default function CoursesPage() {
  const { t, isRTL } = useLanguage();
  const { data: courses, isLoading } = useListCourses({ query: { queryKey: getListCoursesQueryKey() } });
  const [search, setSearch] = useState("");

  const filtered = courses?.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const openWhatsApp = (title: string) => {
    const message = encodeURIComponent(`${t.whatsappMsg}${title}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.browseCourses}</h1>
            <p className="text-muted-foreground mt-1">{t.discover}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <Input
            placeholder={t.search}
            className={isRTL ? "pr-9" : "pl-9"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((course) => (
              <Card key={course.id} className="overflow-hidden group" data-testid={`card-course-${course.id}`}>
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <Badge variant={course.status === "free" ? "secondary" : "outline"} className="flex items-center gap-1">
                      {course.status === "free" ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {course.status === "free" ? t.free : t.locked}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  <div className="flex gap-2">
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" data-testid={`button-view-${course.id}`}>{t.viewCourse}</Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => openWhatsApp(course.title)} title={t.requestWhatsApp} data-testid={`button-whatsapp-${course.id}`}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filtered?.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No courses found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
