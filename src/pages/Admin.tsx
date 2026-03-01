import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Users, Image, FileWarning, Search, LogOut, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

const mockUsers = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", images: 3, complaints: 1 },
  { id: "2", name: "Bob Smith", email: "bob@example.com", images: 5, complaints: 0 },
  { id: "3", name: "Carol Davis", email: "carol@example.com", images: 2, complaints: 2 },
];

const mockFlaggedImages = [
  { id: "f1", user: "Alice Johnson", name: "photo_03.jpg", category: "Blurred / Censored", risk: "Moderate Risk" },
  { id: "f2", user: "Carol Davis", name: "image_sensitive.jpg", category: "Face + Explicit", risk: "High Risk" },
  { id: "f3", user: "Bob Smith", name: "upload_05.png", category: "Explicit (No Face)", risk: "High Risk" },
];

const mockComplaints = [
  { id: "EC-100001", user: "Alice Johnson", description: "Image found on suspicious website", status: "Submitted", date: "2026-02-28" },
  { id: "EC-100002", user: "Carol Davis", description: "Deepfake detected using my photo", status: "Under Review", date: "2026-02-27" },
  { id: "EC-100003", user: "Carol Davis", description: "Unauthorized use on social media", status: "Action Taken", date: "2026-02-25" },
];

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState(mockComplaints);

  useEffect(() => {
    const stored = localStorage.getItem("ethicare_user");
    if (!stored) { navigate("/login"); return; }
    const user = JSON.parse(stored);
    if (user.role !== "admin") { navigate("/dashboard"); }
  }, [navigate]);

  const updateComplaintStatus = (id: string, status: string) => {
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    toast({ title: "Updated", description: `Complaint ${id} → ${status}` });
  };

  const logout = () => {
    localStorage.removeItem("ethicare_user");
    navigate("/login");
  };

  const stats = [
    { label: "Total Users", value: mockUsers.length, icon: Users },
    { label: "Flagged Images", value: mockFlaggedImages.length, icon: Image },
    { label: "Active Complaints", value: complaints.filter((c) => c.status !== "Resolved").length, icon: FileWarning },
    { label: "Misuse Detected", value: 2, icon: Search },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="glass-panel border-b sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <Shield className="h-5 w-5 text-primary" />
            <span className="gradient-text">ETHICARE</span>
            <Badge variant="secondary" className="ml-2 text-xs font-mono">ADMIN</Badge>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel rounded-xl p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-display font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="flagged">Flagged Images</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="misuse">Misuse Results</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="glass-panel rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Images</th>
                    <th className="text-left p-4 font-semibold">Complaints</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-4 font-medium">{u.name}</td>
                      <td className="p-4 text-muted-foreground">{u.email}</td>
                      <td className="p-4">{u.images}/5</td>
                      <td className="p-4">{u.complaints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="flagged">
            <div className="glass-panel rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">User</th>
                    <th className="text-left p-4 font-semibold">File</th>
                    <th className="text-left p-4 font-semibold">Category</th>
                    <th className="text-left p-4 font-semibold">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFlaggedImages.map((img) => (
                    <tr key={img.id} className="border-t">
                      <td className="p-4 font-medium">{img.user}</td>
                      <td className="p-4 font-mono text-xs">{img.name}</td>
                      <td className="p-4 text-muted-foreground">{img.category}</td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          img.risk === "Moderate Risk" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
                        }`}>{img.risk}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="complaints">
            <div className="space-y-4">
              {complaints.map((c) => (
                <div key={c.id} className="glass-panel rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{c.id}</span>
                      <Badge variant="secondary" className="text-xs">{c.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">By: {c.user}</p>
                    <p className="text-sm">{c.description}</p>
                    <p className="text-xs text-muted-foreground">{c.date}</p>
                  </div>
                  <Select onValueChange={(v) => updateComplaintStatus(c.id, v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Action Taken">Action Taken</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="misuse">
            <div className="glass-panel rounded-xl p-6 space-y-4">
              <h3 className="font-display font-semibold text-lg">Simulated Misuse Detection Results</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-destructive/10 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Alice Johnson — photo_03.jpg</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">Found on: https://suspicious-site.example.com</p>
                    <p className="text-xs text-muted-foreground">Detected: Feb 27, 2026</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Carol Davis — image_sensitive.jpg</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">Found on: https://deepfake-site.example.net</p>
                    <p className="text-xs text-muted-foreground">Detected: Feb 26, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
