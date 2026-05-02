import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useListCourses, getListCoursesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageCircle, Lock, Unlock, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/use-language";
import { COLLEGES, getCollegeName } from "@/lib/colleges";

export default function CoursesPage() {
  const { t, isRTL, lang } = useLanguage();
  const { data: courses, isLoading } = useListCourses({ query: { queryKey: getListCoursesQueryKey() } });
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);

  const filtered = courses?.filter((c: any) => {
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCollege = !selectedCollege || c.collegeId === selectedCollege;
    return matchSearch && matchCollege;
  });

  const openWhatsApp = (title: string) => {
    const message = encodeURIComponent(`${t.whatsappMsg}${title}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t.browseCourses}</h1>
          <p className="text-muted-foreground mt-1">{t.discover}</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <Input
            placeholder={t.search}
            className={isRTL ? "pr-9" : "pl-9"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* College Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCollege === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCollege(null)}
          >
            {lang === "ar" ? "الكل" : "All"}
          </Button>
          {COLLEGES.map((college) => (
            <Button
              key={college.id}
              variant={selectedCollege === college.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCollege(selectedCollege === college.id ? null : college.id)}
            >
              {lang === "ar" ? college.name_ar : college.name_en}
            </Button>
          ))}
          {selectedCollege && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedCollege(null)}>
              <X className="w-3 h-3 mr-1" /> {lang === "ar" ? "مسح" : "Clear"}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((course: any) => (
              <Card key={course.id} className="overflow-hidden group" data-testid={`card-course-${course.id}`}>
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <Badge variant={course.status === "free" ? "secondary" : "outline"} className="flex items-center gap-1">
                      {course.status === "free" ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {course.status === "free" ? t.free : t.locked}
                    </Badge>
                  </div>

                  {/* College badge */}
                  {course.college && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
                      {lang === "ar" ? course.college.name_ar : course.college.name_en}
                    </Badge>
                  )}

                  {/* Teacher name */}
                  {course.teacher && (
                    <p className="text-xs text-muted-foreground">👨‍🏫 {course.teacher.name}</p>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                  <div className="flex gap-2">
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" data-testid={`button-view-${course.id}`}>{t.viewCourse}</Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => openWhatsApp(course.title)} title={t.requestWhatsApp}>
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
            <p className="text-lg">No courses found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
