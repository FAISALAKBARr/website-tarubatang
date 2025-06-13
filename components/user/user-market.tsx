"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Trash2, TrendingUp } from "lucide-react"

// Sample data for market listings
const initialListings = [
  {
    id: 1,
    product: "Beras Organik",
    category: "Beras",
    price: 15000,
    unit: "kg",
    stock: 100,
    description: "Beras organik kualitas premium dari varietas IR64",
    status: "Tersedia",
  },
  {
    id: 2,
    product: "Jagung Manis",
    category: "Jagung",
    price: 8000,
    unit: "kg",
    stock: 50,
    description: "Jagung manis segar baru dipanen",
    status: "Tersedia",
  },
  {
    id: 3,
    product: "Kedelai",
    category: "Kacang",
    price: 12000,
    unit: "kg",
    stock: 25,
    description: "Kedelai lokal varietas Anjasmoro",
    status: "Hampir Habis",
  },
  {
    id: 4,
    product: "Bibit Padi",
    category: "Bibit",
    price: 5000,
    unit: "kantong",
    stock: 0,
    description: "Bibit padi unggul siap tanam",
    status: "Habis",
  },
  {
    id: 5,
    product: "Pupuk Organik",
    category: "Pupuk",
    price: 20000,
    unit: "karung",
    stock: 15,
    description: "Pupuk organik dari kompos dan kotoran ternak",
    status: "Tersedia",
  },
]

export default function UserMarket() {
  const [listings, setListings] = useState(initialListings)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentListing, setCurrentListing] = useState<any>(null)
  const [newListing, setNewListing] = useState({
    product: "",
    category: "",
    price: 0,
    unit: "kg",
    stock: 0,
    description: "",
    status: "Tersedia",
  })

  const handleAddListing = () => {
    const listingToAdd = {
      id: listings.length + 1,
      ...newListing,
    }
    setListings([...listings, listingToAdd])
    setNewListing({
      product: "",
      category: "",
      price: 0,
      unit: "kg",
      stock: 0,
      description: "",
      status: "Tersedia",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditListing = () => {
    if (!currentListing) return

    const updatedListings = listings.map((listing) => (listing.id === currentListing.id ? currentListing : listing))

    setListings(updatedListings)
    setIsEditDialogOpen(false)
    setCurrentListing(null)
  }

  const handleDeleteListing = (id: number) => {
    const updatedListings = listings.filter((listing) => listing.id !== id)
    setListings(updatedListings)
  }

  const openEditDialog = (listing: any) => {
    setCurrentListing({ ...listing })
    setIsEditDialogOpen(true)
  }

  // Calculate market statistics
  const totalValue = listings.reduce((sum, item) => sum + item.price * item.stock, 0)
  const availableProducts = listings.filter((item) => item.status === "Tersedia").length
  const totalProducts = listings.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pasar Tani</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Produk</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
              <DialogDescription>Tambahkan produk pertanian Anda ke pasar desa.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Nama Produk</Label>
                  <Input
                    id="product"
                    value={newListing.product}
                    onChange={(e) => setNewListing({ ...newListing, product: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={newListing.category}
                    onValueChange={(value) => setNewListing({ ...newListing, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beras">Beras</SelectItem>
                      <SelectItem value="Jagung">Jagung</SelectItem>
                      <SelectItem value="Kacang">Kacang</SelectItem>
                      <SelectItem value="Sayuran">Sayuran</SelectItem>
                      <SelectItem value="Buah">Buah</SelectItem>
                      <SelectItem value="Bibit">Bibit</SelectItem>
                      <SelectItem value="Pupuk">Pupuk</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Satuan</Label>
                    <Select
                      value={newListing.unit}
                      onValueChange={(value) => setNewListing({ ...newListing, unit: value })}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="gram">Gram (g)</SelectItem>
                        <SelectItem value="ikat">Ikat</SelectItem>
                        <SelectItem value="buah">Buah</SelectItem>
                        <SelectItem value="karung">Karung</SelectItem>
                        <SelectItem value="kantong">Kantong</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stok</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newListing.stock}
                      onChange={(e) => setNewListing({ ...newListing, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newListing.status}
                  onValueChange={(value) => setNewListing({ ...newListing, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersedia">Tersedia</SelectItem>
                    <SelectItem value="Hampir Habis">Hampir Habis</SelectItem>
                    <SelectItem value="Habis">Habis</SelectItem>
                    <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddListing}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Statistik Pasar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Nilai Produk</p>
              <p className="text-2xl font-bold">Rp {totalValue.toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Produk Tersedia</p>
              <p className="text-2xl font-bold">
                {availableProducts} dari {totalProducts}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Kategori Produk</p>
              <p className="text-2xl font-bold">{new Set(listings.map((item) => item.category)).size}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">{listing.product}</TableCell>
                  <TableCell>{listing.category}</TableCell>
                  <TableCell className="text-right">
                    Rp {listing.price.toLocaleString("id-ID")}/{listing.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {listing.stock} {listing.unit}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        listing.status === "Tersedia"
                          ? "bg-green-100 text-green-800"
                          : listing.status === "Hampir Habis"
                            ? "bg-yellow-100 text-yellow-800"
                            : listing.status === "Pre-Order"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(listing)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteListing(listing.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>Perbarui informasi produk Anda di pasar desa.</DialogDescription>
          </DialogHeader>
          {currentListing && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-product">Nama Produk</Label>
                  <Input
                    id="edit-product"
                    value={currentListing.product}
                    onChange={(e) => setCurrentListing({ ...currentListing, product: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Kategori</Label>
                  <Select
                    value={currentListing.category}
                    onValueChange={(value) => setCurrentListing({ ...currentListing, category: value })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beras">Beras</SelectItem>
                      <SelectItem value="Jagung">Jagung</SelectItem>
                      <SelectItem value="Kacang">Kacang</SelectItem>
                      <SelectItem value="Sayuran">Sayuran</SelectItem>
                      <SelectItem value="Buah">Buah</SelectItem>
                      <SelectItem value="Bibit">Bibit</SelectItem>
                      <SelectItem value="Pupuk">Pupuk</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Harga (Rp)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={currentListing.price}
                    onChange={(e) => setCurrentListing({ ...currentListing, price: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit">Satuan</Label>
                    <Select
                      value={currentListing.unit}
                      onValueChange={(value) => setCurrentListing({ ...currentListing, unit: value })}
                    >
                      <SelectTrigger id="edit-unit">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="gram">Gram (g)</SelectItem>
                        <SelectItem value="ikat">Ikat</SelectItem>
                        <SelectItem value="buah">Buah</SelectItem>
                        <SelectItem value="karung">Karung</SelectItem>
                        <SelectItem value="kantong">Kantong</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-stock">Stok</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={currentListing.stock}
                      onChange={(e) => setCurrentListing({ ...currentListing, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={currentListing.description}
                  onChange={(e) => setCurrentListing({ ...currentListing, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={currentListing.status}
                  onValueChange={(value) => setCurrentListing({ ...currentListing, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersedia">Tersedia</SelectItem>
                    <SelectItem value="Hampir Habis">Hampir Habis</SelectItem>
                    <SelectItem value="Habis">Habis</SelectItem>
                    <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditListing}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
