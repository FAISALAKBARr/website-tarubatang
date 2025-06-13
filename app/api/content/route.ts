import { type NextRequest, NextResponse } from "next/server"

// Mock storage - in production, use a database
let websiteContent = {
  hero: {
    title: "Selamat Datang di Desa Tarubatang",
    subtitle: "Kawasan Taman Nasional Gunung Merbabu",
    description:
      "Destinasi wisata alam yang memukau di kaki Gunung Merbabu, menawarkan keindahan alam, budaya lokal, dan pengalaman tak terlupakan.",
  },
  about: {
    title: "Tentang Desa Tarubatang",
    description:
      "Desa wisata yang terletak di kaki Gunung Merbabu dengan keindahan alam yang menakjubkan dan budaya lokal yang kaya.",
    stats: {
      altitude: "1,200m",
      population: "2,500",
      destinations: "8",
      events: "12",
    },
  },
  destinations: [
    {
      id: 1,
      name: "Air Terjun Sekumpul",
      category: "Wisata Alam",
      description: "Air terjun setinggi 25 meter dengan kolam alami yang jernih",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.8,
      price: "Rp 10.000",
    },
    {
      id: 2,
      name: "Basecamp Pendakian Merbabu",
      category: "Pendakian",
      description: "Basecamp resmi pendakian Gunung Merbabu via Tarubatang",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.9,
      price: "Rp 25.000",
    },
    {
      id: 3,
      name: "Camping Ground Sunrise",
      category: "Camping",
      description: "Area camping dengan view sunrise terbaik",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.7,
      price: "Rp 15.000/malam",
    },
  ],
  umkm: [
    {
      id: 1,
      name: "Keripik Singkong Bu Sari",
      category: "Makanan",
      description: "Keripik singkong renyah dengan berbagai rasa",
      image: "/placeholder.svg?height=60&width=60",
      price: "Rp 15.000/bungkus",
      contact: "0812-3456-7890",
    },
    {
      id: 2,
      name: "Homestay Merbabu View",
      category: "Homestay",
      description: "4 kamar, AC, WiFi, view gunung",
      image: "/placeholder.svg?height=60&width=60",
      price: "Rp 150.000/malam",
      contact: "0813-4567-8901",
    },
    {
      id: 3,
      name: "Kopi Merbabu Asli",
      category: "Minuman",
      description: "Kopi arabika premium dari lereng Merbabu",
      image: "/placeholder.svg?height=60&width=60",
      price: "Rp 45.000/250gr",
      contact: "0814-5678-9012",
    },
  ],
  events: [
    {
      id: 1,
      name: "Merbabu De Trail",
      date: "2024-08-15",
      location: "Basecamp Tarubatang",
      description: "Event trail running tahunan dengan rute menantang di sekitar Gunung Merbabu",
      category: "Olahraga",
    },
    {
      id: 2,
      name: "Festival Panen Raya",
      date: "2024-04-20",
      location: "Balai Desa",
      description: "Perayaan hasil panen dengan pertunjukan seni budaya dan kuliner tradisional",
      category: "Budaya",
    },
    {
      id: 3,
      name: "Gotong Royong Desa",
      date: "2024-07-10",
      location: "Seluruh Desa",
      description: "Kegiatan bersih-bersih dan perawatan fasilitas wisata bersama masyarakat",
      category: "Sosial",
    },
  ],
  gallery: [
    {
      id: 1,
      title: "Sunrise di Merbabu",
      image: "/placeholder.svg?height=200&width=200",
      category: "Pemandangan",
    },
    {
      id: 2,
      title: "Air Terjun Sekumpul",
      image: "/placeholder.svg?height=200&width=200",
      category: "Wisata Alam",
    },
    {
      id: 3,
      title: "Hutan Pinus",
      image: "/placeholder.svg?height=200&width=200",
      category: "Spot Foto",
    },
    {
      id: 4,
      title: "Camping Ground",
      image: "/placeholder.svg?height=200&width=200",
      category: "Camping",
    },
    {
      id: 5,
      title: "Festival Budaya",
      image: "/placeholder.svg?height=200&width=200",
      category: "Event",
    },
    {
      id: 6,
      title: "UMKM Lokal",
      image: "/placeholder.svg?height=200&width=200",
      category: "UMKM",
    },
  ],
  contact: {
    village: "(0276) 123-4567",
    tourism: "0812-3456-7890",
    emergency: "0811-2233-4455",
    email: "info@tarubatang.desa.id",
    address: "Desa Tarubatang, Kecamatan Selo, Kabupaten Boyolali, Jawa Tengah 57365",
  },
}

export async function GET() {
  return NextResponse.json(websiteContent)
}

export async function POST(request: NextRequest) {
  try {
    const updatedContent = await request.json()
    websiteContent = updatedContent
    return NextResponse.json({ message: "Content updated successfully" })
  } catch (error) {
    return NextResponse.json({ message: "Failed to update content" }, { status: 500 })
  }
}
