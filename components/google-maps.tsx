"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Mountain, Camera, Tent, TreePine, Waves, Home, Coffee } from "lucide-react"

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
]

// Village center coordinates
const VILLAGE_CENTER = {
  lat: -7.4167,
  lng: 110.4833,
}

export default function GoogleMapsComponent() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<(typeof touristSpots)[0] | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY"}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: VILLAGE_CENTER,
      zoom: 14,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "landscape.natural",
          elementType: "geometry.fill",
          stylers: [{ color: "#f0f8f0" }],
        },
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    })

    setMap(mapInstance)

    // Add markers for each tourist spot
    touristSpots.forEach((spot) => {
      const marker = new window.google.maps.Marker({
        position: { lat: spot.lat, lng: spot.lng },
        map: mapInstance,
        title: spot.name,
        icon: {
          url: getMarkerIcon(spot.type),
          scaledSize: new window.google.maps.Size(40, 40),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(20, 40),
        },
      })

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #16a34a; font-weight: bold;">${spot.name}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${spot.description}</p>
            <span style="background: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${spot.category}</span>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(mapInstance, marker)
        setSelectedSpot(spot)
      })
    })

    // Add village center marker
    new window.google.maps.Marker({
      position: VILLAGE_CENTER,
      map: mapInstance,
      title: "Pusat Desa Tarubatang",
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="20" fill="#dc2626" stroke="white" strokeWidth="3"/>
            <text x="25" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">DESA</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(50, 50),
        anchor: new window.google.maps.Point(25, 25),
      },
    })
  }, [isLoaded])

  const getMarkerIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      waterfall:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#0ea5e9" stroke="white" strokeWidth="2"/>
          <path d="M20 8 L16 16 L20 12 L24 16 Z M20 16 L16 24 L20 20 L24 24 Z M20 24 L16 32 L20 28 L24 32 Z" fill="white"/>
        </svg>
      `),
      hiking:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#16a34a" stroke="white" strokeWidth="2"/>
          <path d="M12 28 L20 12 L28 28 Z" fill="white"/>
          <circle cx="20" cy="18" r="2" fill="#16a34a"/>
        </svg>
      `),
      camping:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#f59e0b" stroke="white" strokeWidth="2"/>
          <path d="M12 26 L20 14 L28 26 Z" fill="white"/>
          <rect x="18" y="22" width="4" height="4" fill="#f59e0b"/>
        </svg>
      `),
      forest:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#059669" stroke="white" strokeWidth="2"/>
          <path d="M20 10 L16 18 L24 18 Z M20 14 L14 22 L26 22 Z M20 18 L12 26 L28 26 Z" fill="white"/>
          <rect x="19" y="26" width="2" height="4" fill="white"/>
        </svg>
      `),
      river:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#06b6d4" stroke="white" strokeWidth="2"/>
          <path d="M10 20 Q15 15 20 20 T30 20 Q25 25 20 20 T10 20" fill="white"/>
        </svg>
      `),
      homestay:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#7c3aed" stroke="white" strokeWidth="2"/>
          <path d="M12 24 L20 16 L28 24 L28 28 L12 28 Z" fill="white"/>
          <rect x="18" y="22" width="4" height="6" fill="#7c3aed"/>
        </svg>
      `),
      cafe:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#92400e" stroke="white" strokeWidth="2"/>
          <rect x="14" y="16" width="8" height="10" rx="1" fill="white"/>
          <rect x="22" y="18" width="4" height="6" rx="1" fill="white"/>
          <path d="M16 14 Q18 12 20 14 Q22 12 24 14" stroke="white" strokeWidth="1" fill="none"/>
        </svg>
      `),
      viewpoint:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#ec4899" stroke="white" strokeWidth="2"/>
          <rect x="14" y="16" width="12" height="8" rx="2" fill="white"/>
          <circle cx="20" cy="20" r="2" fill="#ec4899"/>
          <rect x="18" y="24" width="4" height="2" fill="white"/>
        </svg>
      `),
    }
    return iconMap[type] || iconMap.viewpoint
  }

  const focusOnSpot = (spot: (typeof touristSpots)[0]) => {
    if (map) {
      map.setCenter({ lat: spot.lat, lng: spot.lng })
      map.setZoom(16)
      setSelectedSpot(spot)
    }
  }

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
    }
    return iconMap[type] || Camera
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat peta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative">
        <div ref={mapRef} className="w-full h-96 rounded-lg shadow-lg" />

        {/* Map Controls */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (map) {
                  map.setCenter(VILLAGE_CENTER)
                  map.setZoom(14)
                }
              }}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Pusat Desa
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-semibold text-sm mb-2">Legenda</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Air Terjun</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Pendakian</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Camping</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Homestay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tourist Spots List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {touristSpots.map((spot) => {
          const IconComponent = getIconComponent(spot.type)
          return (
            <Card
              key={spot.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSpot?.id === spot.id ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => focusOnSpot(spot)}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <IconComponent className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm truncate">{spot.name}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{spot.description}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {spot.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Spot Details */}
      {selectedSpot && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {(() => {
                  const IconComponent = getIconComponent(selectedSpot.type)
                  return <IconComponent className="h-6 w-6 text-green-600 mt-1" />
                })()}
                <div>
                  <h3 className="font-semibold text-lg text-green-800">{selectedSpot.name}</h3>
                  <p className="text-gray-700 mb-2">{selectedSpot.description}</p>
                  <Badge className="bg-green-100 text-green-800">{selectedSpot.category}</Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.lat},${selectedSpot.lng}`
                  window.open(url, "_blank")
                }}
              >
                Petunjuk Arah
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const bounds = new window.google.maps.LatLngBounds()
            touristSpots.forEach((spot) => {
              bounds.extend({ lat: spot.lat, lng: spot.lng })
            })
            if (map) {
              map.fitBounds(bounds)
            }
          }}
        >
          Lihat Semua Lokasi
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const url = `https://www.google.com/maps/search/Tarubatang+Selo+Boyolali/@${VILLAGE_CENTER.lat},${VILLAGE_CENTER.lng},14z`
            window.open(url, "_blank")
          }}
        >
          Buka di Google Maps
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                const userLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                }
                const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${VILLAGE_CENTER.lat},${VILLAGE_CENTER.lng}`
                window.open(url, "_blank")
              })
            }
          }}
        >
          Rute dari Lokasi Saya
        </Button>
      </div>
    </div>
  )
}
