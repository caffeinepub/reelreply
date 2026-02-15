import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function ComplianceNotice() {
  return (
    <Alert className="border-primary/20 bg-primary/5">
      <Info className="h-4 w-4 text-primary" />
      <AlertTitle className="text-foreground">Instagram API Compliance</AlertTitle>
      <AlertDescription className="text-sm text-muted-foreground">
        ReelReply uses Instagram's official Graph API and requires proper permissions and webhook verification. 
        Only Instagram Business and Creator accounts are supported. We store only operational settings and logs—no passwords. 
        Please ensure your Instagram app has the required permissions and webhook subscriptions configured.
      </AlertDescription>
    </Alert>
  );
}
