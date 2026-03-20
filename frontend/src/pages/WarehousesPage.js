import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const warehouseData = [
  {
    name: "Main Warehouse",
    zones: [
      { 
        name: "Zone A - Receiving", 
        shelves: [
          { 
            name: "Shelf 1", 
            racks: [
              { name: "Rack 1", bins: [{ name: "Bin 1" }, { name: "Bin 2" }, { name: "Bin 3" }] },
              { name: "Rack 2", bins: [{ name: "Bin 1" }, { name: "Bin 2" }] },
              { name: "Rack 3", bins: [{ name: "Bin 1" }, { name: "Bin 2" }, { name: "Bin 3" }, { name: "Bin 4" }] },
            ]
          },
          { name: "Shelf 2", racks: [{ name: "Rack 1", bins: [{ name: "Bin 1" }, { name: "Bin 2" }] }] },
        ]
      },
      { 
        name: "Zone B - Storage", 
        shelves: [
          { 
            name: "Shelf 1", 
            racks: [
              { name: "Rack 1", bins: [{ name: "Bin 1" }, { name: "Bin 2" }, { name: "Bin 3" }] },
              { name: "Rack 2", bins: [{ name: "Bin 1" }] },
            ]
          },
        ]
      },
      { name: "Zone C - Hazmat", shelves: [{ name: "Shelf 1", racks: [{ name: "Rack 1", bins: [{ name: "Bin 1" }] }] }] },
      { 
        name: "Zone D - Dispatch", 
        shelves: [
          { name: "Shelf 1", racks: [{ name: "Rack 1", bins: [{ name: "Bin 1" }, { name: "Bin 2" }] }] },
          { name: "Shelf 4", racks: [{ name: "Rack 2", bins: [{ name: "Bin 8" }] }] },
        ]
      },
    ],
  },
];

export default function WarehousesPage() {
  const [path, setPath] = useState({});

  const breadcrumbs = [{ label: "Warehouses", onClick: () => setPath({}) }];

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
  const { warehouseIdx, zoneIdx, shelfIdx, rackIdx } = path;

  if (warehouseIdx === undefined) {
    content = renderCards(warehouseData, "wh", "warehouseIdx", "name", "zones", "zones");
  } else {
    const wh = warehouseData[warehouseIdx];
    breadcrumbs.push({ label: wh.name, onClick: () => setPath({ warehouseIdx }) });

    if (zoneIdx === undefined) {
      content = renderCards(wh.zones, "zone", "zoneIdx", "name", "shelves", "shelves");
    } else {
      const zone = wh.zones[zoneIdx];
      breadcrumbs.push({ label: zone.name, onClick: () => setPath({ warehouseIdx, zoneIdx }) });

      if (shelfIdx === undefined) {
        content = renderCards(zone.shelves, "shelf", "shelfIdx", "name", "racks", "racks");
      } else {
        const shelf = zone.shelves[shelfIdx];
        breadcrumbs.push({ label: shelf.name, onClick: () => setPath({ warehouseIdx, zoneIdx, shelfIdx }) });

        if (rackIdx === undefined) {
          content = renderCards(shelf.racks, "rack", "rackIdx", "name", "bins", "bins");
        } else {
          const rack = shelf.racks[rackIdx];
          breadcrumbs.push({ label: rack.name, onClick: () => {} });

          content = (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {rack.bins.map((bin, i) => (
                <Card key={i} className="shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="text-sm font-medium">{bin.name}</p>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        }
      }
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
          <Button size="sm" className="h-9">
            <Plus className="w-4 h-4 mr-1.5" /> Add
          </Button>
        </div>
        {content}
      </div>
    </AppLayout>
  );
}