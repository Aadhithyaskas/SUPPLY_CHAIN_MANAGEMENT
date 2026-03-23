import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createVendor } from "../services/apiService";
import { useToast } from "../components/ui/use-toast";

const EMPTY_FORM = {
  vendor_name: "",
  contact_person: "",
  email: "",
  phone: "",
  lead_time: "",
  address: "",
  city: "",
  state: "",
  country: "",
};

const Field = ({ label, icon: Icon, required, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
  </div>
);

export default function CreateVendorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const isFormValid =
    formData.vendor_name.trim() &&
    formData.phone.trim() &&
    formData.lead_time !== "";

  const completedFields = Object.values(formData).filter((v) => String(v).trim() !== "").length;
  const totalFields = Object.keys(formData).length;
  const progress = Math.round((completedFields / totalFields) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      await createVendor(formData);
      toast({ title: "Success", description: `${formData.vendor_name} has been created.` });
      navigate(-1);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">

      {/* ── Sticky Top Bar ── */}
      <header className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vendors
          </Button>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-sm font-semibold">Create New Vendor</h1>
            <p className="text-xs text-muted-foreground">Fill in all required fields to register a vendor</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{completedFields}/{totalFields} fields</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</>
              : <><CheckCircle2 className="w-4 h-4 mr-1.5" />Create Vendor</>
            }
          </Button>
        </div>
      </header>

      {/* ── Body ── */}
      <form onSubmit={handleSubmit} className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* ── Row 1: Vendor Info (2/3) + Procurement (1/3) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Vendor Info */}
            <div className="lg:col-span-2 bg-background rounded-xl border shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold">Vendor Information</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Vendor Name" icon={Building2} required>
                  <Input
                    value={formData.vendor_name}
                    onChange={setField("vendor_name")}
                    placeholder="e.g. DMart Suppliers"
                    className="h-9"
                    required
                  />
                </Field>
                <Field label="Contact Person" icon={User}>
                  <Input
                    value={formData.contact_person}
                    onChange={setField("contact_person")}
                    placeholder="e.g. Rohan Sharma"
                    className="h-9"
                  />
                </Field>
                <Field label="Email Address" icon={Mail}>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={setField("email")}
                    placeholder="vendor@email.com"
                    className="h-9"
                  />
                </Field>
                <Field label="Phone Number" icon={Phone} required>
                  <Input
                    value={formData.phone}
                    onChange={setField("phone")}
                    placeholder="e.g. 06369775290"
                    className="h-9"
                    required
                  />
                </Field>
              </div>
            </div>

            {/* Procurement */}
            <div className="bg-background rounded-xl border shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <h2 className="text-sm font-semibold">Procurement</h2>
              </div>

              <Field label="Lead Time (days)" icon={Clock} required>
                <Input
                  type="number"
                  min="0"
                  value={formData.lead_time}
                  onChange={setField("lead_time")}
                  placeholder="e.g. 7"
                  className="h-9"
                  required
                />
              </Field>

              {formData.lead_time && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Orders arrive in{" "}
                    <span className="font-semibold">
                      {formData.lead_time} day{formData.lead_time !== "1" ? "s" : ""}
                    </span>{" "}
                    after placement
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Default Status</span>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>
            </div>
          </div>

          {/* ── Row 2: Address & Location ── */}
          <div className="bg-background rounded-xl border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-500" />
              </div>
              <h2 className="text-sm font-semibold">Address & Location</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                <Field label="Street Address" icon={MapPin}>
                  <textarea
                    value={formData.address}
                    onChange={setField("address")}
                    placeholder="Enter full street address..."
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </Field>
              </div>
              <Field label="City">
                <Input
                  value={formData.city}
                  onChange={setField("city")}
                  placeholder="e.g. Cuddalore"
                  className="h-9"
                />
              </Field>
              <Field label="State">
                <Input
                  value={formData.state}
                  onChange={setField("state")}
                  placeholder="e.g. Tamil Nadu"
                  className="h-9"
                />
              </Field>
              <Field label="Country">
                <Input
                  value={formData.country}
                  onChange={setField("country")}
                  placeholder="e.g. India"
                  className="h-9"
                />
              </Field>
            </div>
          </div>

          {/* ── Row 3: Live Summary ── */}
          <div className="bg-background rounded-xl border shadow-sm p-5">
            <div className="flex items-center gap-2 pb-2 border-b mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-sm font-semibold">Summary Preview</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Vendor Name",    value: formData.vendor_name },
                { label: "Contact Person", value: formData.contact_person },
                { label: "Email",          value: formData.email },
                { label: "Phone",          value: formData.phone },
                { label: "Lead Time",      value: formData.lead_time ? `${formData.lead_time} days` : "" },
                { label: "Location",       value: [formData.city, formData.state, formData.country].filter(Boolean).join(", ") },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-muted/50 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">{label}</p>
                  <p className={`text-xs font-medium truncate ${!value ? "text-muted-foreground italic" : "text-foreground"}`}>
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom Actions ── */}
          <div className="flex justify-end gap-3 pb-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting} className="min-w-[140px]">
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</>
                : <><CheckCircle2 className="w-4 h-4 mr-1.5" />Create Vendor</>
              }
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}