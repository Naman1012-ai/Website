import { Link } from "wouter";
import { Droplet, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <a className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Droplet className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xl font-bold font-heading tracking-tight">RedLink</span>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/donor">
              <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Donor Portal</a>
            </Link>
            <Link href="/hospital">
              <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Hospital Portal</a>
            </Link>
          </nav>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RedLink. Saving lives in real-time.</p>
        </div>
      </footer>
    </div>
  );
}
