"use client";

import { Button } from "@/components/ui/button";
import {
  MapPin,
  Mountain,
  Camera,
  Tent,
  TreePine,
  Navigation,
  ExternalLink,
} from "lucide-react";

// Village center coordinates (Tarubatang, Selo, Boyolali)
const VILLAGE_CENTER = {
  lat: -7.491810021292882,
  lng: 110.46092439527409,
};

export default function GoogleMapsComponent() {
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

      {/* Additional Info */}
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Informasi Lokasi
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-blue-700">Alamat:</strong>
              <p className="text-muted-foreground">
                Tarubatang, Kec. Selo, Kabupaten Boyolali, Jawa Tengah
              </p>
            </div>
            <div>
              <strong className="text-blue-700">Akses:</strong>
              <p className="text-muted-foreground">
                Dapat diakses dengan kendaraan pribadi atau transportasi umum
              </p>
            </div>
            <div>
              <strong className="text-blue-700">Koordinat:</strong>
              <p className="text-muted-foreground">-7.492°S, 110.482°E</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
