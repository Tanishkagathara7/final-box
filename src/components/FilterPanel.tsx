import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export interface FilterOptions {
  priceRange: [number, number];
  distance: number;
  amenities: string[];
  pitchType: string;
  lighting: boolean;
  parking: boolean;
  rating: number;
  availability: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const defaultFilters: FilterOptions = {
  priceRange: [500, 2000],
  distance: 25,
  amenities: [],
  pitchType: "all",
  lighting: false,
  parking: false,
  rating: 0,
  availability: "all",
};

const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
}: FilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const amenitiesOptions = [
    "Floodlights",
    "Parking",
    "Washroom",
    "Changing Room",
    "AC Changing Room",
    "Drinking Water",
    "First Aid",
    "Equipment Rental",
    "Cafeteria",
    "Scoreboard",
    "Referee",
  ];

  const pitchTypes = [
    { value: "all", label: "All Types" },
    { value: "Artificial Turf", label: "Artificial Turf" },
    { value: "Synthetic", label: "Synthetic" },
    { value: "Matting", label: "Matting" },
    { value: "Concrete", label: "Concrete" },
  ];

  const availabilityOptions = [
    { value: "all", label: "All Slots" },
    { value: "morning", label: "Morning (6 AM - 12 PM)" },
    { value: "afternoon", label: "Afternoon (12 PM - 6 PM)" },
    { value: "evening", label: "Evening (6 PM - 10 PM)" },
  ];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const updatedAmenities = checked
      ? [...localFilters.amenities, amenity]
      : localFilters.amenities.filter((a) => a !== amenity);
    updateFilter("amenities", updatedAmenities);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    setLocalFilters(defaultFilters);
    onClearFilters();
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (
      localFilters.priceRange[0] !== 500 ||
      localFilters.priceRange[1] !== 2000
    )
      count++;
    if (localFilters.distance !== 25) count++;
    if (localFilters.amenities.length > 0) count++;
    if (localFilters.pitchType !== "all") count++;
    if (localFilters.lighting) count++;
    if (localFilters.parking) count++;
    if (localFilters.rating > 0) count++;
    if (localFilters.availability !== "all") count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters Count */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <Badge variant="secondary" className="text-sm">
            {getActiveFiltersCount()} filters active
          </Badge>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
            Clear All
          </Button>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Price Range (per hour)</Label>
        <div className="px-2">
          <Slider
            value={localFilters.priceRange}
            onValueChange={(value) => updateFilter("priceRange", value)}
            max={3000}
            min={200}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>₹{localFilters.priceRange[0]}</span>
            <span>₹{localFilters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Distance */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Distance (km)</Label>
        <div className="px-2">
          <Slider
            value={[localFilters.distance]}
            onValueChange={(value) => updateFilter("distance", value[0])}
            max={50}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>1 km</span>
            <span className="font-medium">{localFilters.distance} km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Minimum Rating</Label>
        <div className="px-2">
          <Slider
            value={[localFilters.rating]}
            onValueChange={(value) => updateFilter("rating", value[0])}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>Any</span>
            <span className="font-medium">
              {localFilters.rating > 0
                ? `${localFilters.rating}+ stars`
                : "Any rating"}
            </span>
            <span>5 stars</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pitch Type */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Pitch Type</Label>
        <RadioGroup
          value={localFilters.pitchType}
          onValueChange={(value) => updateFilter("pitchType", value)}
        >
          {pitchTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-3 py-2">
              <RadioGroupItem value={type.value} id={type.value} />
              <Label htmlFor={type.value} className="cursor-pointer text-base">
                {type.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Preferred Time</Label>
        <RadioGroup
          value={localFilters.availability}
          onValueChange={(value) => updateFilter("availability", value)}
        >
          {availabilityOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-3 py-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="cursor-pointer text-base">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Essential Features */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Essential Features</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 py-2">
            <Checkbox
              id="lighting"
              checked={localFilters.lighting}
              onCheckedChange={(checked) => updateFilter("lighting", checked)}
            />
            <Label htmlFor="lighting" className="cursor-pointer text-base">
              Night Lighting
            </Label>
          </div>
          <div className="flex items-center space-x-3 py-2">
            <Checkbox
              id="parking"
              checked={localFilters.parking}
              onCheckedChange={(checked) => updateFilter("parking", checked)}
            />
            <Label htmlFor="parking" className="cursor-pointer text-base">
              Parking Available
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Amenities */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Amenities</Label>
        <div className="grid grid-cols-1 gap-3">
          {amenitiesOptions.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-3 py-2">
              <Checkbox
                id={amenity}
                checked={localFilters.amenities.includes(amenity)}
                onCheckedChange={(checked) =>
                  handleAmenityChange(amenity, checked as boolean)
                }
              />
              <Label htmlFor={amenity} className="cursor-pointer text-base">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="pt-6">
        <Button
          onClick={applyFilters}
          size="lg"
          className="w-full bg-cricket-green hover:bg-cricket-green/90 py-3 h-12 text-base font-semibold"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[90vw] max-w-sm sm:w-80 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center space-x-2 text-lg">
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <FilterContent />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterPanel;
