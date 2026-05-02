import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Pencil, LogOut, MessageCircle, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { customFetch } from "@workspace/api-client-react";

const TEACHERS_KEY = ["admin", "teachers"];

function useTeachers(enabled: boolean) {
  return useQuery({
    queryKey: TEACHERS_KEY,
    enabled,
    queryFn: () => customFetch<any[]>("/api/admin/teachers"),
  });
}

function useCreateTeacher() {
  return useMutation({
    mutationFn: (data: any) => customFetch("/api/admin/teachers", { method: "POST", body: JSON.stringify(data) }),
  });
}

function useUpdateTeacher() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      customFetch(`/api/admin/teachers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  });
}

function useDeleteTeacher() {
  return useMutation({
    mutationFn: (id: number) => customFetch(`/api/admin/teachers/${id}`, { method: "DELETE" }),
  });
}

export default function AdminTeachersPage() {
  const { adminToken, setAdminToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, isRTL } = useLanguage();

  const { data: teachers, isLoading } = useTeachers(!!adminToken);
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const deleteMutation = useDeleteTeacher();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");

  const resetForm = () => { setName(""); setEmail(""); setWhatsapp(""); setBio(""); };

  const handleCreate = () => {
    if (!name) return;
    createMutation.mutate({ name, email, whatsapp, bio }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: TEACHERS_KEY });
        toast({ title: "Teacher created" });
        setCreateOpen(false);
        resetForm();
      },
    });
  };

  const handleEdit = (teacher: any) => {
    setEditTeacher(teacher);
    setName(teacher.name);
    setEmail(teacher.email || "");
    setWhatsapp(teacher.whatsapp || "");
    setBio(teacher.bio || "");
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editTeacher) return;
    updateMutation.mutate({ id: editTeacher.id, data: { name, email, whatsapp, bio } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: TEACHERS_KEY });
        toast({ title: "Teacher updated" });
        setEditOpen(false);
        resetForm();
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: TEACHERS_KEY });
        toast({ title: "Teacher deleted" });
      },
    });
  };

  const handleLogout = () => { setAdminToken(null); queryClient.clear(); setLocation("/admin"); };

  const TeacherForm = ({ onSubmit, loading }: { onSubmit: () => void; loading: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Teacher name" />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="teacher@example.com" />
      </div>
      <div className="space-y-2">
        <Label>WhatsApp Number</Label>
        <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 962791234567" />
      </div>
      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short description..." rows={3} />
      </div>
      <Button className="w-full" onClick={onSubmit} disabled={loading || !name}>
        {loading ? "Saving..." : "Save"}
      </Button>
    </div>
  );

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
          <Link href="/admin/courses" className="text-sm font-medium hover:text-primary">{t.courses}</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />{t.signOut}</Button>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t.teachers}</h1>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-1" /> {t.addTeacher}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t.addTeacher}</DialogTitle></DialogHeader>
              <TeacherForm onSubmit={handleCreate} loading={createMutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : (
          <div className="space-y-4">
            {teachers?.length === 0 && (
              <p className="text-center text-muted-foreground py-12">{t.noTeachers}</p>
            )}
            {teachers?.map((teacher) => (
              <Card key={teacher.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{teacher.name}</p>
                    {teacher.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{teacher.bio}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      {teacher.email && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" /> {teacher.email}
                        </span>
                      )}
                      {teacher.whatsapp && (
                        <a href={`https://wa.me/${teacher.whatsapp}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-green-600 hover:underline">
                          <MessageCircle className="w-3 h-3" /> {teacher.whatsapp}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(teacher)}>
                      <Pencil className="w-4 h-4 mr-1" /> {t.save.replace("Save", "Edit")}Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(teacher.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Teacher</DialogTitle></DialogHeader>
          <TeacherForm onSubmit={handleUpdate} loading={updateMutation.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
