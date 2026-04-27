import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Users, Plus, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StyleGroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/groups"],
  });

  const { mutate: createGroup, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/v1/groups", { name: groupName, description: groupDescription });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/groups"] });
      setShowCreate(false);
      setGroupName("");
      setGroupDescription("");
      toast({ title: "Group created!" });
    },
    onError: () => toast({ title: "Could not create group", variant: "destructive" }),
  });

  const { mutate: joinGroup, isPending: isJoining } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/v1/groups/join", { inviteCode });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/groups"] });
      setShowJoin(false);
      setInviteCode("");
      toast({ title: "Joined the group!" });
    },
    onError: () => toast({ title: "Invalid invite code", variant: "destructive" }),
  });

  const copyInviteCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Invite code copied!" });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Style Groups</h1>
          <p className="text-muted-foreground text-sm">Share outfits, get feedback, borrow clothes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoin(true)} data-testid="button-join-group">
            Join
          </Button>
          <Button onClick={() => setShowCreate(true)} data-testid="button-create-group">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No style groups yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Create a group with friends to share outfits, vote on looks, and borrow from each other's closets.
          </p>
          <Button onClick={() => setShowCreate(true)} data-testid="button-create-first-group">
            Create Your First Group
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((item: any) => (
            <Card key={item.group.id} className="hover-elevate" data-testid={`card-group-${item.group.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{item.group.name}</p>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {item.role}
                      </Badge>
                    </div>
                    {item.group.description && (
                      <p className="text-sm text-muted-foreground truncate">{item.group.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Code: <span className="font-mono font-medium">{item.group.inviteCode}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyInviteCode(item.group.inviteCode, item.group.id)}
                      data-testid={`button-copy-invite-${item.group.id}`}
                    >
                      {copiedId === item.group.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Link href={`/groups/${item.group.id}`}>
                      <Button size="sm" variant="outline" data-testid={`button-open-group-${item.group.id}`}>
                        Open
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create a Style Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Group name (e.g. The Squad, Work Besties)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              data-testid="input-group-name"
            />
            <Input
              placeholder="Description (optional)"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              data-testid="input-group-description"
            />
            <Button
              className="w-full"
              disabled={!groupName.trim() || isCreating}
              onClick={() => createGroup()}
              data-testid="button-submit-create-group"
            >
              {isCreating ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Group Modal */}
      <Dialog open={showJoin} onOpenChange={setShowJoin}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Join a Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Enter invite code (e.g. AB12CD)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              data-testid="input-invite-code"
            />
            <Button
              className="w-full"
              disabled={!inviteCode.trim() || isJoining}
              onClick={() => joinGroup()}
              data-testid="button-submit-join-group"
            >
              {isJoining ? "Joining..." : "Join Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
