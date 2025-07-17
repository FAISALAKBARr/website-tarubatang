"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send,
  Facebook,
  Instagram,
  Youtube,
  Globe
} from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert("Pesan berhasil dikirim! Kami akan merespons dalam 1-2 hari kerja.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-green-800 to-green-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/merbabuu.png"
          alt="Kontak Desa Tarubatang"
          fill
          className="object-cover"
          priority 
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Hubungi Kami</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Siap membantu Anda merencanakan kunjungan ke Desa Tarubatang. 
              Jangan ragu untuk menghubungi kami kapan saja!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800">Informasi Kontak</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Cara Menghubungi Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berikut adalah berbagai cara untuk menghubungi Pemerintah Desa Tarubatang dan tim pariwisata
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Alamat</h3>
                <p className="text-gray-600 text-sm">
                  Jl. Raya Tarubatang No. 123<br />
                  Desa Tarubatang, Kecamatan Selo<br />
                  Kabupaten Boyolali, Jawa Tengah<br />
                  57365
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Telepon</h3>
                <p className="text-gray-600 text-sm space-y-1">
                  <span className="block">Kantor Desa:</span>
                  <span className="block font-medium">(0276) 123-456</span>
                  <span className="block">Info Wisata:</span>
                  <span className="block font-medium">0812-3456-7890</span>
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Mail className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-gray-600 text-sm space-y-1">
                  <span className="block">info@tarubatang.desa.id</span>
                  <span className="block">wisata@tarubatang.desa.id</span>
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Jam Layanan</h3>
                <p className="text-gray-600 text-sm">
                  <span className="block">Senin - Jumat:</span>
                  <span className="block font-medium">08:00 - 16:00 WIB</span>
                  <span className="block">Sabtu:</span>
                  <span className="block font-medium">08:00 - 12:00 WIB</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800">Kirim Pesan</Badge>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Hubungi Kami</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="08xx-xxxx-xxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subjek *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Subjek pesan"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Pesan *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tulis pesan Anda di sini..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Mengirim..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Kirim Pesan
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-800">Lokasi</Badge>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Temukan Kami</h2>
              
              {/* Map Placeholder */}
              <div className="relative h-64 bg-gray-200 rounded-lg mb-6 overflow-hidden">
                <Image
                  src="/placeholder.svg?height=256&width=500"
                  alt="Peta Desa Tarubatang"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    className="bg-white/90 hover:bg-white"
                    onClick={() => window.open('https://maps.google.com/?q=Desa+Tarubatang+Boyolali', '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Lihat di Google Maps
                  </Button>
                </div>
              </div>

              {/* Transportation Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                    Akses Transportasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Dari Boyolali:</span>
                      <p className="text-gray-600">Naik bus menuju Selo, turun di pertigaan Tarubatang (30 menit)</p>
                    </div>
                    <div>
                      <span className="font-medium">Dari Solo:</span>
                      <p className="text-gray-600">Bus trans Joglosemar ke Boyolali, lanjut ke Selo (1.5 jam)</p>
                    </div>
                    <div>
                      <span className="font-medium">Kendaraan Pribadi:</span>
                      <p className="text-gray-600">Tersedia area parkir luas di kantor desa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800">Media Sosial</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ikuti Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dapatkan update terbaru tentang kegiatan dan event di Desa Tarubatang
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => window.open('https://facebook.com/desatarubatang', '_blank')}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span>Facebook</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="flex items-center space-x-2 hover:bg-pink-50 hover:border-pink-300"
              onClick={() => window.open('https://instagram.com/desatarubatang', '_blank')}
            >
              <Instagram className="h-5 w-5 text-pink-600" />
              <span>Instagram</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300"
              onClick={() => window.open('https://youtube.com/desatarubatang', '_blank')}
            >
              <Youtube className="h-5 w-5 text-red-600" />
              <span>YouTube</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300"
              onClick={() => window.open('https://tarubatang.desa.id', '_blank')}
            >
              <Globe className="h-5 w-5 text-green-600" />
              <span>Website</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-red-100 text-red-800">Kontak Darurat</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nomor Penting</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hubungi nomor berikut dalam situasi darurat selama berada di Desa Tarubatang
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Polsek Selo</h3>
                <p className="text-lg font-bold text-red-600">110</p>
                <p className="text-sm text-gray-600">(0276) 321-110</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Puskesmas Selo</h3>
                <p className="text-lg font-bold text-red-600">119</p>
                <p className="text-sm text-gray-600">(0276) 321-119</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Damkar Boyolali</h3>
                <p className="text-lg font-bold text-red-600">113</p>
                <p className="text-sm text-gray-600">(0276) 321-113</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">SAR Merbabu</h3>
                <p className="text-lg font-bold text-red-600">115</p>
                <p className="text-sm text-gray-600">0812-2700-115</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}