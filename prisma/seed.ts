import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
const prisma = new PrismaClient()

async function main() {
  // Remove all data
  await prisma.destination.deleteMany()
  await prisma.uMKM.deleteMany()
  await prisma.event.deleteMany()
  await prisma.gallery.deleteMany()
  await prisma.user.deleteMany()

  const adminPassword = await bcrypt.hash("admin123", 10)
  const userPassword = await bcrypt.hash("user123", 10)
  // Destinations
  await prisma.destination.createMany({
    data: [
      {
        name: "Air Terjun Sekumpul",
        slug: "air-terjun-sekumpul",
        category: "Wisata Alam",
        description: "Air terjun setinggi 25 meter dengan kolam alami yang jernih",
        content: null,
        price: "Rp 10.000",
        facilities: ["Kolam Renang Alami", "Area Piknik", "Spot Foto Instagramable"],
        location: "Sekumpul",
        latitude: -7.4167,
        longitude: 110.4833,
        images: ["/placeholder.svg?height=200&width=300"],
        rating: 4.8,
        totalReviews: 0,
        isActive: true,
      },
      {
        name: "Basecamp Pendakian Merbabu",
        slug: "basecamp-pendakian-merbabu",
        category: "Pendakian",
        description: "Basecamp resmi pendakian Gunung Merbabu via Tarubatang",
        content: null,
        price: "Rp 25.000",
        facilities: ["Pemandu Profesional", "Penyewaan Alat", "Warung Makan", "Area Parkir"],
        location: "Basecamp",
        latitude: -7.415,
        longitude: 110.485,
        images: ["/placeholder.svg?height=200&width=300"],
        rating: 4.9,
        totalReviews: 0,
        isActive: true,
      },
      {
        name: "Camping Ground Sunrise",
        slug: "camping-ground-sunrise",
        category: "Camping",
        description: "Area camping dengan view sunrise terbaik",
        content: null,
        price: "Rp 15.000/malam",
        facilities: ["View Sunrise Terbaik", "Toilet & MCK", "Warung Makan", "Area Api Unggun"],
        location: "Camping Ground",
        latitude: -7.418,
        longitude: 110.482,
        images: ["/placeholder.svg?height=200&width=300"],
        rating: 4.7,
        totalReviews: 0,
        isActive: true,
      },
    ],
  })

  // Admin  
  let admin = await prisma.user.findFirst({ where: { email: "admin@tarubatang.com" } })
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: "Admin Tarubatang",
        email: "admin@tarubatang.com",
        password: adminPassword, // hash in production!
        role: "ADMIN",
        status: "ACTIVE",
      },
    })
  }

  // 1. Seed user dummy jika belum ada
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "User Demo",
        email: "user@tarubatang.com",
        password: userPassword, // hash di production!
        role: "USER",
        status: "ACTIVE",
      },
    })
  }
  const userId = user.id

//   // UMKM (dengan userId dummy, ganti dengan userId valid jika sudah ada user)
//   const user = await prisma.user.findFirst()
//   const userId = user?.id ?? "dummy-user-id"
  await prisma.uMKM.createMany({
    data: [
      {
        name: "Keripik Singkong Bu Sari",
        category: "Makanan",
        description: "Keripik singkong renyah dengan berbagai rasa",
        price: "Rp 15.000/bungkus",
        stock: null,
        images: ["/placeholder.svg?height=60&width=60"],
        contact: "0812-3456-7890",
        location: "",
        isActive: true,
        userId,
      },
      {
        name: "Homestay Merbabu View",
        category: "Homestay",
        description: "4 kamar, AC, WiFi, view gunung",
        price: "Rp 150.000/malam",
        stock: null,
        images: ["/placeholder.svg?height=60&width=60"],
        contact: "0813-4567-8901",
        location: "",
        isActive: true,
        userId,
      },
      {
        name: "Kopi Merbabu Asli",
        category: "Minuman",
        description: "Kopi arabika premium dari lereng Merbabu",
        price: "Rp 45.000/250gr",
        stock: null,
        images: ["/placeholder.svg?height=60&width=60"],
        contact: "0814-5678-9012",
        location: "",
        isActive: true,
        userId,
      },
    ],
  })

  // Events
  await prisma.event.createMany({
    data: [
      {
        name: "Merbabu De Trail",
        slug: "merbabu-de-trail",
        description: "Event trail running tahunan dengan rute menantang di sekitar Gunung Merbabu",
        content: null,
        category: "Olahraga",
        date: new Date("2024-08-15"),
        endDate: null,
        location: "Basecamp Tarubatang",
        maxParticipants: null,
        currentParticipants: 0,
        price: null,
        images: [],
        isActive: true,
      },
      {
        name: "Festival Panen Raya",
        slug: "festival-panen-raya",
        description: "Perayaan hasil panen dengan pertunjukan seni budaya dan kuliner tradisional",
        content: null,
        category: "Budaya",
        date: new Date("2024-04-20"),
        endDate: null,
        location: "Balai Desa",
        maxParticipants: null,
        currentParticipants: 0,
        price: null,
        images: [],
        isActive: true,
      },
      {
        name: "Gotong Royong Desa",
        slug: "gotong-royong-desa",
        description: "Kegiatan bersih-bersih dan perawatan fasilitas wisata bersama masyarakat",
        content: null,
        category: "Sosial",
        date: new Date("2024-07-10"),
        endDate: null,
        location: "Seluruh Desa",
        maxParticipants: null,
        currentParticipants: 0,
        price: null,
        images: [],
        isActive: true,
      },
    ],
  })

  // Gallery
  await prisma.gallery.createMany({
    data: [
      {
        title: "Sunrise di Merbabu",
        image: "/placeholder.svg?height=200&width=200",
        category: "Pemandangan",
        isActive: true,
      },
      {
        title: "Air Terjun Sekumpul",
        image: "/placeholder.svg?height=200&width=200",
        category: "Wisata Alam",
        isActive: true,
      },
      {
        title: "Hutan Pinus",
        image: "/placeholder.svg?height=200&width=200",
        category: "Spot Foto",
        isActive: true,
      },
      {
        title: "Camping Ground",
        image: "/placeholder.svg?height=200&width=200",
        category: "Camping",
        isActive: true,
      },
      {
        title: "Festival Budaya",
        image: "/placeholder.svg?height=200&width=200",
        category: "Event",
        isActive: true,
      },
      {
        title: "UMKM Lokal",
        image: "/placeholder.svg?height=200&width=200",
        category: "UMKM",
        isActive: true,
      },
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })