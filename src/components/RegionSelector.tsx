import { MapPin } from "lucide-react";

interface RegionSelectorProps {
  selectedRegion: string;
  selectedDistrict: string;
  onRegionChange: (region: string) => void;
  onDistrictChange: (district: string) => void;
  regions: { name: string; districts: string[] }[];
}

const RegionSelector = ({
  selectedRegion,
  selectedDistrict,
  onRegionChange,
  onDistrictChange,
  regions,
}: RegionSelectorProps) => {
  const currentRegion = regions.find((r) => r.name === selectedRegion) || regions[0];

  return (
    <div className="card-glass gold-border p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground font-serif">Hududni tanlang</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          value={selectedRegion}
          onChange={(e) => {
            onRegionChange(e.target.value);
            const region = regions.find((r) => r.name === e.target.value);
            if (region && region.districts.length > 0) {
              onDistrictChange(region.districts[0]);
            }
          }}
          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
        >
          {regions.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={selectedDistrict}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
        >
          {currentRegion?.districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RegionSelector;
