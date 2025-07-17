const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const prisma = new PrismaClient()

async function main() {
  // Remove all data
  await prisma.destination.deleteMany()
  await prisma.uMKM.deleteMany()
  await prisma.event.deleteMany()
  await prisma.gallery.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.analytics.deleteMany()
  await prisma.user.deleteMany()

  const adminPassword = await bcrypt.hash("admin123", 10)
  const userPassword = await bcrypt.hash("user123", 10)

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: "Admin Tarubatang",
      email: "admin@tarubatang.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      phone: "081234567890",
      address: "Desa Tarubatang, Boyolali",
    },
  })

  // Create Demo User
  const user = await prisma.user.create({
    data: {
      name: "User Demo",
      email: "user@tarubatang.com",
      password: userPassword,
      role: "USER",
      status: "ACTIVE",
      phone: "081234567891",
      address: "Boyolali, Jawa Tengah",
    },
  })

  // Destinations with placeholder images (will be replaced with Supabase URLs)
  await prisma.destination.createMany({
    data: [
      {
        name: "Air Terjun Sekumpul",
        slug: "air-terjun-sekumpul",
        category: "Wisata Alam",
        description: "Air terjun setinggi 25 meter dengan kolam alami yang jernih. Destinasi wisata yang menawarkan kesegaran air pegunungan dengan pemandangan yang menakjubkan.",
        content: "Air Terjun Sekumpul merupakan salah satu destinasi wisata alam yang paling populer di Desa Tarubatang. Dengan ketinggian 25 meter, air terjun ini memiliki kolam alami yang jernih dan segar. Pengunjung dapat berenang atau sekadar menikmati keindahan alam sambil berfoto. Lokasi ini sangat cocok untuk keluarga dan pecinta alam yang ingin merasakan kesegaran air pegunungan.",
        price: "Rp 10.000",
        facilities: ["Kolam Renang Alami", "Area Piknik", "Spot Foto Instagramable", "Warung Makan", "Toilet", "Area Parkir"],
        location: "Dusun Sekumpul, Desa Tarubatang",
        latitude: -7.4167,
        longitude: 110.4833,
        images: [], // Will be populated with Supabase URLs by admin
        rating: 4.8,
        totalReviews: 42,
        isActive: true,
      },
      {
        name: "Basecamp Pendakian Merbabu",
        slug: "basecamp-pendakian-merbabu",
        category: "Pendakian",
        description: "Basecamp resmi pendakian Gunung Merbabu via Tarubatang dengan fasilitas lengkap dan pemandu berpengalaman.",
        content: "Basecamp Pendakian Merbabu via Tarubatang adalah titik awal yang ideal untuk mendaki Gunung Merbabu. Basecamp ini menyediakan fasilitas lengkap seperti pemandu profesional, penyewaan alat pendakian, dan informasi cuaca terkini. Jalur pendakian melalui Tarubatang dikenal lebih mudah dan aman, cocok untuk pendaki pemula maupun berpengalaman. Pemandangan savana yang indah menanti di puncak.",
        price: "Rp 25.000",
        facilities: ["Pemandu Profesional", "Penyewaan Alat Pendakian", "Warung Makan", "Area Parkir", "Toilet", "Mushola", "Pos Kesehatan"],
        location: "Basecamp Tarubatang",
        latitude: -7.415,
        longitude: 110.485,
        images: [], // Will be populated with Supabase URLs by admin
        rating: 4.9,
        totalReviews: 78,
        isActive: true,
      },
      {
        name: "Camping Ground Sunrise",
        slug: "camping-ground-sunrise",
        category: "Camping",
        description: "Area camping dengan view sunrise terbaik di lereng Gunung Merbabu. Pengalaman menginap di alam terbuka yang tak terlupakan.",
        content: "Camping Ground Sunrise menawarkan pengalaman berkemah yang luar biasa dengan pemandangan sunrise yang spektakuler. Terletak di lereng Gunung Merbabu, tempat ini menjadi favorit para pecinta alam untuk menikmati malam berbintang dan menyaksikan matahari terbit. Fasilitas yang tersedia sangat lengkap untuk kenyamanan pengunjung.",
        price: "Rp 15.000/malam",
        facilities: ["View Sunrise Terbaik", "Toilet & MCK", "Warung Makan", "Area Api Unggun", "Sewa Tenda", "Gazebo", "Area Parkir"],
        location: "Lereng Merbabu, Desa Tarubatang",
        latitude: -7.418,
        longitude: 110.482,
        images: [], // Will be populated with Supabase URLs by admin
        rating: 4.7,
        totalReviews: 56,
        isActive: true,
      },
      {
        name: "Hutan Pinus Tarubatang",
        slug: "hutan-pinus-tarubatang",
        category: "Wisata Alam",
        description: "Hutan pinus yang asri dengan udara segar dan spot foto yang Instagramable. Cocok untuk relaksasi dan healing.",
        content: "Hutan Pinus Tarubatang adalah destinasi wisata yang perfect untuk healing dan relaksasi. Dikelilingi oleh pohon pinus yang tinggi dan rindang, tempat ini menawarkan udara yang segar dan sejuk. Banyak spot foto yang menarik dengan latar belakang pohon pinus yang estetik. Tempat ini juga cocok untuk aktivitas outbound dan gathering.",
        price: "Rp 5.000",
        facilities: ["Spot Foto Instagramable", "Hammock Area", "Gazebo", "Jalur Tracking", "Area Parkir", "Warung Kopi"],
        location: "Hutan Pinus Tarubatang",
        latitude: -7.420,
        longitude: 110.480,
        images: [], // Will be populated with Supabase URLs by admin
        rating: 4.6,
        totalReviews: 34,
        isActive: true,
      },
    ],
  })

  // UMKM Products
  await prisma.uMKM.createMany({
    data: [
      {
        name: "Keripik Singkong Bu Sari",
        category: "Makanan",
        description: "Keripik singkong renyah dengan berbagai rasa: original, pedas, balado, dan keju. Dibuat dari singkong pilihan dengan resep turun temurun.",
        price: "Rp 15.000/bungkus",
        stock: 50,
        images: [], // Will be populated with Supabase URLs by admin
        contact: "0812-3456-7890",
        location: "Dusun Sekumpul, Desa Tarubatang",
        isActive: true,
        userId: user.id,
      },
      {
        name: "Basecamp Merbabu View",
        category: "Basecamp",
        description: "Basecamp nyaman dengan 4 kamar, AC, WiFi, dan view langsung ke Gunung Merbabu. Cocok untuk keluarga dan rombongan.",
        price: "Rp 150.000/malam",
        stock: 4,
        images: [], // Will be populated with Supabase URLs by admin
        contact: "0813-4567-8901",
        location: "Desa Tarubatang, dekat Basecamp",
        isActive: true,
        userId: user.id,
      },
      {
        name: "Kopi Merbabu Asli",
        category: "Minuman",
        description: "Kopi arabika premium dari lereng Gunung Merbabu. Proses roasting yang sempurna menghasilkan cita rasa yang khas dan nikmat.",
        price: "Rp 45.000/250gr",
        stock: 30,
        images: [], // Will be populated with Supabase URLs by admin
        contact: "0814-5678-9012",
        location: "Lereng Merbabu, Desa Tarubatang",
        isActive: true,
        userId: user.id,
      },
      {
        name: "Madu Hutan Merbabu",
        category: "Makanan",
        description: "Madu murni dari hutan lereng Gunung Merbabu. Kaya akan vitamin dan mineral alami yang baik untuk kesehatan.",
        price: "Rp 65.000/botol",
        stock: 20,
        images: [], // Will be populated with Supabase URLs by admin
        contact: "0815-6789-0123",
        location: "Hutan Merbabu, Desa Tarubatang",
        isActive: true,
        userId: user.id,
      },
      {
        name: "Paket Camping Equipment",
        category: "Perlengkapan",
        description: "Paket lengkap perlengkapan camping: tenda, sleeping bag, matras, dan peralatan masak. Cocok untuk pendaki dan camper.",
        price: "Rp 100.000/paket/hari",
        stock: 10,
        images: [], // Will be populated with Supabase URLs by admin
        contact: "0816-7890-1234",
        location: "Basecamp Tarubatang",
        isActive: true,
        userId: user.id,
      },
    ],
  })

  // Events
  await prisma.event.createMany({
    data: [
      {
        name: "Merbabu De Trail 2024",
        slug: "merbabu-de-trail-2024",
        description: "Event trail running tahunan dengan rute menantang di sekitar Gunung Merbabu. Terdapat 3 kategori: 5K, 10K, dan 21K.",
        content: "Merbabu De Trail adalah event trail running tahunan yang paling ditunggu-tunggu di Boyolali. Event ini menawarkan 3 kategori jarak: 5K untuk pemula, 10K untuk intermediate, dan 21K untuk advanced runner. Rute yang menantang dengan pemandangan alam yang spektakuler menjadi daya tarik utama event ini. Peserta akan mendapat jersey, medali, dan sertifikat finisher.",
        category: "Olahraga",
        date: new Date("2024-08-15T06:00:00"),
        endDate: new Date("2024-08-15T12:00:00"),
        location: "Basecamp Tarubatang",
        maxParticipants: 500,
        currentParticipants: 87,
        price: "Rp 150.000",
        images: [], // Will be populated with Supabase URLs by admin
        isActive: true,
      },
      {
        name: "Festival Panen Raya 2024",
        slug: "festival-panen-raya-2024",
        description: "Perayaan hasil panen dengan pertunjukan seni budaya, kuliner tradisional, dan pameran produk lokal.",
        content: "Festival Panen Raya adalah perayaan tradisional yang diadakan setiap tahun untuk mensyukuri hasil panen yang melimpah. Festival ini menampilkan berbagai pertunjukan seni budaya lokal, kuliner tradisional khas Boyolali, dan pameran produk UMKM. Acara ini menjadi ajang silaturahmi dan promosi potensi desa yang menarik wisatawan dari berbagai daerah.",
        category: "Budaya",
        date: new Date("2024-09-20T08:00:00"),
        endDate: new Date("2024-09-22T18:00:00"),
        location: "Balai Desa Tarubatang",
        maxParticipants: 1000,
        currentParticipants: 156,
        price: "Gratis",
        images: [], // Will be populated with Supabase URLs by admin
        isActive: true,
      },
      {
        name: "Gotong Royong Desa Bersih",
        slug: "gotong-royong-desa-bersih",
        description: "Kegiatan bersih-bersih dan perawatan fasilitas wisata bersama masyarakat. Mari berpartisipasi untuk menjaga kelestarian alam.",
        content: "Gotong Royong Desa Bersih adalah kegiatan rutin yang melibatkan seluruh masyarakat dan pengunjung untuk menjaga kebersihan dan kelestarian lingkungan wisata. Kegiatan ini meliputi pembersihan area wisata, perawatan fasilitas, dan penanaman pohon. Peserta akan mendapat konsumsi gratis dan sertifikat volunteer. Mari bersama-sama menjaga keindahan alam Tarubatang.",
        category: "Sosial",
        date: new Date("2024-07-28T07:00:00"),
        endDate: new Date("2024-07-28T12:00:00"),
        location: "Seluruh Area Wisata Desa Tarubatang",
        maxParticipants: 200,
        currentParticipants: 45,
        price: "Gratis",
        images: [], // Will be populated with Supabase URLs by admin
        isActive: true,
      },
      {
        name: "Workshop Fotografi Alam",
        slug: "workshop-fotografi-alam",
        description: "Workshop fotografi dengan tema alam dan landscape. Dipandu oleh fotografer profesional dengan lokasi shooting yang menakjubkan.",
        content: "Workshop Fotografi Alam adalah kegiatan edukasi yang mengajarkan teknik fotografi landscape dan nature photography. Dipandu oleh fotografer profesional berpengalaman, peserta akan belajar teknik komposisi, pengaturan kamera, dan editing dasar. Lokasi shooting meliputi Air Terjun Sekumpul, Hutan Pinus, dan sunrise di Camping Ground. Peserta akan mendapat sertifikat dan softcopy hasil karya terbaik.",
        category: "Edukasi",
        date: new Date("2024-08-10T08:00:00"),
        endDate: new Date("2024-08-11T16:00:00"),
        location: "Berbagai lokasi wisata di Tarubatang",
        maxParticipants: 25,
        currentParticipants: 8,
        price: "Rp 350.000",
        images: [], // Will be populated with Supabase URLs by admin
        isActive: true,
      },
    ],
  })

  // Gallery
  await prisma.gallery.createMany({
    data: [
      {
        title: "Sunrise di Puncak Merbabu",
        description: "Pemandangan sunrise yang spektakuler dari puncak Gunung Merbabu yang memukau para pendaki.",
        images: [], // Will be populated with Supabase URLs by admin
        category: "Pemandangan",
        isActive: true,
      },
      {
        title: "Keindahan Air Terjun Sekumpul",
        description: "Air terjun setinggi 25 meter dengan kolam alami yang jernih dan segar.",
        images: [], // Will be populated with Supabase URLs by admin
        category: "Wisata Alam",
        isActive: true,
      },
      {
        title: "Spot Foto di Hutan Pinus",
        description: "Berbagai spot foto menarik di tengah hutan pinus yang asri dan sejuk.",
        images: [], // Will be populated with Supabase URLs by admin
        category: "Spot Foto",
        isActive: true,
      },
      {
        title: "Camping Ground Malam Hari",
        description: "Suasana camping ground di malam hari dengan api unggun dan bintang yang indah.",
        images: [], // Will be populated with Supabase URLs by admin
        category: "Camping",
        isActive: true,
      },
      {
        title: "Festival Budaya Lokal",
        description: "Pertunjukan seni budaya tradisional dalam Festival Panen Raya tahunan.",
        images: [], // Will be populated with Supabase URLs by admin
        category: "Event",
        isActive: true,
      },
      {
        title: "Produk UMKM Unggulan",
        description: "Berbagai produk UMKM lokal yang menjadi oleh-oleh khas Tarubatang.",
        images: [], // Will be populated with Supabase URLs by admin
        category: "UMKM",
        isActive: true,
      },
      {
        title: "Aktivitas Pendakian",
        description: "Dokumentasi aktivitas pendakian Gunung Merbabu via jalur Tarubatang.",
        images: [], // Will be populated with Supabase URLs by admin
        category: "Pendakian",
        isActive: true,
      },
      {
        title: "Kuliner Tradisional",
        description: "Aneka kuliner tradisional yang tersedia di area wisata Tarubatang.",
        images: [], // Will be populated with Supabase URLs by admin
        category: "Kuliner",
        isActive: true,
      },
    ],
  })

  // Sample Submissions
  await prisma.submission.createMany({
    data: [
      {
        name: "Budi Santoso",
        email: "budi@email.com",
        message: "Terima kasih atas pengalaman camping yang luar biasa. Pemandangan sunrise sangat memukau!",
        type: "GUESTBOOK",
        status: "PENDING",
        userId: user.id,
      },
      {
        name: "Siti Nurhaliza",
        email: "siti@email.com",
        message: "Saya tertarik untuk menjadi volunteer dalam kegiatan gotong royong desa. Bagaimana caranya?",
        type: "VOLUNTEER",
        status: "PENDING",
      },
      {
        name: "Ahmad Fauzi",
        email: "ahmad@email.com",
        message: "Saya ingin membuka usaha warung makan di area wisata. Mohon informasi prosedurnya.",
        type: "BUSINESS",
        status: "PENDING",
      },
    ],
  })

  console.log("✅ Seeding completed successfully!")
  console.log("👤 Admin user created - email: admin@tarubatang.com, password: admin123")
  console.log("👤 Demo user created - email: user@tarubatang.com, password: user123")
  console.log("📊 Created 4 destinations, 5 UMKM products, 4 events, 8 gallery items, and 3 submissions")
  console.log("🖼️ All images fields are empty and ready for Supabase uploads by admin")
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })