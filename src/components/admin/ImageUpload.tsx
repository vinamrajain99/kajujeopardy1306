import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  className?: string;
}

export const ImageUpload = ({ onImageUploaded, className }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `context-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("game-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("game-images")
        .getPublicUrl(filePath);

      onImageUploaded(data.publicUrl);
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlValue.trim()) return;
    onImageUploaded(urlValue.trim());
    setUrlValue("");
    setShowUrlInput(false);
    toast.success("Image URL added!");
  };

  if (showUrlInput) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          type="url"
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          placeholder="Enter image URL..."
          className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
        />
        <Button variant="outline" size="sm" onClick={handleUrlSubmit}>
          Add
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowUrlInput(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-1" />
        )}
        Upload
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowUrlInput(true)}
      >
        <LinkIcon className="w-4 h-4 mr-1" />
        URL
      </Button>
    </div>
  );
};
