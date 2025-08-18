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
  Globe,
  Navigation,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    type: "INQUIRY", // Set default type
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.push("Nama harus diisi minimal 2 karakter");
    }

    if (!formData.email.trim()) {
      errors.push("Email harus diisi");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Format email tidak valid");
    }

    if (!formData.subject.trim()) {
      errors.push("Subjek harus diisi");
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.push("Pesan harus diisi minimal 10 karakter");
    }

    if (formData.phone && formData.phone.length > 20) {
      errors.push("Nomor telepon terlalu panjang");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset status
    setSubmitStatus({ type: null, message: "" });

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setSubmitStatus({
        type: "error",
        message: errors.join(". "),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: "INQUIRY", // Set type sebagai INQUIRY untuk kontak
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: "success",
          message:
            result.message ||
            "Pesan berhasil dikirim! Terima kasih, kami akan merespons dalam 1-2 hari kerja.",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          type: "INQUIRY",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: result.message || "Terjadi kesalahan. Silakan coba lagi.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({
        type: "error",
        message:
          "Terjadi kesalahan jaringan. Silakan periksa koneksi dan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Village center coordinates (Tarubatang, Selo, Boyolali)
  const VILLAGE_CENTER = {
    lat: -7.491810021292882,
    lng: 110.46092439527409,
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
            <Badge className="mb-4 bg-green-100 text-green-800">
              Informasi Kontak
            </Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Cara Menghubungi Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berikut adalah berbagai cara untuk menghubungi Pemerintah Desa
              Tarubatang dan tim pariwisata
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Alamat</h3>
                <p className="text-gray-600 text-sm">
                  Jl. Raya Tarubatang No. 123
                  <br />
                  Desa Tarubatang, Kecamatan Selo
                  <br />
                  Kabupaten Boyolali, Jawa Tengah
                  <br />
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
                  <span className="block font-medium">(0838)-3666-6262</span>
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
              <Badge className="mb-4 bg-blue-100 text-blue-800">
                Kirim Pesan
              </Badge>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Hubungi Kami
              </h2>

              {/* Status Message */}
              {submitStatus.type && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                    submitStatus.type === "success"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {submitStatus.type === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        submitStatus.type === "success"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {submitStatus.type === "success" ? "Berhasil!" : "Gagal!"}
                    </p>
                    <p
                      className={`text-sm ${
                        submitStatus.type === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {submitStatus.message}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama lengkap"
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="nama@email.com"
                      className="mt-1"
                      disabled={isSubmitting}
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
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">
                      Subjek <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Subjek pesan"
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">
                    Pesan <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tulis pesan Anda di sini... (minimal 10 karakter)"
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/2000 karakter
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Kirim Pesan
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  <span className="text-red-500">*</span> Field wajib diisi
                </p>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-800">
                Lokasi
              </Badge>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Temukan Kami
              </h2>

              {/* Google Maps Embed */}
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg mb-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31646.07417511448!2d110.46092439527409!3d-7.491810021292882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a651b39211b75%3A0x53aa0d3bee048fc!2sTarubatang%2C%20Kec.%20Selo%2C%20Kabupaten%20Boyolali%2C%20Jawa%20Tengah!5e0!3m2!1sid!2sid!4v1753532416384!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Peta Lokasi Desa Tarubatang"
                />

                {/* Map Overlay Info */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Desa Tarubatang</span>
                  </div>
                </div>
              </div>

              {/* Map Action Buttons */}
              <div className="flex gap-2 mb-6">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
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
                  className="flex-1"
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
                  Petunjuk Arah
                </Button>
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
                  <div className="space-y-4 text-sm">
                    <div className="border-l-4 border-green-500 pl-4">
                      <span className="font-medium text-green-800">
                        Dari Boyolali:
                      </span>
                      <p className="text-gray-600 mt-1">
                        Naik bus menuju Selo, turun di pertigaan Tarubatang (30
                        menit)
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <span className="font-medium text-blue-800">
                        Dari Solo:
                      </span>
                      <p className="text-gray-600 mt-1">
                        Bus trans Joglosemar ke Boyolali, lanjut ke Selo (1.5
                        jam)
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <span className="font-medium text-purple-800">
                        Kendaraan Pribadi:
                      </span>
                      <p className="text-gray-600 mt-1">
                        Tersedia area parkir luas di kantor desa dan destinasi
                        wisata
                      </p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <span className="font-medium text-orange-800">
                        Koordinat GPS:
                      </span>
                      <p className="text-gray-600 mt-1">
                        -7.4918°S, 110.4609°E
                      </p>
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
            <Badge className="mb-4 bg-green-100 text-green-800">
              Media Sosial
            </Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ikuti Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dapatkan update terbaru tentang kegiatan dan event di Desa
              Tarubatang
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() =>
                window.open("https://facebook.com/desatarubatang", "_blank")
              }
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span>Facebook</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 hover:bg-pink-50 hover:border-pink-300 transition-colors"
              onClick={() =>
                window.open("https://instagram.com/desatarubatang", "_blank")
              }
            >
              <Instagram className="h-5 w-5 text-pink-600" />
              <span>Instagram</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 transition-colors"
              onClick={() =>
                window.open("https://youtube.com/desatarubatang", "_blank")
              }
            >
              <Youtube className="h-5 w-5 text-red-600" />
              <span>YouTube</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300 transition-colors"
              onClick={() =>
                window.open("https://tarubatang.desa.id", "_blank")
              }
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
            <Badge className="mb-4 bg-red-100 text-red-800">
              Kontak Darurat
            </Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Nomor Penting
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hubungi nomor berikut dalam situasi darurat selama berada di Desa
              Tarubatang
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Polsek Selo</h3>
                <p className="text-lg font-bold text-red-600">110</p>
                <p className="text-sm text-gray-600">(0276) 321-110</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Puskesmas Selo</h3>
                <p className="text-lg font-bold text-red-600">119</p>
                <p className="text-sm text-gray-600">(0276) 321-119</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Damkar Boyolali</h3>
                <p className="text-lg font-bold text-red-600">113</p>
                <p className="text-sm text-gray-600">(0276) 321-113</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
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
