import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  useGetCourse, getGetCourseQueryKey,
  useListCourseVideos, getListCourseVideosQueryKey,
  useListCourseFiles, getListCourseFilesQueryKey,
  useListCourseSessions, getListCourseSessionsQueryKey,
  useGetCourseContact, getGetCourseContactQueryKey,
  useMarkVideoWatched,
  useGetCourseProgress, getGetCourseProgressQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { PlayCircle, Check, FileText, Video, Users, Mail, Phone, MessageCircle, ChevronDown, ChevronRight, Download, ExternalLink, ArrowLeft, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/use-language";

export default function CourseDetailPage({ params }: { params?: { id: string } }) {
  const courseId = Number(params?.id);
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, isRTL } = useLanguage();

  const { data: course, isLoading } = useGetCourse(courseId, { query: { enabled: !!courseId, queryKey: getGetCourseQueryKey(courseId) } });
  const { data: videos } = useListCourseVideos(courseId, { query: { enabled: !!courseId && !!token, queryKey: getListCourseVideosQueryKey(courseId) } });
  const { data: files } = useListCourseFiles(courseId, { query: { enabled: !!courseId && !!token, queryKey: getListCourseFilesQueryKey(courseId) } });
  const { data: sessions } = useListCourseSessions(courseId, { query: { enabled: !!courseId && !!token, queryKey: getListCourseSessionsQueryKey(courseId) } });
  const { data: contact } = useGetCourseContact(courseId, { query: { enabled: !!courseId && !!token, queryKey: getGetCourseContactQueryKey(courseId) } });
  const { data: progress } = useGetCourseProgress(courseId, { query: { enabled: !!courseId && !!token, queryKey: getGetCourseProgressQueryKey(courseId) } });
  const markWatched = useMarkVideoWatched();

  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleSection = (id: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMarkWatched = (videoId: number) => {
    markWatched.mutate(
      { videoId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCourseProgressQueryKey(courseId) });
          queryClient.invalidateQueries({ queryKey: getListCourseVideosQueryKey(courseId) });
          toast({ title: t.videoMarkedWatched });
        },
      }
    );
  };

  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&disablekb=1`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&disablekb=1`;
    }
    // Vimeo
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}?dnt=1&byline=0&title=0&portrait=0`;
    }
    return url;
  };

  // --- Video Protection ---

  // 1. Pause on tab switch
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && activeVideoUrl) {
      setActiveVideoUrl(null);
    }
  }, [activeVideoUrl]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleVisibilityChange]);

  // 2. Disable right-click globally
  useEffect(() => {
    const handler = (e: MouseEvent) => { e.preventDefault(); };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  // 3. Basic DevTools detection — pause video if devtools opened
  useEffect(() => {
    if (!activeVideoUrl) return;
    let devtoolsOpen = false;
    const threshold = 160;
    const check = () => {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if ((widthDiff || heightDiff) && !devtoolsOpen) {
        devtoolsOpen = true;
        setActiveVideoUrl(null);
      } else if (!widthDiff && !heightDiff) {
        devtoolsOpen = false;
      }
    };
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [activeVideoUrl]);

  // 4. Prevent keyboard shortcuts on video area
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!activeVideoUrl) return;
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key))) {
        e.preventDefault();
        setActiveVideoUrl(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [activeVideoUrl]);

  // Get user email for watermark
  const userEmail = token ? (() => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || "";
    } catch { return ""; }
  })() : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-8">
          <Skeleton className="h-64 mb-6" />
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Course not found</p>
        </div>
      </div>
    );
  }

  const openWhatsApp = () => {
    const number = course.whatsappNumber || "";
    const message = encodeURIComponent(`${t.whatsappMsg}${course.title}`);
    window.open(`https://wa.me/${number}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="md:w-2/3 space-y-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <Badge variant={course.status === "free" ? "secondary" : "outline"}>{course.status === "free" ? t.free : t.locked}</Badge>
            </div>
            <p className="text-muted-foreground">{course.description}</p>
            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progress.watchedVideos}/{progress.totalVideos} {t.videosCompleted}</span>
                  <span>{Math.round(progress.progress)}%</span>
                </div>
                <Progress value={progress.progress} />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={openWhatsApp} variant="outline" data-testid="button-whatsapp">
                <MessageCircle className="w-4 h-4 mr-2" /> {t.requestWhatsApp}
              </Button>
            </div>
          </div>
        </div>

        {/* Video Player with Watermark */}
        {activeVideoUrl && (
          <Card
            className="overflow-hidden select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="relative aspect-video bg-black">
              <iframe
                ref={iframeRef}
                src={getEmbedUrl(activeVideoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeVideoTitle}
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
              {/* Watermark overlay */}
              {userEmail && (
                <div
                  className="absolute inset-0 pointer-events-none select-none flex items-center justify-center"
                  style={{ zIndex: 10 }}
                >
                  <div
                    className="text-white text-opacity-20 text-sm font-mono transform rotate-[-20deg] whitespace-nowrap"
                    style={{
                      opacity: 0.18,
                      textShadow: "0 0 4px rgba(0,0,0,0.8)",
                      userSelect: "none",
                    }}
                  >
                    {userEmail} &nbsp;&nbsp; {userEmail} &nbsp;&nbsp; {userEmail}
                  </div>
                </div>
              )}
              {/* Corner watermark */}
              {userEmail && (
                <div
                  className="absolute bottom-2 right-3 text-white text-xs font-mono pointer-events-none select-none"
                  style={{ opacity: 0.3, zIndex: 10, userSelect: "none" }}
                >
                  {userEmail}
                </div>
              )}
              {/* Shield icon top-right */}
              <div className="absolute top-2 left-2 text-white pointer-events-none" style={{ opacity: 0.25, zIndex: 10 }}>
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
          </Card>
        )}

        {token && course.enrolled ? (
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="videos" className="flex items-center gap-1"><Video className="w-4 h-4" />{t.videos}</TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-1"><FileText className="w-4 h-4" />{t.files}</TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-1"><Users className="w-4 h-4" />{t.sessions}</TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-1"><Mail className="w-4 h-4" />{t.contact}</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-4">
              {videos?.map((section) => (
                <Card key={section.id}>
                  <button onClick={() => toggleSection(section.id)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors" data-testid={`button-section-${section.id}`}>
                    <span className="font-semibold">{section.title}</span>
                    {expandedSections.has(section.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSections.has(section.id) && (
                    <CardContent className="pt-0 space-y-2">
                      {section.videos.map((video) => (
                        <div key={video.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {video.watched ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-muted-foreground" />
                            )}
                            <span className={video.watched ? "text-muted-foreground" : ""}>{video.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setActiveVideoUrl(video.url); setActiveVideoTitle(video.title); }} data-testid={`button-play-${video.id}`}>
                              <PlayCircle className="w-4 h-4 mr-1" /> {t.play}
                            </Button>
                            {!video.watched && (
                              <Button variant="outline" size="sm" onClick={() => handleMarkWatched(video.id)} data-testid={`button-mark-${video.id}`}>
                                <Check className="w-4 h-4 mr-1" /> {t.markDone}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
              {(!videos || videos.length === 0) && <p className="text-muted-foreground text-center py-8">{t.noContent}</p>}
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              {files?.map((category) => (
                <Card key={category.id}>
                  <CardHeader><CardTitle className="text-lg">{category.name}</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {category.files.map((file) => (
                      <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors" data-testid={`link-file-${file.id}`}>
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span>{file.name}</span>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                    ))}
                  </CardContent>
                </Card>
              ))}
              {(!files || files.length === 0) && <p className="text-muted-foreground text-center py-8">{t.noContent}</p>}
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              {sessions?.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{session.title}</h3>
                      {session.scheduledAt && (
                        <p className="text-sm text-muted-foreground">{new Date(session.scheduledAt).toLocaleString()}</p>
                      )}
                    </div>
                    <a href={session.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" data-testid={`button-join-${session.id}`}>
                        <ExternalLink className="w-4 h-4 mr-1" /> {t.join}
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
              {(!sessions || sessions.length === 0) && <p className="text-muted-foreground text-center py-8">{t.noSessions}</p>}
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {contact?.instructorName && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t.instructor}</p>
                        <p className="font-medium">{contact.instructorName}</p>
                      </div>
                    </div>
                  )}
                  {contact?.contactEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t.email}</p>
                        <a href={`mailto:${contact.contactEmail}`} className="font-medium text-primary hover:underline">{contact.contactEmail}</a>
                      </div>
                    </div>
                  )}
                  {contact?.contactPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t.phone}</p>
                        <p className="font-medium">{contact.contactPhone}</p>
                      </div>
                    </div>
                  )}
                  {contact?.whatsappNumber && (
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t.whatsapp}</p>
                        <a href={`https://wa.me/${contact.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{contact.whatsappNumber}</a>
                      </div>
                    </div>
                  )}
                  {!contact?.instructorName && !contact?.contactEmail && !contact?.contactPhone && !contact?.whatsappNumber && (
                    <p className="text-muted-foreground text-center">{t.noContent}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="text-center p-8">
            <p className="text-muted-foreground mb-4">
              {token ? t.notEnrolled : t.signInToAccess}
            </p>
            {!token && (
              <Link href="/login"><Button>{t.signIn}</Button></Link>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
