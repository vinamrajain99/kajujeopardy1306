import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";
import { isAdminAuthed, setAdminPassword, verifyAdminPassword } from "@/lib/adminAuth";

const Auth = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) navigate("/admin", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Enter the admin password");
      return;
    }
    setSubmitting(true);
    const ok = await verifyAdminPassword(password);
    setSubmitting(false);
    if (!ok) {
      toast.error("Incorrect password");
      return;
    }
    setAdminPassword(password, remember);
    toast.success("Welcome, admin!");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
          <h1 className="font-display text-2xl text-primary text-center mb-1">Admin Access</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter the admin password to manage games
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              Remember on this device
            </label>

            <Button type="submit" className="w-full" disabled={submitting}>
              <LogIn className="w-4 h-4 mr-2" />
              {submitting ? "Verifying…" : "Unlock Admin"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
