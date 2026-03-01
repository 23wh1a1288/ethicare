import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({
    fullName: "", age: "", dob: "", phone: "", email: "",
    country: "", state: "", address: "", gender: "", password: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileImage) {
      toast({ title: "Error", description: "Profile image is required", variant: "destructive" });
      return;
    }
    if (parseInt(form.age) < 13 || parseInt(form.age) > 120) {
      toast({ title: "Error", description: "Please enter a valid age (13-120)", variant: "destructive" });
      return;
    }
    if (!/^\+?[\d\s-]{7,15}$/.test(form.phone)) {
      toast({ title: "Error", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    toast({ title: "OTP Sent!", description: "Check your email and phone for verification codes." });
    setStep("otp");
  };

  const verifyOtp = () => {
    setLoading(true);
    setTimeout(() => {
      if (emailOtp === "123456" && phoneOtp === "654321") {
        localStorage.setItem("ethicare_user", JSON.stringify({
          role: "user", ...form, profileImage,
        }));
        toast({ title: "Success!", description: "Your account has been activated." });
        navigate("/dashboard");
      } else {
        toast({ title: "Invalid OTP", description: "Email OTP: 123456 | Phone OTP: 654321", variant: "destructive" });
      }
      setLoading(false);
    }, 1000);
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center cyber-grid">
        <div className="w-full max-w-md p-8">
          <div className="glass-panel rounded-2xl p-8 space-y-6 glow-primary">
            <div className="text-center space-y-2">
              <Shield className="h-10 w-10 text-primary mx-auto" />
              <h1 className="text-2xl font-display font-bold">Verify Your Identity</h1>
              <p className="text-sm text-muted-foreground">Enter the OTP codes sent to your email and phone</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email OTP</Label>
                <Input placeholder="Enter 6-digit code" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} maxLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Phone OTP</Label>
                <Input placeholder="Enter 6-digit code" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} maxLength={6} />
              </div>
              <Button onClick={verifyOtp} className="w-full gradient-primary text-primary-foreground font-semibold" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Activate"}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">Demo: Email OTP = 123456 | Phone OTP = 654321</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center cyber-grid">
      <div className="w-full max-w-lg p-8">
        <div className="glass-panel rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <Shield className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-display font-bold">Create Account</h1>
            <p className="text-sm text-muted-foreground">Join Ethicare and protect your digital identity</p>
          </div>

          <form onSubmit={submitForm} className="space-y-4">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden bg-secondary/50">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <Label htmlFor="profile-img" className="text-sm text-primary cursor-pointer hover:underline">
                Upload Profile Image *
              </Label>
              <input id="profile-img" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Full Name *</Label>
                <Input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Age *</Label>
                <Input type="number" required min={13} max={120} value={form.age} onChange={(e) => update("age", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input type="date" required value={form.dob} onChange={(e) => update("dob", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1234567890" />
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input required value={form.country} onChange={(e) => update("country", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input required value={form.state} onChange={(e) => update("state", e.target.value)} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
              Continue to Verification
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
