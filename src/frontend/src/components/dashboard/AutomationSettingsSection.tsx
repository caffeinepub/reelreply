import { useState, useEffect } from 'react';
import { useGetAutomationSettings, useUpdateAutomationSettings } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ErrorCallout from '../common/ErrorCallout';

export default function AutomationSettingsSection() {
  const { data: settings, isLoading } = useGetAutomationSettings();
  const updateMutation = useUpdateAutomationSettings();

  const [keyword, setKeyword] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (settings) {
      setKeyword(settings.keyword);
      setReplyMessage(settings.autoReplyMessage);
      setEnabled(settings.automationEnabled);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        keyword: keyword.trim(),
        autoReplyMessage: replyMessage.trim(),
        automationEnabled: enabled,
      });
      toast.success('Automation settings saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Automation Settings</CardTitle>
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
        <CardTitle>Automation Settings</CardTitle>
        <CardDescription>
          Configure keyword triggers and auto-reply messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {updateMutation.isError && (
          <ErrorCallout message={updateMutation.error?.message || 'Failed to save settings'} />
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Trigger Keyword</Label>
            <Input
              id="keyword"
              type="text"
              placeholder="e.g., link"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Comments containing this keyword will trigger an automatic reply
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="replyMessage">Auto-Reply Message</Label>
            <Textarea
              id="replyMessage"
              placeholder="Enter your automatic reply message..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              disabled={updateMutation.isPending}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent as a reply when the keyword is detected
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base">
                Enable Automation
              </Label>
              <p className="text-sm text-muted-foreground">
                Turn automation on or off
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={updateMutation.isPending}
            />
          </div>

          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
