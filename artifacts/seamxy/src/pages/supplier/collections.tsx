import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Palette, Plus } from 'lucide-react';

const collectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  description: z.string().optional(),
  season: z.string().optional()
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function SupplierCollections() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: collections, isLoading } = useQuery<any[]>({
    queryKey: ['/api/v1/supplier/designer/collections']
  });

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: '',
      description: '',
      season: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: CollectionFormData) => {
      const response = await fetch('/api/v1/supplier/designer/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/supplier/designer/collections'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: 'Collection created',
        description: 'Your new collection has been added.'
      });
    }
  });

  const onSubmit = (data: CollectionFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-collections-title">
            Collections
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your made-to-measure collections
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-collection">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
              <DialogDescription>
                Launch a new made-to-measure collection
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Spring 2025 Formal Wear" data-testid="input-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Spring/Summer 2025" data-testid="input-season" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your collection..." data-testid="input-description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-collection">
                    {createMutation.isPending ? 'Creating...' : 'Create Collection'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">Loading collections...</div>
          </CardContent>
        </Card>
      ) : !collections || collections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first collection to start showcasing your designs
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-create-first-collection">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection: any) => (
            <Card key={collection.id} data-testid={`card-collection-${collection.id}`}>
              <CardHeader>
                <CardTitle>{collection.name}</CardTitle>
                <CardDescription>{collection.season || 'No season specified'}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {collection.description || 'No description'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
