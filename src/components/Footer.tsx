import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <Shield className="h-5 w-5 text-primary" />
              <span className="gradient-text">ETHICARE</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Protecting Your Identity in the AI Era
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Platform</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/explore" className="block hover:text-primary">How It Works</Link>
              <Link to="/about" className="block hover:text-primary">About Us</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <span className="block">Privacy Policy</span>
              <span className="block">Terms of Service</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <span className="block">support@ethicare.ai</span>
              <span className="block">+1 (555) 000-0000</span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ethicare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
