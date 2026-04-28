import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 py-4 flex items-center justify-between bg-card border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            LH
          </div>
          <span className="font-bold text-xl tracking-tight">LearnHub</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">
            Browse Courses
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
            Master new skills in a <span className="text-primary">focused</span> environment.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            LearnHub provides a curated learning experience free from distractions. 
            Access high-quality video lessons, resources, and live sessions.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="h-12 px-8 text-base">Explore Courses</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">Create Account</Button>
            </Link>
          </div>
        </section>

        <section className="bg-muted/50 py-24 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <h3 className="text-xl font-bold">Track Progress</h3>
              <p className="text-muted-foreground leading-relaxed">Keep momentum with intuitive progress tracking and watch history that syncs across all your devices.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
              </div>
              <h3 className="text-xl font-bold">Rich Resources</h3>
              <p className="text-muted-foreground leading-relaxed">Download course materials, assignments, and slides directly from your lesson dashboard.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              </div>
              <h3 className="text-xl font-bold">Live Sessions</h3>
              <p className="text-muted-foreground leading-relaxed">Join scheduled interactive sessions with instructors for real-time Q&A and deeper dives.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t bg-card text-center text-muted-foreground flex justify-between items-center relative">
        <p>&copy; {new Date().getFullYear()} LearnHub. All rights reserved.</p>
        <Link href="/admin">
          <div className="w-4 h-4 opacity-10 hover:opacity-100 cursor-pointer rounded-full bg-primary transition-opacity absolute bottom-8 right-6" title="Admin Portal" />
        </Link>
      </footer>
    </div>
  );
}
