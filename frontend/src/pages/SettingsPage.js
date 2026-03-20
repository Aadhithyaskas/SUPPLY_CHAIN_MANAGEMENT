import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <AppLayout title="Settings">
      <div className="space-y-4 max-w-2xl">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Company Name</Label>
              <Input defaultValue="WMS Pro Inc." className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Default Currency</Label>
              <Input defaultValue="USD" className="h-9" />
            </div>
            <Button size="sm">Save</Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Low Stock Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified when items hit reorder level</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">ASN Arrival Alerts</p>
                <p className="text-xs text-muted-foreground">Notify when shipments arrive</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">PR Approval Required</p>
                <p className="text-xs text-muted-foreground">Alert for pending purchase approvals</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}