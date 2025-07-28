import { useState, useEffect } from "react";
import { MapPin, Search, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  indianCities,
  getPopularCities,
  searchCities,
  type City,
} from "@/lib/cities";

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCitySelect: (city: City) => void;
  selectedCity?: City;
}

const LocationSelector = ({
  isOpen,
  onClose,
  onCitySelect,
  selectedCity,
}: LocationSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] =
    useState<City[]>(getPopularCities());
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      setFilteredCities(searchCities(searchQuery));
    } else {
      setFilteredCities(getPopularCities());
    }
  }, [searchQuery]);

  const detectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        },
      );

      const { latitude, longitude } = position.coords;

      // Find the closest city to the user's location
      let closestCity = indianCities[0];
      let minDistance = Number.MAX_SAFE_INTEGER;

      indianCities.forEach((city) => {
        const distance = Math.sqrt(
          Math.pow(city.latitude - latitude, 2) +
            Math.pow(city.longitude - longitude, 2),
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      });

      onCitySelect(closestCity);
      onClose();
    } catch (error) {
      console.error("Error detecting location:", error);
      // Fallback to Delhi if location detection fails
      const delhi = indianCities.find((city) => city.id === "delhi");
      if (delhi) {
        onCitySelect(delhi);
        onClose();
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleCitySelect = (city: City) => {
    onCitySelect(city);
    onClose();
  };

  const popularCities = getPopularCities();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-cricket-green" />
            <span>Select Your City</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auto-detect Location */}
          <Button
            onClick={detectCurrentLocation}
            disabled={isDetectingLocation}
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 py-3"
          >
            <Navigation
              className={cn("w-4 h-4", isDetectingLocation && "animate-spin")}
            />
            <span>
              {isDetectingLocation ? "Detecting..." : "Auto-detect Location"}
            </span>
          </Button>

          <Separator />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for your city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Popular Cities */}
          {!searchQuery && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Popular Cities
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {popularCities.slice(0, 8).map((city) => (
                  <Button
                    key={city.id}
                    variant="outline"
                    onClick={() => handleCitySelect(city)}
                    className={cn(
                      "justify-start text-left",
                      selectedCity?.id === city.id &&
                        "border-cricket-green bg-cricket-green/5",
                    )}
                  >
                    <div>
                      <div className="font-medium">{city.name}</div>
                      <div className="text-xs text-gray-500">{city.state}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Search Results
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <Button
                      key={city.id}
                      variant="ghost"
                      onClick={() => handleCitySelect(city)}
                      className={cn(
                        "w-full justify-start text-left p-3",
                        selectedCity?.id === city.id &&
                          "bg-cricket-green/5 border border-cricket-green",
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{city.name}</div>
                          <div className="text-xs text-gray-500">
                            {city.state}
                          </div>
                        </div>
                        {city.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No cities found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Cities */}
          {!searchQuery && popularCities.length > 8 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                All Cities
              </h3>
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-2 gap-1">
                  {indianCities
                    .filter((city) => !city.popular)
                    .slice(0, 20)
                    .map((city) => (
                      <Button
                        key={city.id}
                        variant="ghost"
                        onClick={() => handleCitySelect(city)}
                        className="justify-start text-left text-sm p-2"
                      >
                        {city.name}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
