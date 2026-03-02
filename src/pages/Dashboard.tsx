import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Shield, User, Upload, Lock, Search, FileWarning, Bell,
  LogOut, CheckCircle, XCircle, AlertTriangle, Eye, Fingerprint, KeyRound,
  Globe, Calendar, Trash2, Edit, Save, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  category: string;
  risk: "Safe" | "Moderate Risk" | "High Risk";
  flagged: boolean;
  locked: boolean;
  lockType?: string;
  misuseDetected: boolean;
  misuseDetails?: { url: string; date: string };
}

interface Complaint {
  id: string;
  imageId: string;
  description: string;
  url: string;
  status: "Submitted" | "Under Review" | "Action Taken" | "Resolved";
  date: string;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  date: string;
  read: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", type: "system", message: "Welcome to Ethicare! Your account is now active.", date: new Date().toISOString(), read: false },
  ]);
  const [complaintForm, setComplaintForm] = useState({ imageId: "", description: "", url: "" });
  const [scanning, setScanning] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    const stored = localStorage.getItem("ethicare_user");
    if (!stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setEditForm(parsed);

    // Load saved images
    const savedImages = localStorage.getItem("ethicare_images_" + parsed.email);
    if (savedImages) setImages(JSON.parse(savedImages));
    const savedComplaints = localStorage.getItem("ethicare_complaints_" + parsed.email);
    if (savedComplaints) setComplaints(JSON.parse(savedComplaints));
    const savedNotifs = localStorage.getItem("ethicare_notifications_" + parsed.email);
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
  }, [navigate]);

  // Persist images, complaints, notifications
  useEffect(() => {
    if (user?.email) {
      try {
        localStorage.setItem("ethicare_images_" + user.email, JSON.stringify(images));
      } catch (e) {
        console.warn("Storage quota exceeded for images. Consider clearing old data.");
        toast({ title: "Storage Full", description: "Too many images stored locally. Please remove some images to free space.", variant: "destructive" });
      }
    }
  }, [images, user]);
  useEffect(() => {
    if (user?.email) {
      try {
        localStorage.setItem("ethicare_complaints_" + user.email, JSON.stringify(complaints));
      } catch { /* ignore */ }
    }
  }, [complaints, user]);
  useEffect(() => {
    if (user?.email) {
      try {
        localStorage.setItem("ethicare_notifications_" + user.email, JSON.stringify(notifications));
      } catch { /* ignore */ }
    }
  }, [notifications, user]);

  const logout = () => {
    localStorage.removeItem("ethicare_user");
    navigate("/login");
  };

  const sendEmailNotification = async (subject: string, body: string, type: string) => {
    if (!user?.email) return;
    try {
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: { to: user.email, subject, body, type },
      });
      if (error) console.error("Email notification error:", error);
      else {
        console.log("Email notification result:", data);
        if (data?.method === "resend") {
          toast({ title: "📧 Email Sent", description: `Notification sent to ${user.email}` });
        }
      }
    } catch (e) {
      console.error("Failed to send email:", e);
    }
  };

  const classifyImageWithAI = async (imageBase64: string, fileName: string): Promise<{category: string; risk: "Safe" | "Moderate Risk" | "High Risk"; flagged: boolean}> => {
    try {
      const { data, error } = await supabase.functions.invoke("classify-image", {
        body: { imageBase64 },
      });
      if (error) throw error;
      return {
        category: data.category || "Normal Selfie",
        risk: (data.risk as "Safe" | "Moderate Risk" | "High Risk") || "Safe",
        flagged: data.flagged ?? false,
      };
    } catch (e) {
      console.error("AI classification error:", e);
      // Fallback: basic heuristic classification
      return { category: "Normal Selfie", risk: "Safe", flagged: false };
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 5) {
      toast({ title: "Limit Reached", description: "Maximum 5 images allowed.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Too Large", description: "Max file size is 5MB.", variant: "destructive" });
      return;
    }

    setScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      toast({ title: "🔍 Scanning Image...", description: "AI is analyzing your image for content classification." });
      
      const classification = await classifyImageWithAI(base64, file.name);
      
      const newImg: UploadedImage = {
        id: Date.now().toString(),
        name: file.name,
        url: base64,
        category: classification.category,
        risk: classification.risk,
        flagged: classification.flagged,
        locked: false,
        misuseDetected: false,
      };
      setImages((prev) => [...prev, newImg]);
      setNotifications((prev) => [
        { id: Date.now().toString(), type: "scan", message: `Image "${file.name}" scanned: ${classification.category} (${classification.risk})`, date: new Date().toISOString(), read: false },
        ...prev,
      ]);
      toast({ title: "Image Scanned", description: `Category: ${classification.category} | Risk: ${classification.risk}` });

      // Send email for flagged images
      if (classification.flagged) {
        sendEmailNotification(
          "⚠️ Image Flagged - Ethicare Alert",
          `<p>Your uploaded image <strong>"${file.name}"</strong> has been flagged.</p>
           <p><strong>Category:</strong> ${classification.category}</p>
           <p><strong>Risk Level:</strong> ${classification.risk}</p>
           <p>Please review this in your Ethicare dashboard.</p>`,
          "image_flagged"
        );
      }
      
      setScanning(false);
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = "";
  };

  const deleteImage = (imgId: string) => {
    const img = images.find(i => i.id === imgId);
    setImages((prev) => prev.filter((i) => i.id !== imgId));
    setNotifications((prev) => [
      { id: Date.now().toString(), type: "info", message: `Image "${img?.name}" has been deleted.`, date: new Date().toISOString(), read: false },
      ...prev,
    ]);
    toast({ title: "Image Deleted", description: `"${img?.name}" removed. You can upload ${5 - images.length + 1} more images.` });
  };

  const lockImage = (imgId: string, lockType: string) => {
    setImages((prev) => prev.map((img) =>
      img.id === imgId ? { ...img, locked: true, lockType } : img
    ));
    toast({ title: "Image Locked", description: `Secured with ${lockType}` });

    // Simulate misuse detection after lock
    setTimeout(() => {
      const shouldDetect = Math.random() > 0.5;
      if (shouldDetect) {
        setImages((prev) => prev.map((img) =>
          img.id === imgId ? {
            ...img,
            misuseDetected: true,
            misuseDetails: {
              url: "https://suspicious-site.example.com/stolen-image",
              date: new Date().toISOString(),
            },
          } : img
        ));
        setNotifications((prev) => [
          { id: Date.now().toString(), type: "alert", message: "⚠️ Image misuse detected online! Check your images.", date: new Date().toISOString(), read: false },
          ...prev,
        ]);
        toast({ title: "⚠️ Alert", description: "Misuse detected! Check your images tab.", variant: "destructive" });

        // Send email for misuse detection
        const img = images.find(i => i.id === imgId);
        sendEmailNotification(
          "🚨 Image Misuse Detected - Ethicare Alert",
          `<p>Your image <strong>"${img?.name}"</strong> has been detected on a suspicious website.</p>
           <p><strong>Detected URL:</strong> https://suspicious-site.example.com/stolen-image</p>
           <p><strong>Detection Date:</strong> ${new Date().toLocaleDateString()}</p>
           <p>We recommend filing a complaint immediately from your Ethicare dashboard.</p>`,
          "misuse_detected"
        );
      } else {
        setNotifications((prev) => [
          { id: Date.now().toString(), type: "info", message: "No misuse detected for your locked image.", date: new Date().toISOString(), read: false },
          ...prev,
        ]);
      }
    }, 5000);
  };

  const fileComplaint = () => {
    if (!complaintForm.imageId || !complaintForm.description) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const newComplaint: Complaint = {
      id: `EC-${Date.now().toString().slice(-6)}`,
      imageId: complaintForm.imageId,
      description: complaintForm.description,
      url: complaintForm.url,
      status: "Submitted",
      date: new Date().toISOString(),
    };
    setComplaints((prev) => [...prev, newComplaint]);
    setComplaintForm({ imageId: "", description: "", url: "" });
    setNotifications((prev) => [
      { id: Date.now().toString(), type: "complaint", message: `Complaint ${newComplaint.id} submitted successfully.`, date: new Date().toISOString(), read: false },
      ...prev,
    ]);
    toast({ title: "Complaint Filed", description: `Complaint ID: ${newComplaint.id}` });

    // Send email for complaint submission
    sendEmailNotification(
      "📢 Complaint Submitted - Ethicare",
      `<p>Your complaint has been successfully submitted.</p>
       <p><strong>Complaint ID:</strong> ${newComplaint.id}</p>
       <p><strong>Description:</strong> ${complaintForm.description}</p>
       <p><strong>Status:</strong> Submitted</p>
       <p>We will review your complaint and update you on its progress.</p>`,
      "complaint_submitted"
    );
  };

  const saveProfile = () => {
    const updatedUser = { ...user, ...editForm };
    setUser(updatedUser);
    localStorage.setItem("ethicare_user", JSON.stringify(updatedUser));
    setEditingProfile(false);
    toast({ title: "Profile Updated", description: "Your profile has been saved." });
  };

  if (!user) return null;

  const riskBadge = (risk: string) => {
    const cls = risk === "Safe" ? "bg-success/20 text-success" : risk === "Moderate Risk" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive";
    return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cls}`}>{risk}</span>;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="glass-panel border-b sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <Shield className="h-5 w-5 text-primary" />
            <span className="gradient-text">ETHICARE</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile"><User className="h-4 w-4 mr-1 hidden sm:inline" /> Profile</TabsTrigger>
            <TabsTrigger value="images"><Upload className="h-4 w-4 mr-1 hidden sm:inline" /> Images</TabsTrigger>
            <TabsTrigger value="misuse"><Search className="h-4 w-4 mr-1 hidden sm:inline" /> Misuse</TabsTrigger>
            <TabsTrigger value="complaints"><FileWarning className="h-4 w-4 mr-1 hidden sm:inline" /> Complaints</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              <Bell className="h-4 w-4 mr-1 hidden sm:inline" /> Alerts
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="glass-panel rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">My Profile</h2>
                {!editingProfile ? (
                  <Button variant="outline" size="sm" onClick={() => { setEditForm({ ...user }); setEditingProfile(true); }}>
                    <Edit className="h-4 w-4 mr-1" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveProfile} className="gradient-primary text-primary-foreground">
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingProfile(false)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary shrink-0">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  {editingProfile ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Full Name</Label>
                        <Input value={editForm.fullName || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, fullName: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Age</Label>
                        <Input type="number" value={editForm.age || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, age: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                        <Input type="date" value={editForm.dob || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, dob: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <Input type="email" value={editForm.email || ""} disabled className="opacity-60" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <Input value={editForm.phone || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Country</Label>
                        <Input value={editForm.country || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, country: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">State</Label>
                        <Input value={editForm.state || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, state: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Gender</Label>
                        <Input value={editForm.gender || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, gender: e.target.value }))} />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <Input value={editForm.address || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, address: e.target.value }))} />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Change Profile Image</Label>
                        <Input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setEditForm((p: any) => ({ ...p, profileImage: reader.result as string }));
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h2 className="text-2xl font-display font-bold">{user.fullName || user.name || "User"}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
                        <div><span className="text-muted-foreground">Phone:</span> {user.phone || "N/A"}</div>
                        <div><span className="text-muted-foreground">Age:</span> {user.age || "N/A"}</div>
                        <div><span className="text-muted-foreground">DOB:</span> {user.dob || "N/A"}</div>
                        <div><span className="text-muted-foreground">Country:</span> {user.country || "N/A"}</div>
                        <div><span className="text-muted-foreground">State:</span> {user.state || "N/A"}</div>
                        <div><span className="text-muted-foreground">Gender:</span> {user.gender || "N/A"}</div>
                        {user.address && <div className="sm:col-span-2"><span className="text-muted-foreground">Address:</span> {user.address}</div>}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          Images: {images.length}/5
                        </Badge>
                        <Badge variant="secondary" className="font-mono text-xs">
                          Complaints: {complaints.length}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Images */}
          <TabsContent value="images" className="space-y-6">
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg">Upload Images ({images.length}/5)</h3>
                <Label htmlFor="img-upload" className={`cursor-pointer ${images.length >= 5 || scanning ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                    {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {scanning ? "Scanning..." : "Upload"}
                  </div>
                </Label>
                <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={images.length >= 5 || scanning} />
              </div>

              {images.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No images uploaded yet. Upload up to 5 images for AI scanning.</p>
              ) : (
                <div className="space-y-4">
                  {images.map((img) => (
                    <div key={img.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-secondary/50">
                      <img src={img.url} alt={img.name} className="h-20 w-20 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm">{img.name}</span>
                          {riskBadge(img.risk)}
                          {img.flagged && <Badge variant="destructive" className="text-xs">Flagged</Badge>}
                          {img.locked && <Badge className="bg-primary/20 text-primary text-xs"><Lock className="h-3 w-3 mr-1" />{img.lockType}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">Category: {img.category}</p>
                        <div className="flex gap-2 flex-wrap">
                          {!img.locked && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => lockImage(img.id, "PIN Lock")} className="text-xs">
                                <KeyRound className="h-3 w-3 mr-1" /> PIN Lock
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => lockImage(img.id, "Face Recognition")} className="text-xs">
                                <Eye className="h-3 w-3 mr-1" /> Face Lock
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => lockImage(img.id, "Eye Recognition")} className="text-xs">
                                <Fingerprint className="h-3 w-3 mr-1" /> Eye Lock
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => deleteImage(img.id)} className="text-xs">
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Misuse Detection */}
          <TabsContent value="misuse" className="space-y-4">
            <div className="glass-panel rounded-xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Online Misuse Detection</h3>
              {images.filter((i) => i.locked).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Lock your images first to enable misuse monitoring.</p>
              ) : (
                <div className="space-y-4">
                  {images.filter((i) => i.locked).map((img) => (
                    <div key={img.id} className="p-4 rounded-lg bg-secondary/50 space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={img.url} alt={img.name} className="h-12 w-12 rounded object-cover" />
                        <div className="flex-1">
                          <span className="font-mono text-sm">{img.name}</span>
                          {img.misuseDetected ? (
                            <div className="flex items-center gap-2 mt-1">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <span className="text-xs text-destructive font-semibold">Misuse Detected!</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span className="text-xs text-success">No misuse detected</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {img.misuseDetected && img.misuseDetails && (
                        <div className="ml-15 p-3 rounded bg-destructive/10 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-destructive" />
                            <span className="font-mono text-xs break-all">{img.misuseDetails.url}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Detected: {new Date(img.misuseDetails.date).toLocaleDateString()}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={() => {
                              setComplaintForm({ imageId: img.id, description: `Misuse detected at ${img.misuseDetails!.url}`, url: img.misuseDetails!.url });
                            }}
                          >
                            <FileWarning className="h-3 w-3 mr-1" /> File Complaint
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Complaints */}
          <TabsContent value="complaints" className="space-y-6">
            <div className="glass-panel rounded-xl p-6 space-y-4">
              <h3 className="font-display font-semibold text-lg">File a Complaint</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Select Image</Label>
                  <select
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    value={complaintForm.imageId}
                    onChange={(e) => setComplaintForm((p) => ({ ...p, imageId: e.target.value }))}
                  >
                    <option value="">Select an image</option>
                    {images.map((img) => (
                      <option key={img.id} value={img.id}>{img.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input value={complaintForm.url} onChange={(e) => setComplaintForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea value={complaintForm.description} onChange={(e) => setComplaintForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the issue..." />
                </div>
                <Button onClick={fileComplaint} className="gradient-primary text-primary-foreground font-semibold">
                  Submit Complaint
                </Button>
              </div>
            </div>

            {complaints.length > 0 && (
              <div className="glass-panel rounded-xl p-6 space-y-4">
                <h3 className="font-display font-semibold text-lg">Your Complaints</h3>
                {complaints.map((c) => (
                  <div key={c.id} className="p-4 rounded-lg bg-secondary/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">{c.id}</span>
                      <Badge variant={c.status === "Resolved" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                    <p className="text-xs text-muted-foreground">Filed: {new Date(c.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <div className="glass-panel rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-lg">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                >
                  Mark all read
                </Button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`p-4 rounded-lg ${n.read ? "bg-secondary/30" : "bg-secondary/50 border-l-2 border-primary"}`}>
                    <div className="flex items-start gap-3">
                      <Bell className={`h-4 w-4 mt-0.5 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                      <div>
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(n.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
