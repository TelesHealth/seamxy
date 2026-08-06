import { useState } from "react";
import { Download, Link2, Copy, Check, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultImageUrl: string | null;
  shareUrl?: string;
}

export function ShareModal({ isOpen, onClose, resultImageUrl, shareUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!resultImageUrl) return;
    const link = document.createElement("a");
    link.href = resultImageUrl;
    link.download = `seamxy-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Image downloaded", description: "Your try-on result has been saved." });
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: "Share link copied to clipboard." });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && resultImageUrl) {
      try {
        const response = await fetch(resultImageUrl);
        const blob = await response.blob();
        const file = new File([blob], "seamxy-tryon.png", { type: "image/png" });
        await navigator.share({
          title: "Check out my virtual try-on!",
          text: "See how this outfit looks on me with SeamXY",
          files: [file],
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({ title: "Share failed", variant: "destructive" });
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Look
          </DialogTitle>
        </DialogHeader>

        {resultImageUrl && (
          <div className="relative rounded-xl overflow-hidden mb-4">
            <img src={resultImageUrl} alt="Try-on result" className="w-full aspect-[3/4] object-cover" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={handleDownload}
            data-testid="button-download-tryon"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs">Download</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={handleCopyLink}
            disabled={!shareUrl}
            data-testid="button-copy-link"
          >
            <Link2 className="w-5 h-5" />
            <span className="text-xs">Copy Link</span>
          </Button>
          {typeof navigator.share === "function" && (
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={handleNativeShare}
              data-testid="button-native-share"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs">Share</span>
            </Button>
          )}
        </div>

        {shareUrl && (
          <div className="flex gap-2 mt-4">
            <Input value={shareUrl} readOnly className="text-xs" />
            <Button size="icon" variant="outline" onClick={handleCopyLink} data-testid="button-copy-icon">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-2">
          Get a second opinion from friends and family!
        </p>
      </DialogContent>
    </Dialog>
  );
}
