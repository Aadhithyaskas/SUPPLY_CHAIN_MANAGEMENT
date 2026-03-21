import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { Card, CardContent } from "../components/ui/card";
import { ChevronRight, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { getWarehouse } from "../services/apiService";
import { listInventory } from "../services/apiService";

export default function WarehousesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [warehouse, setWarehouse] = useState(null);
  const [inventoryLocations, setInventoryLocations] = useState([]);
  const [path, setPath] = useState({});

  useEffect(() => {
    loadWarehouseAndInventory();
  }, []);

  const loadWarehouseAndInventory = async () => {
    setIsLoading(true);
    try {
      const [wh, inventory] = await Promise.all([
        getWarehouse(),
        listInventory(),
      ]);
      setWarehouse(wh);
      
      // Group inventory by zone
      const zones = {};
      (inventory || []).forEach(item => {
        const zone = item.zone_name || "Unknown";
        if (!zones[zone]) zones[zone] = [];
        zones[zone].push(item);
      });
      
      const zoneList = Object.keys(zones).map(zone => ({
        name: zone,
        items: zones[zone],
        shelves: [...new Set(zones[zone].map(i => i.shelf_name).filter(Boolean))],
      }));
      
      setInventoryLocations(zoneList);
    } catch (error) {
      console.error("Failed to load warehouse data:", error);
      toast({
        title: "Error",
        description: "Failed to load warehouse data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbs = [{ label: "Warehouses", onClick: () => setPath({}) }];
  const { zoneIdx, shelfIdx, rackIdx } = path;

  const renderCards = (items, key, nextPathKey, labelKey, subLabelKey, subLabelSuffix) => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Card 
          key={i} 
          className="shadow-sm cursor-pointer hover:border-primary/40 transition-colors" 
          onClick={() => setPath({ ...path, [nextPathKey]: i })}
        >
          <CardContent className="p-4">
            <p className="text-sm font-semibold">{item[labelKey]}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {item[subLabelKey]?.length || 0} {subLabelSuffix}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  let content = null;

  if (isLoading) {
    content = (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  } else if (zoneIdx === undefined) {
    const zones = inventoryLocations.map(zone => ({
      name: zone.name,
      shelves: zone.shelves,
    }));
    content = renderCards(zones, "zone", "zoneIdx", "name", "shelves", "shelves");
  } else {
    const zone = inventoryLocations[zoneIdx];
    breadcrumbs.push({ label: zone.name, onClick: () => setPath({ warehouseIdx: 0 }) });

    if (shelfIdx === undefined) {
      const shelves = zone.shelves.map(shelf => ({ name: shelf, racks: [] }));
      content = renderCards(shelves, "shelf", "shelfIdx", "name", "racks", "racks");
    } else {
      const shelf = zone.shelves[shelfIdx];
      breadcrumbs.push({ label: shelf, onClick: () => setPath({ warehouseIdx: 0, zoneIdx }) });

      const items = zone.items.filter(item => item.shelf_name === shelf);
      content = (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm font-medium">{item.product?.product_name || "Empty"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bin: {item.bin_name} | Qty: {item.quantity || 0}
                </p>
                <div className="flex justify-end gap-1 mt-2">
                  <button className="p-1 rounded hover:bg-muted transition-colors">
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
  }

  return (
    <AppLayout title="Warehouses">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((bc, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                <button
                  onClick={bc.onClick}
                  className={`hover:underline ${i === breadcrumbs.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                >
                  {bc.label}
                </button>
              </span>
            ))}
          </nav>
          <Button size="sm" className="h-9" disabled>
            <Plus className="w-4 h-4 mr-1.5" /> Add (Coming Soon)
          </Button>
        </div>

        {warehouse && zoneIdx === undefined && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm font-medium">{warehouse.warehouse_name}</p>
              <p className="text-xs text-muted-foreground">{warehouse.address}</p>
            </CardContent>
          </Card>
        )}

        {content}
      </div>
    </AppLayout>
  );
}