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
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Settings, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminCoursesPage() {
  const { adminToken, setAdminToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: courses, isLoading } = useAdminListCourses({ query: { enabled: !!adminToken, queryKey: getAdminListCoursesQueryKey() } });
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        data: { title, description, coverImage: coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800", status, contactEmail, contactPhone, whatsappNumber, instructorName },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCoursesQueryKey() });
          toast({ title: "Course created" });
          setOpen(false);
          setTitle(""); setDescription(""); setCoverImage(""); setStatus("free");
          setContactEmail(""); setContactPhone(""); setWhatsappNumber(""); setInstructorName("");
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCoursesQueryKey() });
          toast({ title: "Course deleted" });
        },
      }
    );
  };

  const handleLogout = () => {
    setAdminToken(null);
    queryClient.clear();
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">LH</div>
          <span className="font-bold text-xl">Admin Panel</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/admin/users" className="text-sm font-medium hover:text-primary transition-colors">Users</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />Sign Out</Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-course"><Plus className="w-4 h-4 mr-1" /> New Course</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required data-testid="input-course-title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required data-testid="input-course-desc" />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image URL</Label>
                  <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." data-testid="input-course-cover" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger data-testid="select-course-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="locked">Locked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Instructor Name</Label>
                  <Input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} data-testid="input-instructor" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" data-testid="input-contact-email" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} data-testid="input-contact-phone" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="e.g. 1234567890" data-testid="input-whatsapp" />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-course">
                  {createMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : (
          <div className="space-y-4">
            {courses?.map((course) => (
              <Card key={course.id} data-testid={`card-admin-course-${course.id}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded bg-muted overflow-hidden">
                      <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{course.title}</p>
                        <Badge variant={course.status === "free" ? "secondary" : "outline"}>{course.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-manage-${course.id}`}>
                        <Settings className="w-4 h-4 mr-1" /> Manage
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
