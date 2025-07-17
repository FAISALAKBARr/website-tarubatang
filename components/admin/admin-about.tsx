// // 1. types/about.ts - Definisi tipe data untuk About Page
// export interface AboutContent {
//   id: string;
//   hero: {
//     title: string;
//     subtitle: string;
//     backgroundImage: string;
//   };
//   history: {
//     title: string;
//     content: string[];
//     establishedYear: string;
//     image: string;
//   };
//   geography: {
//     title: string;
//     subtitle: string;
//     stats: {
//       altitude: string;
//       area: string;
//       population: string;
//       temperature: string;
//     };
//     boundaries: {
//       north: string;
//       south: string;
//       east: string;
//       west: string;
//     };
//     topography: {
//       highland: string;
//       hills: string;
//       valley: string;
//       slope: string;
//     };
//   };
//   visionMission: {
//     vision: string;
//     missions: string[];
//   };
//   demographics: {
//     malePopulation: number;
//     femalePopulation: number;
//     households: number;
//     averagePerHousehold: number;
//     occupations: {
//       name: string;
//       percentage: number;
//     }[];
//     education: {
//       level: string;
//       percentage: number;
//     }[];
//   };
//   updatedAt: string;
//   updatedBy: string;
// }

// // 2. components/admin/AboutEditor.tsx - Komponen untuk edit About Page
// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import { Save, Plus, Trash2, Upload, Eye } from "lucide-react";
// import { AboutContent } from "@/types/about";

// export default function AboutEditor() {
//   const [content, setContent] = useState<AboutContent | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     fetchAboutContent();
//   }, []);

//   const fetchAboutContent = async () => {
//     try {
//       const response = await fetch('/api/about');
//       const data = await response.json();
//       setContent(data);
//     } catch (error) {
//       console.error('Error fetching about content:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     if (!content) return;
    
//     setIsSaving(true);
//     try {
//       const response = await fetch('/api/about', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify(content)
//       });
      
//       if (response.ok) {
//         alert('Konten berhasil disimpan!');
//       }
//     } catch (error) {
//       console.error('Error saving content:', error);
//       alert('Gagal menyimpan konten');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const updateContent = (path: string, value: any) => {
//     if (!content) return;
    
//     const keys = path.split('.');
//     const newContent = { ...content };
//     let current: any = newContent;
    
//     for (let i = 0; i < keys.length - 1; i++) {
//       current = current[keys[i]];
//     }
    
//     current[keys[keys.length - 1]] = value;
//     setContent(newContent);
//   };

//   const addArrayItem = (path: string, newItem: any) => {
//     if (!content) return;
    
//     const keys = path.split('.');
//     const newContent = { ...content };
//     let current: any = newContent;
    
//     for (let i = 0; i < keys.length - 1; i++) {
//       current = current[keys[i]];
//     }
    
//     current[keys[keys.length - 1]] = [...current[keys[keys.length - 1]], newItem];
//     setContent(newContent);
//   };

//   const removeArrayItem = (path: string, index: number) => {
//     if (!content) return;
    
//     const keys = path.split('.');
//     const newContent = { ...content };
//     let current: any = newContent;
    
//     for (let i = 0; i < keys.length - 1; i++) {
//       current = current[keys[i]];
//     }
    
//     current[keys[keys.length - 1]] = current[keys[keys.length - 1]].filter((_: any, i: number) => i !== index);
//     setContent(newContent);
//   };

//   if (isLoading) {
//     return <div className="flex justify-center items-center h-64">Loading...</div>;
//   }

//   if (!content) {
//     return <div className="text-center text-red-500">Gagal memuat konten</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold">Edit Halaman Tentang</h2>
//           <p className="text-gray-600">Kelola konten halaman About</p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => window.open('/about', '_blank')}>
//             <Eye className="h-4 w-4 mr-2" />
//             Preview
//           </Button>
//           <Button onClick={handleSave} disabled={isSaving}>
//             <Save className="h-4 w-4 mr-2" />
//             {isSaving ? 'Menyimpan...' : 'Simpan'}
//           </Button>
//         </div>
//       </div>

//       <Tabs defaultValue="hero" className="w-full">
//         <TabsList className="grid w-full grid-cols-5">
//           <TabsTrigger value="hero">Hero</TabsTrigger>
//           <TabsTrigger value="history">Sejarah</TabsTrigger>
//           <TabsTrigger value="geography">Geografis</TabsTrigger>
//           <TabsTrigger value="vision">Visi Misi</TabsTrigger>
//           <TabsTrigger value="demographics">Demografi</TabsTrigger>
//         </TabsList>

