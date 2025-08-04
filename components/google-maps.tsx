"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Mountain,
  Camera,
  Tent,
  TreePine,
  Waves,
  Home,
  Coffee,
  Navigation,
  ExternalLink,
} from "lucide-react";

// Tourist spots data with coordinates
const touristSpots = [
  {
    id: 1,
    name: "Air Terjun Sekumpul",
    type: "waterfall",
    lat: -7.4167,
    lng: 110.4833,
    description: "Air terjun setinggi 25 meter dengan kolam alami yang jernih",
    icon: "waterfall",
    category: "Wisata Alam",
  },
  {
    id: 2,
    name: "Basecamp Pendakian Merbabu",
    type: "hiking",
    lat: -7.415,
    lng: 110.485,
    description: "Basecamp resmi pendakian Gunung Merbabu via Tarubatang",
    icon: "mountain",
    category: "Pendakian",
  },
  {
    id: 3,
    name: "Camping Ground Sunrise",
    type: "camping",
    lat: -7.418,
    lng: 110.482,
    description: "Area camping dengan view sunrise terbaik",
    icon: "tent",
    category: "Camping",
  },
  {
    id: 4,
    name: "Hutan Pinus Tarubatang",
    type: "forest",
    lat: -7.42,
    lng: 110.48,
    description: "Hutan pinus dengan jalur trekking yang indah",
    icon: "tree",
    category: "Wisata Alam",
  },
  {
    id: 5,
    name: "Sungai Jernih Merbabu",
    type: "river",
    lat: -7.419,
    lng: 110.487,
    description: "Sungai dengan air jernih untuk refreshing",
    icon: "waves",
    category: "Wisata Alam",
  },
  {
    id: 6,
    name: "Homestay Merbabu View",
    type: "homestay",
    lat: -7.416,
    lng: 110.484,
    description: "Homestay dengan pemandangan Gunung Merbabu",
    icon: "home",
    category: "Akomodasi",
  },
  {
    id: 7,
    name: "Warung Kopi Lereng",
    type: "cafe",
    lat: -7.417,
    lng: 110.486,
    description: "Warung kopi dengan kopi lokal Merbabu",
    icon: "coffee",
    category: "Kuliner",
  },
  {
    id: 8,
    name: "Spot Foto Panorama",
    type: "viewpoint",
    lat: -7.414,
    lng: 110.488,
    description: "Spot foto terbaik dengan panorama pegunungan",
    icon: "camera",
    category: "Spot Foto",
  },
];

// Village center coordinates (Tarubatang, Selo, Boyolali)
const VILLAGE_CENTER = {
  lat: -7.491810021292882,
  lng: 110.46092439527409,
};

