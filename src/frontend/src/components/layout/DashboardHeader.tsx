import AuthButton from '../auth/AuthButton';

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="/assets/generated/reelreply-logo.dim_512x128.png" 
            alt="ReelReply" 
            className="h-8"
          />
        </div>
        <AuthButton />
      </div>
    </header>
  );
}
