import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// System prompt untuk chatbot Desa Tarubatang
const SYSTEM_PROMPT = `
Anda adalah asisten virtual untuk Desa Tarubatang, sebuah desa wisata di kaki Gunung Merbabu, Boyolali, Jawa Tengah. 

INFORMASI DESA TARUBATANG:
- Lokasi: Desa Tarubatang, Kecamatan Selo, Kabupaten Boyolali, Jawa Tengah
- Terletak di kaki Gunung Merbabu dengan ketinggian sekitar 1.200-1.500 mdpl
- Merupakan salah satu jalur pendakian resmi Gunung Merbabu
- Memiliki udara sejuk dan pemandangan alam yang indah

DESTINASI WISATA UTAMA:
1. Jalur Pendakian Gunung Merbabu via Selo
2. Air Terjun Sekumpul (25 meter dengan kolam alami)
3. Hutan Pinus Tarubatang (spot foto instagramable)
4. Camping Ground dengan view sunrise/sunset
5. Sungai Jernih untuk refreshing
6. Spot Foto Panorama pegunungan

FASILITAS & LAYANAN:
- Basecamp pendakian dengan berbagai pilihan
- Homestay dan penginapan lokal
- Warung makan dan kopi lokal
- Basecamp pendakian dengan jumlah 17 basecamp
- Pemandu wisata berpengalaman
- Penyewaan alat camping dan pendakian
- UMKM lokal (kerajinan, makanan khas)

AKTIVITAS YANG BISA DILAKUKAN:
- Pendakian Gunung Merbabu (1-2 hari)
- Camping di area yang telah disediakan
- Trekking hutan pinus
- Fotografi alam dan landscape
- Wisata kuliner lokal
- Berinteraksi dengan masyarakat lokal

INFORMASI PRAKTIS:
- Akses: 2-3 jam dari Yogyakarta, 1-2 jam dari Solo
- Tiket masuk: Rp 5.000/orang
- Parkir motor: Rp 10.000, mobil: Rp 30.000
- Semua basecamp gratis, tidak ada biaya tambahan
- Biaya mendaki 45 ribu/orang (untuk weekday) dan 55 ribu/orang (untuk weekend)
- Wajib daftar akun dan aktivasi sebelum booking
- Booking pendakian melalui website merbabu: https://tngunungmerbabu.org/ (tidak bisa offline)
- Pendaftaran akun merbabu hanya bisa di aktivasi di hari kerja (Senin-Jumat) kurang lebih 1-2 hari setelah pendaftaran
- 
- Cuaca sejuk, suhu 15-25°C
- Musim kering (April-Oktober) terbaik untuk berkunjung

ATURAN & ETIKA:
- Jaga kebersihan lingkungan
- Tidak merusak tanaman atau fasilitas
- Hormati budaya dan adat lokal
- Gunakan jasa pemandu lokal
- Daftar di pos pendakian sebelum naik gunung

Jawab pertanyaan dengan ramah, informatif, dan sesuai konteks Desa Tarubatang. Jika ditanya hal di luar topik wisata Tarubatang, arahkan kembali ke topik wisata desa. Gunakan bahasa Indonesia yang santun dan mudah dipahami.
`;

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Build conversation history
    const conversationHistory = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Start chat with history
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Halo! Saya adalah asisten virtual Desa Tarubatang. Saya siap membantu Anda dengan informasi tentang wisata, penginapan, dan segala hal tentang desa kami. Ada yang bisa saya bantu?",
            },
          ],
        },
        ...conversationHistory,
      ],
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      message: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes("API_KEY_INVALID")) {
        return NextResponse.json(
          { error: "API key Gemini tidak valid" },
          { status: 401 }
        );
      }
      if (error.message.includes("QUOTA_EXCEEDED")) {
        return NextResponse.json(
          { error: "Kuota API Gemini telah habis" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
