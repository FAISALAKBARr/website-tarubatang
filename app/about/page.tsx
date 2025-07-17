import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Mountain, Calendar, Award, Target } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-green-800 to-green-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/merbabuu.png"
          alt="Panorama Desa Tarubatang"
          fill
          className="object-cover"
          priority
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Tentang Desa Tarubatang</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Mengenal lebih dekat sejarah, geografis, dan potensi Desa Tarubatang sebagai destinasi wisata unggulan di
              kaki Gunung Merbabu
            </p>
          </div>
        </div>
      </section>

      {/* Village History */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-800">Sejarah Desa</Badge>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Asal Usul Desa Tarubatang</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Desa Tarubatang memiliki sejarah panjang yang dimulai pada abad ke-18, ketika para pendatang dari Jawa
                  mulai membuka lahan di lereng Gunung Merbabu. Nama "Tarubatang" berasal dari bahasa Jawa yang berarti
                  "pohon besar", merujuk pada pohon beringin raksasa yang menjadi landmark desa.
                </p>
                <p>
                  Pada masa kolonial Belanda, desa ini menjadi salah satu pusat perkebunan kopi dan tembakau. Setelah
                  kemerdekaan, masyarakat mulai mengembangkan pertanian sayuran dan buah-buahan yang cocok dengan iklim
                  pegunungan.
                </p>
                <p>
                  Sejak tahun 2000-an, Desa Tarubatang mulai mengembangkan potensi wisata alamnya, terutama sebagai
                  basecamp pendakian Gunung Merbabu dan destinasi wisata alam yang menawarkan keindahan panorama
                  pegunungan.
                </p>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Sejarah Desa Tarubatang"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">1750</p>
                  <p className="text-sm text-gray-600">Tahun Berdiri</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Geography */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800">Geografis</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Kondisi Geografis</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Desa Tarubatang terletak di lokasi strategis dengan kondisi geografis yang mendukung pengembangan wisata
              alam dan pertanian berkelanjutan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Ketinggian</h3>
                <p className="text-2xl font-bold text-green-600">1,200m</p>
                <p className="text-sm text-gray-600">di atas permukaan laut</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Mountain className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Luas Wilayah</h3>
                <p className="text-2xl font-bold text-green-600">15.5</p>
                <p className="text-sm text-gray-600">kilometer persegi</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Jumlah Penduduk</h3>
                <p className="text-2xl font-bold text-green-600">2,547</p>
                <p className="text-sm text-gray-600">jiwa (2024)</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Suhu Rata-rata</h3>
                <p className="text-2xl font-bold text-green-600">18-25°C</p>
                <p className="text-sm text-gray-600">sepanjang tahun</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  Batas Wilayah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utara:</span>
                    <span className="font-medium">Desa Lencoh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selatan:</span>
                    <span className="font-medium">Desa Jeruksawit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timur:</span>
                    <span className="font-medium">Taman Nasional Gunung Merbabu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Barat:</span>
                    <span className="font-medium">Desa Samiran</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mountain className="h-5 w-5 mr-2 text-green-600" />
                  Topografi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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

      {/* Vision & Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">Visi & Misi</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Visi dan Misi Desa</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Target className="h-6 w-6 mr-2" />
                  Visi Desa Tarubatang
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed">
                  "Mewujudkan Desa Tarubatang sebagai destinasi wisata alam berkelanjutan yang berdaya saing, dengan
                  masyarakat yang sejahtera, mandiri, dan berbudaya lingkungan pada tahun 2030"
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <Award className="h-6 w-6 mr-2" />
                  Misi Desa Tarubatang
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Mengembangkan potensi wisata alam berbasis masyarakat
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Meningkatkan kesejahteraan masyarakat melalui UMKM dan basecamp
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Melestarikan lingkungan dan kearifan lokal
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Membangun infrastruktur pendukung pariwisata
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Meningkatkan kapasitas SDM dalam bidang pariwisata
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demographics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-800">Demografi</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Data Kependudukan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Profil demografis masyarakat Desa Tarubatang yang mendukung pengembangan pariwisata
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">1,289</div>
                <p className="text-gray-600">Laki-laki</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-pink-600 mb-2">1,258</div>
                <p className="text-gray-600">Perempuan</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">687</div>
                <p className="text-gray-600">Kepala Keluarga</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">3.7</div>
                <p className="text-gray-600">Rata-rata per KK</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Mata Pencaharian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Petani</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pedagang/UMKM</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Jasa Pariwisata</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Lainnya</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tingkat Pendidikan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>SD/Sederajat</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SMP/Sederajat</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SMA/Sederajat</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Perguruan Tinggi</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Jelajahi Keindahan Desa Tarubatang</h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Dengan pemahaman yang lebih dalam tentang desa kami, mari mulai petualangan wisata Anda di Tarubatang
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Lihat Destinasi Wisata
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
              Hubungi Kami
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
