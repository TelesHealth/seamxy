import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function SupplierMessages() {
  const { data: threads, isLoading } = useQuery({
    queryKey: ['/api/v1/supplier/messages']
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold" data-testid="text-messages-title">
          Messages
        </h1>
        <p className="text-muted-foreground mt-2">
          Communicate with your customers
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">Loading messages...</div>
          </CardContent>
        </Card>
      ) : !threads || threads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground">
              Customer messages will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {threads.map((thread: any) => (
            <Card key={thread.id} className="hover-elevate" data-testid={`card-thread-${thread.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{thread.subject || 'No Subject'}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {thread.lastMessage || 'No messages'}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {thread.lastMessageAt && new Date(thread.lastMessageAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
