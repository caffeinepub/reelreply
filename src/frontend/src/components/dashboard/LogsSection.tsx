import { useState } from 'react';
import { useGetReplyLogs } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { CommentReplyLog } from '../../backend';

type FilterOption = 'all' | 'success' | 'failed';

export default function LogsSection() {
  const { data: logs, isLoading } = useGetReplyLogs();
  const [filter, setFilter] = useState<FilterOption>('all');

  const filteredLogs = logs?.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'success') return log.status;
    if (filter === 'failed') return !log.status;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reply Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
            <CardTitle>Reply Logs</CardTitle>
            <CardDescription>
              View all automated reply activity
            </CardDescription>
          </div>
          <Select value={filter} onValueChange={(value) => setFilter(value as FilterOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter logs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Logs</SelectItem>
              <SelectItem value="success">Success Only</SelectItem>
              <SelectItem value="failed">Failed Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img 
              src="/assets/generated/logs-empty-state.dim_1200x800.png" 
              alt="No logs yet" 
              className="mb-6 w-full max-w-md opacity-50"
            />
            <p className="text-center text-muted-foreground">
              {filter === 'all' 
                ? 'No reply logs yet. Automated replies will appear here.'
                : `No ${filter} logs found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.replyId}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(Number(log.timestamp) / 1000000).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {log.commentSnippet}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.keywordMatched}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.status ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {log.errorDetails || 'Reply sent successfully'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
