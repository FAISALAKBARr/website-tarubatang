"use client";


import React from 'react';
import { Mountain } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WebsiteContent {
  contact: {
    village: string
    tourism: string
    emergency: string
    email: string
    address: string
  }
}

export default function Footer() {
      const [content, setContent] = useState<WebsiteContent | null>(null)

     useEffect(() => {
        const loadContent = async () => {
          try {
            const response = await fetch("/api/content")
            if (response.ok) {
              const data = await response.json()
              setContent(data)
            } else {
              // Load default content if API fails
              setContent(getDefaultContent())
            }
          } catch (error) {
            console.error("Failed to load content:", error)
            setContent(getDefaultContent())
          }
        }
        loadContent()
      }, [])
  return (
   <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-semibold">Desa Tarubatang</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Destinasi wisata alam terbaik di kaki Gunung Merbabu, menawarkan pengalaman tak terlupakan dengan
                keindahan alam dan budaya lokal.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Menu Utama</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#tentang" className="hover:text-green-400">
                    Tentang Desa
                  </a>
                </li>
                <li>
                  <a href="#wisata" className="hover:text-green-400">
                    Destinasi Wisata
                  </a>
                </li>
                <li>
                  <a href="#umkm" className="hover:text-green-400">
                    UMKM & Homestay
                  </a>
                </li>
                <li>
                  <a href="#acara" className="hover:text-green-400">
                    Acara & Event
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Kantor Desa: {content?.contact.village}</p>
                <p>Wisata: {content?.contact.tourism}</p>
                <p>Email: {content?.contact.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Desa Tarubatang. Dikembangkan oleh Tim KKN Universitas</p>
          </div>
        </div>
      </footer>
  );
}

function getDefaultContent(): WebsiteContent {
  return {
    contact: {
      village: "(0276) 123-4567",
      tourism: "0812-3456-7890",
      emergency: "0811-2233-4455",
      email: "info@tarubatang.desa.id",
      address: "Desa Tarubatang, Kecamatan Selo, Kabupaten Boyolali, Jawa Tengah 57365",
    },
  }
}