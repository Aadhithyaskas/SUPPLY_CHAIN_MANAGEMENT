import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Warehouse, ArrowRight, Shield, Loader2, Package, Truck, ClipboardCheck, TrendingUp, Mail, User, Key } from "lucide-react";
import { login } from "../../services/apiService";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(
        !isAdmin ? employeeId : null,
        email,
        password,
        isAdmin ? employeeId : null
      );
      navigate("/auth/otp", { state: { isAdmin, employeeId, email } });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Package, title: "Inventory Management", desc: "Real-time stock tracking" },
    { icon: Truck, title: "Supply Chain", desc: "Vendor & supplier management" },
    { icon: ClipboardCheck, title: "Quality Control", desc: "QC workflow & approvals" },
    { icon: TrendingUp, title: "Analytics", desc: "Reports & insights" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Section - Branding */}
        <div className="lg:w-1/2 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20" />
          
          <div className="relative z-10 flex flex-col justify-center min-h-[550px] p-8 lg:p-12 text-primary-foreground">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Warehouse className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">WMS Pro</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">Welcome Back</h1>
              <p className="text-base lg:text-lg opacity-90 mb-8">
                Enterprise Warehouse Management System
              </p>
            </div>
            
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{feature.title}</p>
                    <p className="text-xs opacity-80">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-xs opacity-70">© 2024 WMS Pro. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="lg:w-1/2 bg-background flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-6 lg:hidden">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-3">
                <Warehouse className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">WMS Pro</h1>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold">Sign In</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your credentials to access your account
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setIsAdmin(false); setError(""); setEmployeeId(""); setEmail(""); setPassword(""); }}
                className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-all ${
                  !isAdmin 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => { setIsAdmin(true); setError(""); setEmployeeId(""); setEmail(""); setPassword(""); }}
                className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  isAdmin 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Employee ID Field - For both Employee and Admin */}
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-sm font-medium">
                  {isAdmin ? "Admin ID" : "Employee ID"}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="employeeId"
                    placeholder={isAdmin ? "ADM0001" : "EMP001"}
                    className="pl-10 h-11"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field - For both Employee and Admin */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field - For both Employee and Admin */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={() => navigate("/auth/forgot-password")}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Secure login with OTP verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}