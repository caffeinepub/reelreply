import { useState } from 'react';
import { useGetCredentials, useValidateCredentials } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ErrorCallout from '../common/ErrorCallout';

export default function InstagramConnectionSection() {
  const { data: credentials, isLoading } = useGetCredentials();
  const validateMutation = useValidateCredentials();

  const [igUserId, setIgUserId] = useState('');
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const isConnected = credentials?.validated ?? false;

  const handleValidate = async () => {
    if (!igUserId.trim() || !pageId.trim() || !accessToken.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await validateMutation.mutateAsync({
        igUserId: igUserId.trim(),
        pageId: pageId.trim(),
        accessToken: accessToken.trim(),
        validated: false,
        lastValidation: undefined,
      });
      toast.success('Instagram credentials validated successfully!');
      setIgUserId('');
      setPageId('');
      setAccessToken('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to validate credentials');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instagram Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Instagram Connection</CardTitle>
            <CardDescription>
              Connect your Instagram Business or Creator account
            </CardDescription>
          </div>
          {isConnected ? (
            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/50 text-amber-500">
              <AlertCircle className="mr-1 h-3 w-3" />
              Test Mode
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-500/20 bg-amber-500/5">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm text-muted-foreground">
            Only Instagram Business and Creator accounts are supported. Personal accounts will not work.
          </AlertDescription>
        </Alert>

        {validateMutation.isError && (
          <ErrorCallout message={validateMutation.error?.message || 'Validation failed'} />
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="igUserId">Instagram User ID</Label>
            <Input
              id="igUserId"
              type="text"
              placeholder="Enter your Instagram User ID"
              value={igUserId}
              onChange={(e) => setIgUserId(e.target.value)}
              disabled={validateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageId">Page ID</Label>
            <Input
              id="pageId"
              type="text"
              placeholder="Enter your Facebook Page ID"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              disabled={validateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Enter your access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={validateMutation.isPending}
            />
          </div>

          <Button 
            onClick={handleValidate}
            disabled={validateMutation.isPending}
            className="w-full"
          >
            {validateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate & Save Credentials'
            )}
          </Button>
        </div>

        {isConnected && credentials && (
          <div className="mt-4 rounded-lg border border-border/40 bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Connected Account:</strong> {credentials.igUserId}
            </p>
            {credentials.lastValidation && (
              <p className="mt-1 text-xs text-muted-foreground">
                Last validated: {new Date(Number(credentials.lastValidation) / 1000000).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
