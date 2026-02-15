import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, Shield, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/generated/reelreply-logo.dim_512x128.png" 
              alt="ReelReply" 
              className="h-8"
            />
          </div>
          <Button 
            onClick={login} 
            disabled={isLoggingIn}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoggingIn ? 'Connecting...' : 'Get Started'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground">
              Automate Your Instagram Reel Replies
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Automatically respond to Instagram Reel comments when specific keywords are detected. 
              Save time and engage with your audience instantly.
            </p>
            <Button 
              size="lg" 
              onClick={login} 
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoggingIn ? 'Connecting...' : 'Start Automating'}
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/40 bg-card/30 py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Keyword Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Set custom keywords to trigger automatic replies
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Instant Responses</h3>
                <p className="text-sm text-muted-foreground">
                  Reply to comments automatically in real-time
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Secure & Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Uses official Instagram Graph API only
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Activity Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Track all automated replies and their status
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ReelReply. Built with love using{' '}
          <a 
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