//         <TabsContent value="hero" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Hero Section</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <Label htmlFor="hero-title">Judul</Label>
//                 <Input
//                   id="hero-title"
//                   value={content.hero.title}
//                   onChange={(e) => updateContent('hero.title', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="hero-subtitle">Subtitle</Label>
//                 <Textarea
//                   id="hero-subtitle"
//                   value={content.hero.subtitle}
//                   onChange={(e) => updateContent('hero.subtitle', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="hero-bg">Background Image URL</Label>
//                 <Input
//                   id="hero-bg"
//                   value={content.hero.backgroundImage}
//                   onChange={(e) => updateContent('hero.backgroundImage', e.target.value)}
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="history" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Sejarah Desa</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <Label htmlFor="history-title">Judul</Label>
//                 <Input
//                   id="history-title"
//                   value={content.history.title}
//                   onChange={(e) => updateContent('history.title', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="history-year">Tahun Berdiri</Label>
//                 <Input
//                   id="history-year"
//                   value={content.history.establishedYear}
//                   onChange={(e) => updateContent('history.establishedYear', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="history-image">Image URL</Label>
//                 <Input
//                   id="history-image"
//                   value={content.history.image}
//                   onChange={(e) => updateContent('history.image', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Paragraf Sejarah</Label>
//                 {content.history.content.map((paragraph, index) => (
//                   <div key={index} className="flex gap-2 mb-2">
//                     <Textarea
//                       value={paragraph}
//                       onChange={(e) => {
//                         const newContent = [...content.history.content];
//                         newContent[index] = e.target.value;
//                         updateContent('history.content', newContent);
//                       }}
//                       className="flex-1"
//                     />
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => removeArrayItem('history.content', index)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//                 <Button
//                   variant="outline"
//                   onClick={() => addArrayItem('history.content', '')}
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Tambah Paragraf
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="geography" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Informasi Geografis</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="geo-altitude">Ketinggian</Label>
//                   <Input
//                     id="geo-altitude"
//                     value={content.geography.stats.altitude}
//                     onChange={(e) => updateContent('geography.stats.altitude', e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="geo-area">Luas Wilayah</Label>
//                   <Input
//                     id="geo-area"
//                     value={content.geography.stats.area}
//                     onChange={(e) => updateContent('geography.stats.area', e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="geo-population">Jumlah Penduduk</Label>
//                   <Input
//                     id="geo-population"
//                     value={content.geography.stats.population}
//                     onChange={(e) => updateContent('geography.stats.population', e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="geo-temperature">Suhu Rata-rata</Label>
//                   <Input
//                     id="geo-temperature"
//                     value={content.geography.stats.temperature}
//                     onChange={(e) => updateContent('geography.stats.temperature', e.target.value)}
//                   />
//                 </div>
//               </div>
              
//               <div>
//                 <Label className="text-lg font-semibold">Batas Wilayah</Label>
//                 <div className="grid grid-cols-2 gap-4 mt-2">
//                   <div>
//                     <Label htmlFor="boundary-north">Utara</Label>
//                     <Input
//                       id="boundary-north"
//                       value={content.geography.boundaries.north}
//                       onChange={(e) => updateContent('geography.boundaries.north', e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="boundary

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Trash2, Upload, Eye, Edit, Image as ImageIcon } from 'lucide-react';

// Types
interface AboutContent {
  id: string;
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  history: {
    title: string;
    content: string[];
    establishedYear: string;
    image: string;
  };
  geography: {
    title: string;
    subtitle: string;
    stats: {
      altitude: string;
      area: string;
      population: string;
      temperature: string;
    };
    boundaries: {
      north: string;
      south: string;
      east: string;
      west: string;
    };
    topography: {
      highland: string;
      hills: string;
      valley: string;
      slope: string;
    };
  };
  visionMission: {
    vision: string;
    missions: string[];
  };
  demographics: {
    malePopulation: number;
    femalePopulation: number;
    households: number;
    averagePerHousehold: number;
    occupations: {
      name: string;
      percentage: number;
    }[];
    education: {
      level: string;
      percentage: number;
    }[];
  };
  updatedAt: string;
  updatedBy: string;
}