export default function GoogleMapsComponent() {
  const [selectedSpot, setSelectedSpot] = useState<
    (typeof touristSpots)[0] | null
  >(null);

  const getIconComponent = (type: string) => {
    const iconMap: { [key: string]: any } = {
      waterfall: Waves,
      hiking: Mountain,
      camping: Tent,
      forest: TreePine,
      river: Waves,
      homestay: Home,
      cafe: Coffee,
      viewpoint: Camera,
    };
    return iconMap[type] || Camera;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Wisata Alam":
        return "bg-green-100 text-green-800";
      case "Pendakian":
        return "bg-red-100 text-red-800";
      case "Camping":
        return "bg-blue-100 text-blue-800";
      case "Spot Foto":
        return "bg-purple-100 text-purple-800";
      case "Akomodasi":
        return "bg-orange-100 text-orange-800";
      case "Kuliner":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const focusOnSpot = (spot: (typeof touristSpots)[0]) => {
    setSelectedSpot(spot);
    // Scroll to the map
    document.getElementById("main-map")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <div className="relative" id="main-map">
        <div className="w-full rounded-lg shadow-lg overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31646.07417511448!2d110.46092439527409!3d-7.491810021292882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a651b39211b75%3A0x53aa0d3bee048fc!2sTarubatang%2C%20Kec.%20Selo%2C%20Kabupaten%20Boyolali%2C%20Jawa%20Tengah!5e0!3m2!1sid!2sid!4v1753532416384!5m2!1sid!2sid"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Peta Lokasi Tarubatang, Selo, Boyolali"
          />
        </div>

        {/* Map Info Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-sm">Tarubatang, Selo</h4>
          </div>
          <p className="text-xs text-gray-600">
            Desa wisata di kaki Gunung Merbabu, Kabupaten Boyolali, Jawa Tengah
          </p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-semibold text-sm mb-2">Kategori Wisata</h4>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="flex items-center space-x-2">
              <TreePine className="w-3 h-3 text-green-600" />
              <span>Wisata Alam</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mountain className="w-3 h-3 text-red-600" />
              <span>Pendakian</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tent className="w-3 h-3 text-blue-600" />
              <span>Camping</span>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="w-3 h-3 text-purple-600" />
              <span>Spot Foto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const url = `https://www.google.com/maps/search/Tarubatang+Selo+Boyolali/@${VILLAGE_CENTER.lat},${VILLAGE_CENTER.lng},14z`;
            window.open(url, "_blank");
          }}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Buka di Google Maps
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  };
                  const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${VILLAGE_CENTER.lat},${VILLAGE_CENTER.lng}`;
                  window.open(url, "_blank");
                },
                (error) => {
                  // Fallback jika geolocation gagal
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${VILLAGE_CENTER.lat},${VILLAGE_CENTER.lng}`;
                  window.open(url, "_blank");
                }
              );
            } else {
              // Fallback untuk browser yang tidak support geolocation
              const url = `https://www.google.com/maps/dir/?api=1&destination=${VILLAGE_CENTER.lat},${VILLAGE_CENTER.lng}`;
              window.open(url, "_blank");
            }
          }}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Rute dari Lokasi Saya
        </Button>
      </div>

      {/* Tourist Spots List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Destinasi Wisata di Tarubatang
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {touristSpots.map((spot) => {
            const IconComponent = getIconComponent(spot.type);
            return (
              <Card
                key={spot.id}
                className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                  selectedSpot?.id === spot.id
                    ? "ring-2 ring-green-500 shadow-lg"
                    : ""
                }`}
                onClick={() => focusOnSpot(spot)}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <div className="p-3 bg-green-50 rounded-full">
                        <IconComponent className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">{spot.name}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {spot.description}
                      </p>
                      <Badge
                        className={`text-xs ${getCategoryColor(spot.category)}`}
                      >
                        {spot.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Selected Spot Details */}
      {selectedSpot && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {(() => {
                  const IconComponent = getIconComponent(selectedSpot.type);
                  return (
                    <div className="p-3 bg-green-100 rounded-full">
                      <IconComponent className="h-8 w-8 text-green-600" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-semibold text-xl text-green-800 mb-2">
                    {selectedSpot.name}
                  </h3>
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {selectedSpot.description}
                  </p>
                  <Badge
                    className={`${getCategoryColor(selectedSpot.category)}`}
                  >
                    {selectedSpot.category}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.lat},${selectedSpot.lng}`;
                    window.open(url, "_blank");
                  }}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Petunjuk Arah
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSpot(null)}
                >
                  Tutup Detail
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Informasi Lokasi
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-blue-700">Alamat:</strong>
              <p className="text-gray-700">
                Tarubatang, Kec. Selo, Kabupaten Boyolali, Jawa Tengah
              </p>
            </div>
            <div>
              <strong className="text-blue-700">Akses:</strong>
              <p className="text-gray-700">
                Dapat diakses dengan kendaraan pribadi atau transportasi umum
              </p>
            </div>
            <div>
              <strong className="text-blue-700">Koordinat:</strong>
              <p className="text-gray-700">-7.492°S, 110.461°E</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
