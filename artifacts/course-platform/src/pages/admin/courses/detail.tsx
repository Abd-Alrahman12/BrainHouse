import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import {
  useGetCourse, getGetCourseQueryKey,
  useListCourseVideos, getListCourseVideosQueryKey,
  useListCourseFiles, getListCourseFilesQueryKey,
  useListCourseSessions, getListCourseSessionsQueryKey,
  useAdminListEnrollments, getAdminListEnrollmentsQueryKey,
  useAdminListUsers, getAdminListUsersQueryKey,
  useAdminCreateSection, useAdminCreateVideo,
  useAdminCreateFileCategory, useAdminCreateFile,
  useAdminCreateSession, useAdminEnrollUser,
  useAdminDeleteVideo, useAdminDeleteSection,
  useAdminDeleteFile, useAdminDeleteFileCategory,
  useAdminDeleteSession,
} from "@workspace/api-client-react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, ArrowLeft, Users, Video, FileText, Calendar, LogOut, UserMinus } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";

// Custom hook for unenrolling a user
function useAdminUnenrollUser() {
  return useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: number; userId: number }) => {
      return customFetch(`/api/admin/courses/${courseId}/enrollments/${userId}`, {
        method: "DELETE",
      });
    },
  });
}

export default function AdminCourseDetailPage({ params }: { params?: { id: string } }) {
  const courseId = Number(params?.id);
  const { adminToken, setAdminToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, isRTL } = useLanguage();

  const { data: course } = useGetCourse(courseId, { query: { enabled: !!courseId, queryKey: getGetCourseQueryKey(courseId) } });
  const { data: videos, isLoading: videosLoading } = useListCourseVideos(courseId, { query: { enabled: !!courseId, queryKey: getListCourseVideosQueryKey(courseId) } });
  const { data: files, isLoading: filesLoading } = useListCourseFiles(courseId, { query: { enabled: !!courseId, queryKey: getListCourseFilesQueryKey(courseId) } });
  const { data: sessions, isLoading: sessionsLoading } = useListCourseSessions(courseId, { query: { enabled: !!courseId, queryKey: getListCourseSessionsQueryKey(courseId) } });
  const { data: enrollments, isLoading: enrollmentsLoading } = useAdminListEnrollments(courseId, { query: { enabled: !!courseId, queryKey: getAdminListEnrollmentsQueryKey(courseId) } });
  const { data: allUsers } = useAdminListUsers({ query: { enabled: !!adminToken, queryKey: getAdminListUsersQueryKey() } });

  const createSection = useAdminCreateSection();
  const createVideo = useAdminCreateVideo();
  const createFileCategory = useAdminCreateFileCategory();
  const createFile = useAdminCreateFile();
  const createSession = useAdminCreateSession();
  const enrollUser = useAdminEnrollUser();
  const deleteVideo = useAdminDeleteVideo();
  const deleteSection = useAdminDeleteSection();
  const deleteFile = useAdminDeleteFile();
  const deleteFileCategory = useAdminDeleteFileCategory();
  const deleteSession = useAdminDeleteSession();
  const unenrollUser = useAdminUnenrollUser();

  const [sectionTitle, setSectionTitle] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoSectionId, setVideoSectionId] = useState("");
  const [catName, setCatName] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileCatId, setFileCatId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionLink, setSessionLink] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [enrollUserId, setEnrollUserId] = useState("");

  // Confirmation dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{ userId: number; userName: string } | null>(null);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListCourseVideosQueryKey(courseId) });
    queryClient.invalidateQueries({ queryKey: getListCourseFilesQueryKey(courseId) });
    queryClient.invalidateQueries({ queryKey: getListCourseSessionsQueryKey(courseId) });
    queryClient.invalidateQueries({ queryKey: getAdminListEnrollmentsQueryKey(courseId) });
  };

  const handleLogout = () => { setAdminToken(null); queryClient.clear(); setLocation("/admin"); };

  const handleRemoveClick = (userId: number, userName: string) => {
    setStudentToRemove({ userId, userName });
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!studentToRemove) return;
    unenrollUser.mutate(
      { courseId, userId: studentToRemove.userId },
      {
        onSuccess: () => {
          invalidateAll();
          toast({ title: t.studentRemoved });
          setRemoveDialogOpen(false);
          setStudentToRemove(null);
        },
        onError: () => {
          toast({ title: "Error removing student", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <Link href="/admin/courses" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />Sign Out</Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">{course?.title || "Course"}</h1>

        <Tabs defaultValue="videos">
          <TabsList>
            <TabsTrigger value="videos" className="flex items-center gap-1"><Video className="w-4 h-4" />{t.videos}</TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-1"><FileText className="w-4 h-4" />{t.files}</TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-1"><Calendar className="w-4 h-4" />{t.sessions}</TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-1"><Users className="w-4 h-4" />Students ({enrollments?.length ?? 0})</TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label>{t.sectionTitle}</Label>
                <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="e.g. Introduction" data-testid="input-section-title" />
              </div>
              <Button onClick={() => {
                if (!sectionTitle) return;
                createSection.mutate({ courseId, data: { title: sectionTitle } }, { onSuccess: () => { invalidateAll(); setSectionTitle(""); toast({ title: "Section created" }); } });
              }} data-testid="button-add-section"><Plus className="w-4 h-4 mr-1" /> {t.addSection}</Button>
            </div>

            {videos && videos.length > 0 && (
              <div className="flex gap-2 items-end">
                <div className="space-y-1">
                  <Label>{t.section}</Label>
                  <Select value={videoSectionId} onValueChange={setVideoSectionId}>
                    <SelectTrigger className="w-40" data-testid="select-video-section"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{videos.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <Label>{t.videoTitle}</Label>
                  <Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="e.g. Lesson 1" data-testid="input-video-title" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label>{t.videoUrl}</Label>
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube/Vimeo URL" data-testid="input-video-url" />
                </div>
                <Button onClick={() => {
                  if (!videoTitle || !videoUrl || !videoSectionId) return;
                  createVideo.mutate({ sectionId: Number(videoSectionId), data: { title: videoTitle, url: videoUrl } }, { onSuccess: () => { invalidateAll(); setVideoTitle(""); setVideoUrl(""); toast({ title: "Video added" }); } });
                }} data-testid="button-add-video"><Plus className="w-4 h-4 mr-1" /> {t.addVideo}</Button>
              </div>
            )}

            {videosLoading ? <Skeleton className="h-32" /> : videos?.map((section) => (
              <Card key={section.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <Button variant="destructive" size="sm" onClick={() => { deleteSection.mutate({ id: section.id }, { onSuccess: invalidateAll }); }}><Trash2 className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {section.videos.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <span>{v.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">{v.url}</span>
                        <Button variant="ghost" size="sm" onClick={() => { deleteVideo.mutate({ id: v.id }, { onSuccess: invalidateAll }); }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {section.videos.length === 0 && <p className="text-sm text-muted-foreground">No videos in this section</p>}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label>{t.categoryName}</Label>
                <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Lecture Notes" data-testid="input-cat-name" />
              </div>
              <Button onClick={() => {
                if (!catName) return;
                createFileCategory.mutate({ courseId, data: { name: catName } }, { onSuccess: () => { invalidateAll(); setCatName(""); toast({ title: "Category created" }); } });
              }} data-testid="button-add-category"><Plus className="w-4 h-4 mr-1" /> {t.addCategory}</Button>
            </div>

            {files && files.length > 0 && (
              <div className="flex gap-2 items-end">
                <div className="space-y-1">
                  <Label>{t.category}</Label>
                  <Select value={fileCatId} onValueChange={setFileCatId}>
                    <SelectTrigger className="w-40" data-testid="select-file-cat"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{files.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <Label>{t.fileName}</Label>
                  <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g. Chapter 1 Notes" data-testid="input-file-name" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label>{t.fileUrl}</Label>
                  <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." data-testid="input-file-url" />
                </div>
                <Button onClick={() => {
                  if (!fileName || !fileUrl || !fileCatId) return;
                  createFile.mutate({ categoryId: Number(fileCatId), data: { name: fileName, url: fileUrl } }, { onSuccess: () => { invalidateAll(); setFileName(""); setFileUrl(""); toast({ title: "File added" }); } });
                }} data-testid="button-add-file"><Plus className="w-4 h-4 mr-1" /> {t.addFile}</Button>
              </div>
            )}

            {filesLoading ? <Skeleton className="h-32" /> : files?.map((cat) => (
              <Card key={cat.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{cat.name}</CardTitle>
                  <Button variant="destructive" size="sm" onClick={() => { deleteFileCategory.mutate({ id: cat.id }, { onSuccess: invalidateAll }); }}><Trash2 className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cat.files.map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <span>{f.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">{f.url}</span>
                        <Button variant="ghost" size="sm" onClick={() => { deleteFile.mutate({ id: f.id }, { onSuccess: invalidateAll }); }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label>{t.sessionTitle}</Label>
                <Input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="e.g. Q&A Session" data-testid="input-session-title" />
              </div>
              <div className="flex-1 space-y-1">
                <Label>{t.meetingLink}</Label>
                <Input value={sessionLink} onChange={(e) => setSessionLink(e.target.value)} placeholder="https://zoom.us/..." data-testid="input-session-link" />
              </div>
              <div className="space-y-1">
                <Label>{t.dateOptional}</Label>
                <Input type="datetime-local" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} data-testid="input-session-date" />
              </div>
              <Button onClick={() => {
                if (!sessionTitle || !sessionLink) return;
                createSession.mutate({ courseId, data: { title: sessionTitle, link: sessionLink, ...(sessionDate ? { scheduledAt: new Date(sessionDate).toISOString() } : {}) } }, { onSuccess: () => { invalidateAll(); setSessionTitle(""); setSessionLink(""); setSessionDate(""); toast({ title: "Session created" }); } });
              }} data-testid="button-add-session"><Plus className="w-4 h-4 mr-1" /> {t.add}</Button>
            </div>

            {sessionsLoading ? <Skeleton className="h-32" /> : sessions?.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.link}</p>
                    {s.scheduledAt && <p className="text-sm text-muted-foreground">{new Date(s.scheduledAt).toLocaleString()}</p>}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => { deleteSession.mutate({ id: s.id }, { onSuccess: invalidateAll }); }}><Trash2 className="w-4 h-4" /></Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            {/* Enroll new user */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label>{t.enrollUser}</Label>
                <Select value={enrollUserId} onValueChange={setEnrollUserId}>
                  <SelectTrigger data-testid="select-enroll-user"><SelectValue placeholder={t.selectUser} /></SelectTrigger>
                  <SelectContent>
                    {allUsers?.filter((u) => u.role !== "admin").map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => {
                if (!enrollUserId) return;
                enrollUser.mutate({ courseId, data: { userId: Number(enrollUserId) } }, { onSuccess: () => { invalidateAll(); setEnrollUserId(""); toast({ title: "User enrolled" }); } });
              }} data-testid="button-enroll"><Plus className="w-4 h-4 mr-1" /> {t.enroll}</Button>
            </div>

            {/* Enrolled students list */}
            {enrollmentsLoading ? <Skeleton className="h-32" /> : (
              <div className="space-y-3">
                {enrollments?.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No students enrolled yet.</p>
                )}
                {enrollments?.map((e) => (
                  <Card key={e.userId} className="border-l-4 border-l-primary/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{e.userName}</p>
                        <p className="text-sm text-muted-foreground">{e.userEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled: {new Date(e.enrolledAt).toLocaleDateString()} &nbsp;·&nbsp;
                          Progress: <span className="font-medium text-foreground">{Math.round(e.progress)}%</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Progress bar */}
                        <div className="w-24 bg-muted rounded-full h-2 hidden sm:block">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.round(e.progress)}%` }}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveClick(e.userId, e.userName)}
                          data-testid={`button-remove-${e.userId}`}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          {t.removeFromCourse}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmRemoveTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmRemove}
              {studentToRemove && (
                <span className="block mt-2 font-semibold text-foreground">{studentToRemove.userName}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToRemove(null)}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
