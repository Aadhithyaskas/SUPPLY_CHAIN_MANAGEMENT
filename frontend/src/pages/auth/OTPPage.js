import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Warehouse, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
// Import your service
import { verifyOTP } from "C:\Users\academytraining\Desktop\demo\SUPPLY_CHAIN_MANAGEMENT\frontend\src\components\services\apiService.js";

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = ["Credentials", "OTP Verification"];

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await verifyOTP(otp);
      
      // Check if backend flags this as a first-time login
      if (result.is_first_login) {
        navigate("/auth/force-change-password");
      } else {
        navigate("/auth/select-role");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP. Please check and try again.");
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
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                i < 1 ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
              }`}>
                {i < 1 ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${i === 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step}</span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">OTP Verification</CardTitle>
            <CardDescription>Enter the 6-digit code sent to your registered email</CardDescription>
            {error && <p className="text-xs text-destructive font-medium mt-2 bg-destructive/10 p-2 rounded">{error}</p>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isLoading}>
                  <InputOTPGroup>
                    {[...Array(6)].map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t">
              <button onClick={() => navigate("/auth/login")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-3 h-3" /> Back to login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}