export default function AboutEditor() {
  const [content, setContent] = useState<AboutContent>({
    id: '1',
    hero: {
      title: 'Tentang Desa Tarubatang',
      subtitle: 'Mengenal lebih dekat sejarah, geografis, dan potensi Desa Tarubatang sebagai destinasi wisata unggulan di kaki Gunung Merbabu',
      backgroundImage: '/merbabuu.png'
    },
    history: {
      title: 'Asal Usul Desa Tarubatang',
      content: [
        'Desa Tarubatang memiliki sejarah panjang yang dimulai pada abad ke-18, ketika para pendatang dari Jawa mulai membuka lahan di lereng Gunung Merbabu. Nama "Tarubatang" berasal dari bahasa Jawa yang berarti "pohon besar", merujuk pada pohon beringin raksasa yang menjadi landmark desa.',
        'Pada masa kolonial Belanda, desa ini menjadi salah satu pusat perkebunan kopi dan tembakau. Setelah kemerdekaan, masyarakat mulai mengembangkan pertanian sayuran dan buah-buahan yang cocok dengan iklim pegunungan.',
        'Sejak tahun 2000-an, Desa Tarubatang mulai mengembangkan potensi wisata alamnya, terutama sebagai basecamp pendakian Gunung Merbabu dan destinasi wisata alam yang menawarkan keindahan panorama pegunungan.'
      ],
      establishedYear: '1750',
      image: '/placeholder.svg?height=400&width=500'
    },
    geography: {
      title: 'Kondisi Geografis',
      subtitle: 'Desa Tarubatang terletak di lokasi strategis dengan kondisi geografis yang mendukung pengembangan wisata alam dan pertanian berkelanjutan',
      stats: {
        altitude: '1,200m',
        area: '15.5',
        population: '2,547',
        temperature: '18-25°C'
      },
      boundaries: {
        north: 'Desa Lencoh',
        south: 'Desa Jeruksawit',
        east: 'Taman Nasional Gunung Merbabu',
        west: 'Desa Samiran'
      },
      topography: {
        highland: '65%',
        hills: '25%',
        valley: '10%',
        slope: '15-45°'
      }
    },
    visionMission: {
      vision: 'Mewujudkan Desa Tarubatang sebagai destinasi wisata alam berkelanjutan yang berdaya saing, dengan masyarakat yang sejahtera, mandiri, dan berbudaya lingkungan pada tahun 2030',
      missions: [
        'Mengembangkan potensi wisata alam berbasis masyarakat',
        'Meningkatkan kesejahteraan masyarakat melalui UMKM dan basecamp',
        'Melestarikan lingkungan dan kearifan lokal',
        'Membangun infrastruktur pendukung pariwisata',
        'Meningkatkan kapasitas SDM dalam bidang pariwisata'
      ]
    },
    demographics: {
      malePopulation: 1289,
      femalePopulation: 1258,
      households: 687,
      averagePerHousehold: 3.7,
      occupations: [
        { name: 'Petani', percentage: 45 },
        { name: 'Pedagang/UMKM', percentage: 25 },
        { name: 'Jasa Pariwisata', percentage: 20 },
        { name: 'Lainnya', percentage: 10 }
      ],
      education: [
        { level: 'SD/Sederajat', percentage: 35 },
        { level: 'SMP/Sederajat', percentage: 30 },
        { level: 'SMA/Sederajat', percentage: 25 },
        { level: 'Perguruan Tinggi', percentage: 10 }
      ]
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const updateContent = (path: string, value: any) => {
    const keys = path.split('.');
    const newContent = { ...content };
    let current: any = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setContent(newContent);
  };

  const addArrayItem = (path: string, newItem: any) => {
    const keys = path.split('.');
    const newContent = { ...content };
    let current: any = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = [...current[keys[keys.length - 1]], newItem];
    setContent(newContent);
  };

  const removeArrayItem = (path: string, index: number) => {
    const keys = path.split('.');
    const newContent = { ...content };
    let current: any = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = current[keys[keys.length - 1]].filter((_: any, i: number) => i !== index);
    setContent(newContent);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Konten berhasil disimpan!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Gagal menyimpan konten');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (path: string) => {
    // Simulate image upload
    const newImageUrl = `/uploaded-image-${Date.now()}.jpg`;
    updateContent(path, newImageUrl);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Halaman Tentang</h2>
          <p className="text-gray-600 mt-1">Kelola konten halaman About dengan mudah</p>
          <Badge variant="outline" className="mt-2">
            Terakhir diperbarui: {new Date(content.updatedAt).toLocaleDateString('id-ID')}
          </Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.open('/about', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="history">Sejarah</TabsTrigger>
          <TabsTrigger value="geography">Geografis</TabsTrigger>
          <TabsTrigger value="vision">Visi & Misi</TabsTrigger>
          <TabsTrigger value="demographics">Demografi</TabsTrigger>
        </TabsList>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2 text-green-600" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="hero-title" className="text-sm font-medium">Judul Utama</Label>
                  <Input
                    id="hero-title"
                    value={content.hero.title}
                    onChange={(e) => updateContent('hero.title', e.target.value)}
                    className="mt-1"
                    placeholder="Masukkan judul hero section"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle" className="text-sm font-medium">Subtitle</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={content.hero.subtitle}
                    onChange={(e) => updateContent('hero.subtitle', e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder="Masukkan subtitle yang menjelaskan desa"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Background Image</Label>
                  <div className="flex gap-3 mt-1">
                    <Input
                      value={content.hero.backgroundImage}
                      onChange={(e) => updateContent('hero.backgroundImage', e.target.value)}
                      placeholder="URL gambar background"
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={() => handleImageUpload('hero.backgroundImage')}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  {content.hero.backgroundImage && (
                    <div className="mt-2 p-2 border rounded">
                      <img 
                        src={content.hero.backgroundImage} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2 text-green-600" />
                Sejarah Desa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="history-title" className="text-sm font-medium">Judul Sejarah</Label>
                  <Input
                    id="history-title"
                    value={content.history.title}
                    onChange={(e) => updateContent('history.title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="history-year" className="text-sm font-medium">Tahun Berdiri</Label>
                  <Input
                    id="history-year"
                    value={content.history.establishedYear}
                    onChange={(e) => updateContent('history.establishedYear', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Gambar Sejarah</Label>
                <div className="flex gap-3 mt-1">
                  <Input
                    value={content.history.image}
                    onChange={(e) => updateContent('history.image', e.target.value)}
                    placeholder="URL gambar sejarah"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => handleImageUpload('history.image')}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm font-medium">Paragraf Sejarah</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('history.content', '')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Paragraf
                  </Button>
                </div>
                
                {content.history.content.map((paragraph, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">Paragraf {index + 1}</Label>
                      <Textarea
                        value={paragraph}
                        onChange={(e) => {
                          const newContent = [...content.history.content];
                          newContent[index] = e.target.value;
                          updateContent('history.content', newContent);
                        }}
                        className="mt-1"
                        rows={3}
                        placeholder="Tulis paragraf sejarah..."
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('history.content', index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2 text-green-600" />
                Informasi Geografis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="geo-title" className="text-sm font-medium">Judul</Label>
                <Input
                  id="geo-title"
                  value={content.geography.title}
                  onChange={(e) => updateContent('geography.title', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="geo-subtitle" className="text-sm font-medium">Subtitle</Label>
                <Textarea
                  id="geo-subtitle"
                  value={content.geography.subtitle}
                  onChange={(e) => updateContent('geography.subtitle', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Statistik Geografis</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Ketinggian</Label>
                    <Input
                      value={content.geography.stats.altitude}
                      onChange={(e) => updateContent('geography.stats.altitude', e.target.value)}
                      placeholder="contoh: 1,200m"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Luas Wilayah</Label>
                    <Input
                      value={content.geography.stats.area}
                      onChange={(e) => updateContent('geography.stats.area', e.target.value)}
                      placeholder="contoh: 15.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Jumlah Penduduk</Label>
                    <Input
                      value={content.geography.stats.population}
                      onChange={(e) => updateContent('geography.stats.population', e.target.value)}
                      placeholder="contoh: 2,547"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Suhu Rata-rata</Label>
                    <Input
                      value={content.geography.stats.temperature}
                      onChange={(e) => updateContent('geography.stats.temperature', e.target.value)}
                      placeholder="contoh: 18-25°C"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Batas Wilayah</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Utara</Label>
                      <Input
                        value={content.geography.boundaries.north}
                        onChange={(e) => updateContent('geography.boundaries.north', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Selatan</Label>
                      <Input
                        value={content.geography.boundaries.south}
                        onChange={(e) => updateContent('geography.boundaries.south', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Timur</Label>
                      <Input
                        value={content.geography.boundaries.east}
                        onChange={(e) => updateContent('geography.boundaries.east', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Barat</Label>
                      <Input
                        value={content.geography.boundaries.west}
                        onChange={(e) => updateContent('geography.boundaries.west', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Topografi</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Dataran Tinggi</Label>
                      <Input
                        value={content.geography.topography.highland}
                        onChange={(e) => updateContent('geography.topography.highland', e.target.value)}
                        placeholder="contoh: 65%"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Perbukitan</Label>
                      <Input
                        value={content.geography.topography.hills}
                        onChange={(e) => updateContent('geography.topography.hills', e.target.value)}
                        placeholder="contoh: 25%"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Lembah</Label>
                      <Input
                        value={content.geography.topography.valley}
                        onChange={(e) => updateContent('geography.topography.valley', e.target.value)}
                        placeholder="contoh: 10%"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Kemiringan</Label>
                      <Input
                        value={content.geography.topography.slope}
                        onChange={(e) => updateContent('geography.topography.slope', e.target.value)}
                        placeholder="contoh: 15-45°"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vision & Mission Tab */}
        <TabsContent value="vision" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2 text-green-600" />
                Visi & Misi Desa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="vision" className="text-sm font-medium">Visi Desa</Label>
                <Textarea
                  id="vision"
                  value={content.visionMission.vision}
                  onChange={(e) => updateContent('visionMission.vision', e.target.value)}
                  className="mt-1"
                  rows={4}
                  placeholder="Tulis visi desa..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm font-medium">Misi Desa</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('visionMission.missions', '')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Misi
                  </Button>
                </div>
                
                {content.visionMission.missions.map((mission, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">Misi {index + 1}</Label>
                      <Textarea
                        value={mission}
                        onChange={(e) => {
                          const newMissions = [...content.visionMission.missions];
                          newMissions[index] = e.target.value;
                          updateContent('visionMission.missions', newMissions);
                        }}
                        className="mt-1"
                        rows={2}
                        placeholder="Tulis misi desa..."
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('visionMission.missions', index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2 text-green-600" />
                Data Demografi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Data Penduduk</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Penduduk Laki-laki</Label>
                    <Input
                      type="number"
                      value={content.demographics.malePopulation}
                      onChange={(e) => updateContent('demographics.malePopulation', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Penduduk Perempuan</Label>
                    <Input
                      type="number"
                      value={content.demographics.femalePopulation}
                      onChange={(e) => updateContent('demographics.femalePopulation', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Jumlah KK</Label>
                    <Input
                      type="number"
                      value={content.demographics.households}
                      onChange={(e) => updateContent('demographics.households', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Rata-rata per KK</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={content.demographics.averagePerHousehold}
                      onChange={(e) => updateContent('demographics.averagePerHousehold', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-sm font-medium">Mata Pencaharian</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('demographics.occupations', { name: '', percentage: 0 })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah
                    </Button>
                  </div>
                  
                  {content.demographics.occupations.map((occupation, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <Input
                          value={occupation.name}
                          onChange={(e) => {
                            const newOccupations = [...content.demographics.occupations];
                            newOccupations[index].name = e.target.value;
                            updateContent('demographics.occupations', newOccupations);
                          }}
                          placeholder="Nama pekerjaan"
                          className="mb-1"
                        />
                        <Input
                          type="number"
                          value={occupation.percentage}
                          onChange={(e) => {
                            const newOccupations = [...content.demographics.occupations];
                            newOccupations[index].percentage = parseInt(e.target.value) || 0;
                            updateContent('demographics.occupations', newOccupations);
                          }}
                          placeholder="Persentase"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('demographics.occupations', index)}
                        className="mt-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-sm font-medium">Tingkat Pendidikan</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('demographics.education', { level: '', percentage: 0 })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah
                    </Button>
                  </div>
                  
                  {content.demographics.education.map((education, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <Input
                          value={education.level}
                          onChange={(e) => {
                            const newEducation = [...content.demographics.education];
                            newEducation[index].level = e.target.value;
                            updateContent('demographics.education', newEducation);
                          }}
                          placeholder="Tingkat pendidikan"
                          className="mb-1"
                        />
                        <Input
                          type="number"
                          value={education.percentage}
                          onChange={(e) => {
                            const newEducation = [...content.demographics.education];
                            newEducation[index].percentage = parseInt(e.target.value) || 0;
                            updateContent('demographics.education', newEducation);
                          }}
                          placeholder="Persentase"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('demographics.education', index)}
                        className="mt-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button at Bottom */}
      <div className="flex justify-end pt-6 border-t">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-5 w-5 mr-2" />
          {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
        </Button>
      </div>
    </div>
  );
}