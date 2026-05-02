import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { useAdminListCourses, getAdminListCoursesQueryKey, useAdminCreateCourse, useAdminDeleteCourse } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Settings, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { COLLEGES, getCollegeName } from "@/lib/colleges";
import { customFetch } from "@workspace/api-client-react";

const TEACHERS_KEY = ["admin", "teachers"];

export default function AdminCoursesPage() {
  const { adminToken, setAdminToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, isRTL, lang } = useLanguage();

  const { data: courses, isLoading } = useAdminListCourses({ query: { enabled: !!adminToken, queryKey: getAdminListCoursesQueryKey() } });
  const { data: teachers } = useQuery({
    queryKey: TEACHERS_KEY,
    enabled: !!adminToken,
    queryFn: () => customFetch<any[]>("/api/admin/teachers"),
  });

  const createMutation = useAdminCreateCourse();
  const deleteMutation = useAdminDeleteCourse();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("free");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [collegeId, setCollegeId] = useState("");

  const resetForm = () => {
    setTitle(""); setDescription(""); setCoverImage(""); setStatus("free");
    setContactEmail(""); setContactPhone(""); setWhatsappNumber(""); setInstructorName("");
    setTeacherId(""); setCollegeId("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        data: {
          title, description,
          coverImage: coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
          status, contactEmail, contactPhone, whatsappNumber, instructorName,
          ...(teacherId ? { teacherId: Number(teacherId) } : {}),
          ...(collegeId ? { collegeId: Number(collegeId) } : {}),
        } as any,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCoursesQueryKey() });
          toast({ title: "Course created" });
          setOpen(false);
          resetForm();
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListCoursesQueryKey() });
        toast({ title: "Course deleted" });
      },
    });
  };

  const handleLogout = () => { setAdminToken(null); queryClient.clear(); setLocation("/admin"); };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="BrainHouse" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl">{t.adminPanel}</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary">{t.dashboard}</Link>
          <Link href="/admin/users" className="text-sm font-medium hover:text-primary">{t.users}</Link>
          <Link href="/admin/teachers" className="text-sm font-medium hover:text-primary">{t.teachers}</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />{t.signOut}</Button>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t.courseManagement}</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-course"><Plus className="w-4 h-4 mr-1" /> {t.newCourse}</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{t.createCourse}</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.title} *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required data-testid="input-course-title" />
                </div>
                <div className="space-y-2">
                  <Label>{t.description} *</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required data-testid="input-course-desc" />
                </div>
                <div className="space-y-2">
                  <Label>{t.coverImageUrl}</Label>
                  <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." data-testid="input-course-cover" />
                </div>
                <div className="space-y-2">
                  <Label>{t.status}</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger data-testid="select-course-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">{t.free}</SelectItem>
                      <SelectItem value="locked">{t.locked}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Teacher dropdown */}
                <div className="space-y-2">
                  <Label>{t.teacherOptional}</Label>
                  <Select value={teacherId} onValueChange={setTeacherId}>
                    <SelectTrigger><SelectValue placeholder={t.selectTeacher} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t.noTeacher}</SelectItem>
                      {teachers?.map((teacher) => (
                        <SelectItem key={teacher.id} value={String(teacher.id)}>{teacher.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* College dropdown */}
                <div className="space-y-2">
                  <Label>College</Label>
                  <Select value={collegeId} onValueChange={setCollegeId}>
                    <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No college</SelectItem>
                      {COLLEGES.map((college) => (
                        <SelectItem key={college.id} value={String(college.id)}>
                          {lang === "ar" ? college.name_ar : college.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.instructorName}</Label>
                  <Input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} data-testid="input-instructor" />
                </div>
                <div className="space-y-2">
                  <Label>{t.contactEmail}</Label>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" data-testid="input-contact-email" />
                </div>
                <div className="space-y-2">
                  <Label>{t.contactPhone}</Label>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} data-testid="input-contact-phone" />
                </div>
                <div className="space-y-2">
                  <Label>{t.whatsappNumber}</Label>
                  <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="e.g. 1234567890" data-testid="input-whatsapp" />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-course">
                  {createMutation.isPending ? t.creating : t.createCourse}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : (
          <div className="space-y-4">
            {courses?.map((course: any) => (
              <Card key={course.id} data-testid={`card-admin-course-${course.id}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded bg-muted overflow-hidden">
                      <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{course.title}</p>
                        <Badge variant={course.status === "free" ? "secondary" : "outline"}>{course.status}</Badge>
                        {course.college && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                            {lang === "ar" ? course.college.name_ar : course.college.name_en}
                          </Badge>
                        )}
                        {course.teacher && (
                          <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                            {course.teacher.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{course.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-manage-${course.id}`}>
                        <Settings className="w-4 h-4 mr-1" /> {t.manage}
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(course.id)} data-testid={`button-delete-${course.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
