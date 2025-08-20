import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Mountain,
  Calendar,
  Award,
  Target,
  Trophy,
  Home,
  Map,
  Building2,
  User,
  UserCheck,
  Shield,
  BookOpen,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const dukuhList = [
    "Dukuh Genting",
    "Dukuh Kalitengah",
    "Dukuh Surodadi A",
    "Dukuh Surodadi B",
    "Dukuh Tegalrejo",
    "Dukuh Tompak",
    "Dukuh Ngemplak",
    "Dukuh Monce",
    "Dukuh Tarusari",
    "Dukuh Tarubatang Kulon",
    "Dukuh Tarubatang Wetan",
    "Dukuh Sanggar",
    "Dukuh Gajihan",
    "Dukuh Rejosari",
  ];

  const achievements = [
    {
      year: "2023",
      title: "Juara 1 Desa Wisata Terbaik Jawa Tengah",
      category: "Pariwisata",
    },
    { year: "2022", title: "Desa Mandiri Energi", category: "Lingkungan" },
    {
      year: "2022",
      title: "Juara 2 Lomba Desa Sehat Nasional",
      category: "Kesehatan",
    },
    { year: "2021", title: "Desa Digital Terpadu", category: "Teknologi" },
    {
      year: "2021",
      title: "Juara 1 Pengelolaan Dana Desa Terbaik",
      category: "Pemerintahan",
    },
    { year: "2020", title: "Kampung KB Berprestasi", category: "Kependudukan" },
  ];

  const perangkatDesa = [
    {
      jabatan: "Kepala Desa",
      nama: "Sabarno",
      icon: Shield,
      color: "bg-red-500",
    },
    {
      jabatan: "Sekretaris Desa",
      nama: "Tamami",
      icon: UserCheck,
      color: "bg-blue-500",
    },
    {
      jabatan: "Kepala Seksi Pemerintahan",
      nama: "Mardiyono",
      icon: Building2,
      color: "bg-green-500",
    },
    {
      jabatan: "Kepala Seksi Pelayanan dan Kesejahteraan",
      nama: "Sri Hartatik",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      jabatan: "Kepala Urusan Keuangan",
      nama: "Sutarno",
      icon: Briefcase,
      color: "bg-orange-500",
    },
    {
      jabatan: "Kepala Urusan Umum dan Perencanaan",
      nama: "Takim",
      icon: BookOpen,
      color: "bg-teal-500",
    },
    {
      jabatan: "Kepala Dusun 1 (Wilayah Utara)",
      nama: "Sumarlan",
      icon: User,
      color: "bg-indigo-500",
    },
    {
      jabatan: "Kepala Dusun 2 (Wilayah Selatan)",
      nama: "Mantep, L",
      icon: User,
      color: "bg-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[300px] sm:h-[400px] lg:h-[500px] bg-gradient-to-r from-green-800 to-green-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/merbabuu.png"
          alt="Panorama Desa Tarubatang"
          fill
          className="object-cover"
          priority
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-4xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
              Profile Desa Tarubatang
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-green-100 max-w-2xl leading-relaxed">
              Mengenal lebih dekat sejarah, geografis, dan potensi Desa
              Tarubatang sebagai destinasi wisata unggulan di kaki Gunung
              Merbabu
            </p>
          </div>
        </div>
      </section>

      {/* About Desa Tarubatang */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800">
              Tentang Desa
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Tentang Desa Tarubatang
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-6 text-gray-600 text-sm sm:text-base">
                <p>
                  Desa Tarubatang adalah sebuah desa yang terletak di lereng
                  Gunung Merbabu, Kabupaten Boyolali, Jawa Tengah. Desa ini
                  dikenal sebagai salah satu basecamp utama pendakian Gunung
                  Merbabu dan telah berkembang menjadi destinasi wisata alam
                  yang populer.
                </p>
                <p>
                  Dengan ketinggian 1.200 meter di atas permukaan laut, Desa
                  Tarubatang menawarkan pemandangan alam yang menakjubkan, udara
                  yang sejuk, serta kekayaan budaya lokal yang masih terjaga.
                  Masyarakat desa yang ramah dan berbudaya tinggi menjadikan
                  pengalaman berkunjung semakin berkesan.
                </p>
                <p>
                  Desa ini memiliki potensi besar dalam pengembangan wisata
                  berkelanjutan, dengan dukungan infrastruktur yang terus
                  diperbaiki dan program-program inovatif yang melibatkan
                  seluruh masyarakat dalam industri pariwisata.
                </p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <Image
                src="/kantor-desa.jpg?height=400&width=500"
                alt="Pemandangan Desa Tarubatang"
                width={500}
                height={400}
                className="w-full h-[250px] sm:h-[300px] lg:h-[400px] object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-12 sm:py-16 lg:py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              Visi & Misi
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Visi dan Misi Desa Tarubatang
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-blue-600 text-lg sm:text-xl">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
                  <span>Visi Desa Tarubatang</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  "Mewujudkan sistem Pemerintahan yang efektif dan demokratis
                  serta terciptanya masyarakat yang aman, tentram, sejahtera,
                  dan membangun Desa bareng-bareng dengan masyarakat"
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-green-600 text-lg sm:text-xl">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
                  <span>Misi Desa Tarubatang</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Menyelenggarakan pemerintahan desa yang baik, untuk
                      pelayanan masyarakat yang tepat, cepat dan akurat
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Melaksanakan pembangunan infrastruktur desa, infrastruktur
                      pertanian, sarana pendidikan dan sarana perekonomian desa,
                      untuk meningkatkan perekonomian masyarakat
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Melaksanakan pembinaan kemasyarakatan untuk meningkatkan
                      ketaqwaan kepada Tuhan Yang Maha Esa, meningkatkan mutu
                      pendidikan formal dan non formal serta pengetahuan
                      masyarakat
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Melaksanakan pemberdayaan masyarakat melalui pengembangan
                      usaha kecil dan menengah, pertanian dan peternakan serta
                      menanggulangi kemiskinan
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Village History */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Badge className="mb-4 bg-amber-100 text-amber-800">
                Sejarah Desa
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 lg:mb-6">
                Sejarah Desa Tarubatang
              </h2>
              <div className="space-y-4 sm:space-y-6 text-gray-600 text-sm sm:text-base">
                <p>
                  Desa Tarubatang memiliki sejarah panjang yang dimulai pada
                  abad ke-18, ketika para pendatang dari Jawa mulai membuka
                  lahan di lereng Gunung Merbabu. Nama "Tarubatang" berasal dari
                  bahasa Jawa yang berarti "pohon besar", merujuk pada pohon
                  beringin raksasa yang menjadi landmark desa.
                </p>
                <p>
                  Pada masa kolonial Belanda, desa ini menjadi salah satu pusat
                  perkebunan kopi dan tembakau. Setelah kemerdekaan, masyarakat
                  mulai mengembangkan pertanian sayuran dan buah-buahan yang
                  cocok dengan iklim pegunungan.
                </p>
                <p>
                  Sejak tahun 2000-an, Desa Tarubatang mulai mengembangkan
                  potensi wisata alamnya, terutama sebagai basecamp pendakian
                  Gunung Merbabu dan destinasi wisata alam yang menawarkan
                  keindahan panorama pegunungan.
                </p>
                <p>
                  Transformasi besar terjadi pada tahun 2015 ketika desa ini
                  mulai menerapkan konsep desa wisata berbasis masyarakat, yang
                  kemudian berhasil meraih berbagai penghargaan tingkat
                  nasional.
                </p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <Image
                src="/view.jpg?height=400&width=500"
                alt="Sejarah Desa Tarubatang"
                width={500}
                height={400}
                className="w-full h-[250px] sm:h-[300px] lg:h-[400px] object-cover rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white p-3 sm:p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    1750
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Tahun Berdiri
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Geography */}
      <section className="py-12 sm:py-16 lg:py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800">
              Geografis
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Geografis Desa Tarubatang
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Desa Tarubatang terletak di lokasi strategis dengan kondisi
              geografis yang mendukung pengembangan wisata alam dan pertanian
              berkelanjutan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Ketinggian
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  1,200m
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  di atas permukaan laut
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <Mountain className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Luas Wilayah
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  380,4 Ha
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Bujur 110° 29'12"BT
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Lintang 07° 29'42"LS
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Jumlah Penduduk
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  2,822
                </p>
                <p className="text-xs sm:text-sm text-gray-600">jiwa (2024)</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Suhu Rata-rata
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  15-28°C
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  sepanjang tahun
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <MapPin className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                  <span>Batas Wilayah</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600 font-medium">Utara:</span>
                    <span className="font-medium">Desa Senden</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600 font-medium">Selatan:</span>
                    <span className="font-medium">Desa Selo</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600 font-medium">Timur:</span>
                    <span className="font-medium">
                      Desa Cepogo, Kecamatan Cepogo
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-gray-600 font-medium">Barat:</span>
                    <span className="font-medium">
                      Kawasan Hutan Taman Nasional Gunung Merbabu
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Mountain className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                  <span>Topografi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dataran Tinggi:</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Perbukitan:</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lembah:</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kemiringan:</span>
                    <span className="font-medium">15-45°</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Monografi Desa */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-800">
              Monografi
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Monografi Desa Tarubatang
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Data lengkap kependudukan dan sosial ekonomi masyarakat Desa
              Tarubatang
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                  1,417
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">Laki-laki</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2">
                  1,405
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">Perempuan</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                  687
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Kepala Keluarga
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">
                  3.7
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Rata-rata per KK
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">
                  Mata Pencaharian
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">Petani</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        45%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">Pedagang/UMKM</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        25%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">
                      Jasa Pariwisata
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: "20%" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        20%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">Lainnya</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: "10%" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        10%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">
                  Tingkat Pendidikan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">SD/Sederajat</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: "35%" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        35%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">SMP/Sederajat</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: "30%" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        30%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">SMA/Sederajat</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        25%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">
                      Perguruan Tinggi
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "10%" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        10%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prestasi Desa */}
      {/* <section className="py-12 sm:py-16 lg:py-20 bg-yellow-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-yellow-100 text-yellow-800">
              Prestasi
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Prestasi Desa Tarubatang
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Berbagai penghargaan dan prestasi yang telah diraih Desa
              Tarubatang dalam pembangunan dan pengembangan desa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-yellow-500 text-white p-2 rounded-full flex-shrink-0">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge className="mb-2 text-xs" variant="secondary">
                        {achievement.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base leading-tight">
                        {achievement.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Tahun {achievement.year}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Profile Dukuh */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-indigo-100 text-indigo-800">
              Wilayah
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Profile Dukuh-dukuh Tarubatang
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Desa Tarubatang terdiri dari 14 dukuh yang tersebar di seluruh
              wilayah desa, masing-masing dengan karakteristik dan keunikan
              tersendiri
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {dukuhList.map((dukuh, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Home className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-800 text-xs sm:text-sm leading-tight">
                    {dukuh}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Peta Desa */}
      <section className="py-12 sm:py-16 lg:py-20 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">Peta Desa</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Peta Desa Tarubatang
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Peta lengkap wilayah Desa Tarubatang yang menunjukkan batas-batas
              dukuh, infrastruktur, dan potensi wisata
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="relative mt-2 mb-4 sm:mb-6">
                  <Image
                    src="/batas-wilayah.png"
                    alt="Batas Wilayah Tarubatang"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="relative mb-4 sm:mb-6">
                  <Image
                    src="/peta-tarubatang-1.png"
                    alt="Peta Desa Tarubatang"
                    width={1000}
                    height={700}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Map className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium">Luas Total</p>
                    <p className="text-gray-600">380,4 Hektar</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-2 text-green-600" />
                    <p className="font-medium">14 Dukuh</p>
                    <p className="text-gray-600">Wilayah Administrasi</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Mountain className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-2 text-purple-600" />
                    <p className="font-medium">Ketinggian</p>
                    <p className="text-gray-600">1.200 mdpl</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Struktur Organisasi */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-red-100 text-red-800">Pemerintahan</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Struktur Organisasi Pemerintahan Desa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Struktur organisasi pemerintahan Desa Tarubatang yang dipimpin
              oleh Kepala Desa beserta perangkat desa
            </p>
          </div>

          {/* Struktur Organisasi Chart */}
          <div className="max-w-6xl mx-auto mb-8 sm:mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 rounded-xl">
              <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                {/* Kepala Desa */}
                <div className="text-center">
                  <div className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                    <h3 className="font-bold text-sm sm:text-base">
                      KEPALA DESA
                    </h3>
                    <p className="text-xs sm:text-sm">Sabarno</p>
                  </div>
                </div>

                {/* Sekretaris Desa */}
                <div className="text-center">
                  <div className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg">
                    <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                    <h3 className="font-bold text-sm sm:text-base">
                      SEKRETARIS DESA
                    </h3>
                    <p className="text-xs sm:text-sm">Tamami</p>
                  </div>
                </div>

                {/* Kepala Seksi dan Kepala Urusan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                  <div className="text-center">
                    <div className="bg-green-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2" />
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Kepala Seksi
                      </h4>
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Pemerintahan
                      </h4>
                      <p className="text-xs">Mardiyono</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2" />
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Kepala Seksi
                      </h4>
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Pelayanan & Kesejahteraan
                      </h4>
                      <p className="text-xs">Sri Hartatik</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2" />
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Kepala Urusan
                      </h4>
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Keuangan
                      </h4>
                      <p className="text-xs">Sutarno</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-teal-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2" />
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Kepala Urusan
                      </h4>
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Umum & Perencanaan
                      </h4>
                      <p className="text-xs">Takim</p>
                    </div>
                  </div>
                </div>

                {/* Kepala Dusun */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
                  <div className="text-center">
                    <div className="bg-indigo-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2" />
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Kepala Dusun 1
                      </h4>
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        (Wilayah Utara)
                      </h4>
                      <p className="text-xs">Sumarlan</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-pink-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2" />
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        Kepala Dusun 2
                      </h4>
                      <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                        (Wilayah Selatan)
                      </h4>
                      <p className="text-xs">Mantep, L</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Perangkat Desa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {perangkatDesa.map((perangkat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div
                    className={`${perangkat.color} text-white p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 flex items-center justify-center`}
                  >
                    <perangkat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base leading-tight">
                    {perangkat.jabatan}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {perangkat.nama}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-12 sm:py-16 lg:py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800">Kontak</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Hubungi Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Informasi kontak dan alamat lengkap Pemerintah Desa Tarubatang
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                      Kantor Desa Tarubatang
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            Alamat
                          </p>
                          <p className="text-gray-600 text-sm sm:text-base">
                            Dusun II, Tarubatang, Kec. Selo, Kabupaten Boyolali,
                            Jawa Tengah
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            Kode Pos
                          </p>
                          <p className="text-gray-600 text-sm sm:text-base">
                            57363
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            Jam Pelayanan
                          </p>
                          <p className="text-gray-600 text-sm sm:text-base">
                            Senin - Jumat: 08:00 - 14:00 WIB
                          </p>
                          <p className="text-gray-600 text-sm sm:text-base">
                            Sabtu: 08:00 - 12:00 WIB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                      Media Sosial
                    </h3>
                    <div className="space-y-3">
                      <Link
                        href="#"
                        className="flex items-center space-x-3 text-gray-600 hover:text-green-600 transition-colors group"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition-colors">
                          <span className="text-white text-xs sm:text-sm font-bold">
                            f
                          </span>
                        </div>
                        <span className="text-sm sm:text-base">
                          Facebook: Desa Tarubatang
                        </span>
                      </Link>
                      <Link
                        href="https://www.instagram.com/desa_tarubatang/"
                        className="flex items-center space-x-3 text-gray-600 hover:text-green-600 transition-colors group"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-pink-700 transition-colors">
                          <span className="text-white text-xs sm:text-sm font-bold">
                            @
                          </span>
                        </div>
                        <span className="text-sm sm:text-base">
                          Instagram: @desa_tarubatang
                        </span>
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center space-x-3 text-gray-600 hover:text-green-600 transition-colors group"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors">
                          <span className="text-white text-xs sm:text-sm font-bold">
                            ▶
                          </span>
                        </div>
                        <span className="text-sm sm:text-base">
                          YouTube: Desa Tarubatang Official
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
