import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const suppliersData = [
  { id: "SUP-001", name: "MetalPro Inc", contact: "Robert Steel", email: "robert@metalpro.com", phone: "+1 555-0201", category: "Raw Materials" },
  { id: "SUP-002", name: "PipeWorks Ltd", contact: "Jenny Pipe", email: "jenny@pipeworks.com", phone: "+1 555-0202", category: "Plumbing" },
  { id: "SUP-003", name: "WireTech", contact: "Alan Wire", email: "alan@wiretech.com", phone: "+1 555-0203", category: "Electrical" },
  { id: "SUP-004", name: "SafeGear Co", contact: "Nina Safe", email: "nina@safegear.com", phone: "+1 555-0204", category: "PPE" },
  { id: "SUP-005", name: "LubeMax", contact: "Carlos Oil", email: "carlos@lubemax.com", phone: "+1 555-0205", category: "Industrial" },
  { id: "SUP-006", name: "BrightLux", contact: "Sam Light", email: "sam@brightlux.com", phone: "+1 555-0206", category: "Electrical" },
  { id: "SUP-007", name: "PowerCell", contact: "Eva Power", email: "eva@powercell.com", phone: "+1 555-0207", category: "Batteries" },
  { id: "SUP-008", name: "PackRight", contact: "Tom Pack", email: "tom@packright.com", phone: "+1 555-0208", category: "Packaging" },
];

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  
  const filtered = suppliersData.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Suppliers">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search suppliers..." 
              className="pl-9 h-9" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button size="sm" className="h-9">
            <Plus className="w-4 h-4 mr-1.5" /> Add Supplier
          </Button>
        </div>
        
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">ID</TableHead>
                  <TableHead className="text-xs font-semibold">Company Name</TableHead>
                  <TableHead className="text-xs font-semibold">Contact</TableHead>
                  <TableHead className="text-xs font-semibold">Email</TableHead>
                  <TableHead className="text-xs font-semibold">Phone</TableHead>
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-xs font-semibold text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs font-mono font-medium">{s.id}</TableCell>
                    <TableCell className="text-sm font-medium">{s.name}</TableCell>
                    <TableCell className="text-xs">{s.contact}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.email}</TableCell>
                    <TableCell className="text-xs">{s.phone}</TableCell>
                    <TableCell className="text-xs">{s.category}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}