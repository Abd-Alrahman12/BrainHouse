import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useListCourses, getListCoursesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageCircle, Lock, Unlock, X, BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/use-language";
import { COLLEGES } from "@/lib/colleges";

export default function CoursesPage() {
  const { t, isRTL, lang } = useLanguage();
  const { data: courses, isLoading } = useListCourses({ query: { queryKey: getListCoursesQueryKey() } });
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);

  const filtered = (courses as any[])?.filter((c: any) => {
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCollege = !selectedCollege || c.collegeId === selectedCollege;
    return matchSearch && matchCollege;
  });

  const openWhatsApp = (title: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${t.whatsappMsg}${title}`)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      {/* Page Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{t.browseCourses}</h1>
          <p className="text-muted-foreground">{t.discover}</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
            <Input
              placeholder={t.search}
              className={`${isRTL ? "pr-9" : "pl-9"} bg-background`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* College Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCollege(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
              selectedCollege === null
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground bg-card"
            }`}
          >
            {lang === "ar" ? "الكل" : "All"}
          </button>
          {COLLEGES.map((college) => (
            <button
              key={college.id}
              onClick={() => setSelectedCollege(selectedCollege === college.id ? null : college.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
                selectedCollege === college.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground bg-card"
              }`}
            >
              {lang === "ar" ? college.name_ar : college.name_en}
            </button>
          ))}
          {selectedCollege && (
            <button
              onClick={() => setSelectedCollege(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground border border-dashed border-border transition-colors"
            >
              <X className="w-3 h-3" />
              {lang === "ar" ? "مسح" : "Clear"}
            </button>
          )}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No courses found.</p>
            {(search || selectedCollege) && (
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearch(""); setSelectedCollege(null); }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((course: any) => (
              <div key={course.id} className="group rounded-2xl border border-border bg-card overflow-hidden card-hover">
                <div className="aspect-video bg-muted overflow-hidden relative">
                  <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      course.status === "free"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-black/60 text-white"
                    }`}>
                      {course.status === "free" ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {course.status === "free" ? t.free : t.locked}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {(course.college || course.teacher) && (
                    <div className="flex flex-wrap gap-1.5">
                      {course.college && (
                        <span className="badge-info">
                          {lang === "ar" ? course.college.name_ar : course.college.name_en}
                        </span>
                      )}
                      {course.teacher && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
                          👨‍🏫 {course.teacher.name}
                        </span>
                      )}
                    </div>
                  )}

                  <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{course.description}</p>

                  <div className="flex gap-2 pt-1">
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <Button className="w-full h-9 text-sm btn-premium" size="sm">{t.viewCourse}</Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 shrink-0"
                      onClick={() => openWhatsApp(course.title)}
                      title={t.requestWhatsApp}
                    >
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
