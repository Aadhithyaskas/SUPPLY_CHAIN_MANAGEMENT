import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Warehouse, ArrowRight, Shield, Loader2 } from "lucide-react";
// Import your service
import { login } from "../../../components/services/apiService"; 

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
      // Mapping your component state to your apiService parameters:
      // login(employeeId, email, password, adminId)
      await login(
        !isAdmin ? employeeId : null,
        isAdmin ? email : null,
        password,
        null // adminId if applicable
      );

      navigate("/auth/otp", { state: { isAdmin, employeeId, email } });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary mb-4">
            <Warehouse className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">WMS Pro</h1>
          <p className="text-sm text-muted-foreground mt-1">Warehouse Management System</p>
        </div>

        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader className="pb-4">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setIsAdmin(false); setError(""); }}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                  !isAdmin ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => { setIsAdmin(true); setError(""); }}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  isAdmin ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
            </div>
            <CardTitle className="text-lg">{isAdmin ? "Admin Sign In" : "Employee Sign In"}</CardTitle>
            {error && <p className="text-xs text-destructive font-medium mt-2 bg-destructive/10 p-2 rounded">{error}</p>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin ? (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
                  <Input id="email" type="email" placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-xs font-medium">Employee ID</Label>
                  <Input id="employeeId" placeholder="EMP001" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required disabled={isLoading} />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                  <button type="button" onClick={() => navigate("/auth/forgot-password")} className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"} 
                {!isLoading && <ArrowRight className="w-4 h-4 ml-1.5" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}