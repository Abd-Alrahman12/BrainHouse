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
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Settings, LogOut, Pencil } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { COLLEGES } from "@/lib/colleges";
import { customFetch } from "@workspace/api-client-react";

const TEACHERS_KEY = ["admin", "teachers"];

function useUpdateCourse() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      customFetch(`/api/admin/courses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  });
}

interface CourseFormProps {
  teachers: any[];
  lang: string;
  initial?: any;
  onSubmit: (data: any) => void;
  loading: boolean;
  submitLabel: string;
}

function CourseForm({ teachers, lang, initial, onSubmit, loading, submitLabel }: CourseFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [status, setStatus] = useState(initial?.status ?? "free");
  const [teacherId, setTeacherId] = useState(initial?.teacherId ? String(initial.teacherId) : "");
  const [collegeId, setCollegeId] = useState(initial?.collegeId ? String(initial.collegeId) : "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(initial?.whatsappNumber ?? "");
  const [instructorName, setInstructorName] = useState(initial?.instructorName ?? "");

  const handleTeacherChange = (val: string) => {
    setTeacherId(val);
    if (val && val !== "none") {
      const teacher = teachers.find((t: any) => String(t.id) === val);
      if (teacher) {
        if (teacher.name) setInstructorName(teacher.name);
        if (teacher.email) setContactEmail(teacher.email);
        if (teacher.whatsapp) setWhatsappNumber(teacher.whatsapp);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title, description,
      coverImage: coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      status, contactEmail, contactPhone, whatsappNumber, instructorName,
      teacherId: teacherId && teacherId !== "none" ? Number(teacherId) : null,
      collegeId: collegeId && collegeId !== "none" ? Number(collegeId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Cover Image URL</Label>
        <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Teacher</Label>
        <Select value={teacherId} onValueChange={handleTeacherChange}>
          <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No teacher</SelectItem>
            {teachers.map((t: any) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>College</Label>
        <Select value={collegeId} onValueChange={setCollegeId}>
          <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No college</SelectItem>
            {COLLEGES.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {lang === "ar" ? c.name_ar : c.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Instructor Name</Label>
        <Input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Contact Email</Label>
        <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" />
      </div>
      <div className="space-y-2">
        <Label>Contact Phone</Label>
        <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>WhatsApp Number</Label>
        <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="e.g. 962791234567" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

export default function AdminCoursesPage() {
  const { adminToken, setAdminToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isRTL, lang } = useLanguage();

  const { data: courses, isLoading } = useAdminListCourses({ query: { enabled: !!adminToken, queryKey: getAdminListCoursesQueryKey() } });
  const { data: teachers = [] } = useQuery({
    queryKey: TEACHERS_KEY,
    enabled: !!adminToken,
    queryFn: () => customFetch<any[]>("/api/admin/teachers"),
  });

  const createMutation = useAdminCreateCourse();
  const deleteMutation = useAdminDeleteCourse();
  const updateMutation = useUpdateCourse();

  const [createOpen, setCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);

  const handleCreate = (data: any) => {
    createMutation.mutate({ data } as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListCoursesQueryKey() });
        toast({ title: "Course created" });
        setCreateOpen(false);
      },
    });
  };

  const handleUpdate = (data: any) => {
    if (!editCourse) return;
    updateMutation.mutate({ id: editCourse.id, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListCoursesQueryKey() });
        toast({ title: "Course updated" });
        setEditCourse(null);
      },
    });
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
          <span className="font-bold text-xl">Admin Panel</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
          <Link href="/admin/users" className="text-sm font-medium hover:text-primary">Users</Link>
          <Link href="/admin/teachers" className="text-sm font-medium hover:text-primary">Teachers</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />Sign Out</Button>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-1" /> New Course</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
              <CourseForm
                teachers={teachers}
                lang={lang}
                onSubmit={handleCreate}
                loading={createMutation.isPending}
                submitLabel="Create Course"
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : (
          <div className="space-y-4">
            {(courses as any[])?.map((course: any) => (
              <Card key={course.id}>
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
                    <Button variant="outline" size="sm" onClick={() => setEditCourse(course)}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" /> Manage
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(course.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!editCourse} onOpenChange={(o) => { if (!o) setEditCourse(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Course: {editCourse?.title}</DialogTitle></DialogHeader>
          {editCourse && (
            <CourseForm
              teachers={teachers}
              lang={lang}
              initial={editCourse}
              onSubmit={handleUpdate}
              loading={updateMutation.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
