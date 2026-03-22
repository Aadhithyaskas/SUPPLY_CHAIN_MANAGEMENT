import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Trash2, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { listASN, getASN, deleteASN } from "../services/apiService";
import { useToast } from "../components/ui/use-toast";

const statusStyles = {
  pending: { label: "Pending", variant: "outline" },
  in_transit: { label: "In Transit", variant: "default" },
  arrived: { label: "Arrived", variant: "secondary" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function ASNPage() {
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [asnData, setAsnData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedASN, setSelectedASN] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadASNs();
  }, []);

  const loadASNs = async () => {
    setIsLoading(true);
    try {
      const data = await listASN();
      setAsnData(data);
    } catch (error) {
      console.error("Failed to load ASNs:", error);
      toast({
        title: "Error",
        description: "Failed to load ASNs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewASN = async (asnId) => {
    try {
      const asn = await getASN(asnId);
      setSelectedASN(asn);
      setViewDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load ASN details.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteASN = async (asnId) => {
    if (!window.confirm("Are you sure you want to delete this ASN?")) return;

    setIsSubmitting(true);
    try {
      await deleteASN(asnId);
      toast({ title: "Success", description: "ASN deleted successfully." });
      loadASNs();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = asnData.filter((a) =>
    a.asn_id?.toLowerCase().includes(search.toLowerCase()) ||
    a.vendor?.vendor_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      
      {/* Top Section */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ASN..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button size="sm" className="h-9" asChild>
          <a href="/asn/create">
            <Plus className="w-4 h-4 mr-1.5" /> New ASN
          </a>
        </Button>
      </div>

      {/* Table */}
      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ASN ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Shipment Date</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No ASNs found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((asn) => (
                  <TableRow key={asn.asn_id}>
                    <TableCell>{asn.asn_id}</TableCell>
                    <TableCell>{asn.vendor?.vendor_name || "-"}</TableCell>
                    <TableCell className="text-right">
                      {asn.items?.length || 0}
                    </TableCell>
                    <TableCell>
                      {asn.shipment_date
                        ? new Date(asn.shipment_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {asn.expected_arrival_date
                        ? new Date(asn.expected_arrival_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{asn.driver_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusStyles[asn.status]?.variant || "secondary"}>
                        {statusStyles[asn.status]?.label || asn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleViewASN(asn.asn_id)}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteASN(asn.asn_id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ASN Details</DialogTitle>
            <DialogDescription>
              {selectedASN?.vendor?.vendor_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p><b>ASN:</b> {selectedASN?.asn_id}</p>
            <p><b>Status:</b> {selectedASN?.status}</p>
            <p><b>Driver:</b> {selectedASN?.driver_name}</p>
          </div>

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
