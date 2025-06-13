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
import { PlusCircle, Edit, Trash2, BarChart3 } from "lucide-react"

// Sample data for harvests
const initialHarvests = [
  {
    id: 1,
    crop: "Padi",
    variety: "IR64",
    harvestDate: "2023-05-15",
    quantity: 750,
    unit: "kg",
    quality: "Baik",
    notes: "Hasil panen lebih baik dari perkiraan",
    status: "Tersimpan",
  },
  {
    id: 2,
    crop: "Jagung",
    variety: "Hibrida Pioneer",
    harvestDate: "2023-06-20",
    quantity: 350,
    unit: "kg",
    quality: "Sangat Baik",
    notes: "Ukuran jagung besar dan seragam",
    status: "Sebagian Terjual",
  },
  {
    id: 3,
    crop: "Kedelai",
    variety: "Anjasmoro",
    harvestDate: "2023-07-10",
    quantity: 150,
    unit: "kg",
    quality: "Baik",
    notes: "Sedikit terkena hama",
    status: "Terjual",
  },
]

export default function UserHarvests() {
  const [harvests, setHarvests] = useState(initialHarvests)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentHarvest, setCurrentHarvest] = useState<any>(null)
  const [newHarvest, setNewHarvest] = useState({
    crop: "",
    variety: "",
    harvestDate: "",
    quantity: 0,
    unit: "kg",
    quality: "Baik",
    notes: "",
    status: "Tersimpan",
  })

  const handleAddHarvest = () => {
    const harvestToAdd = {
      id: harvests.length + 1,
      ...newHarvest,
    }
    setHarvests([...harvests, harvestToAdd])
    setNewHarvest({
      crop: "",
      variety: "",
      harvestDate: "",
      quantity: 0,
      unit: "kg",
      quality: "Baik",
      notes: "",
      status: "Tersimpan",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditHarvest = () => {
    if (!currentHarvest) return

    const updatedHarvests = harvests.map((harvest) => (harvest.id === currentHarvest.id ? currentHarvest : harvest))

    setHarvests(updatedHarvests)
    setIsEditDialogOpen(false)
    setCurrentHarvest(null)
  }

  const handleDeleteHarvest = (id: number) => {
    const updatedHarvests = harvests.filter((harvest) => harvest.id !== id)
    setHarvests(updatedHarvests)
  }

  const openEditDialog = (harvest: any) => {
    setCurrentHarvest({ ...harvest })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Catatan Hasil Panen</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Panen</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Hasil Panen Baru</DialogTitle>
              <DialogDescription>Masukkan detail hasil panen Anda untuk pencatatan dan analisis.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crop">Jenis Tanaman</Label>
                  <Input
                    id="crop"
                    value={newHarvest.crop}
                    onChange={(e) => setNewHarvest({ ...newHarvest, crop: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variety">Varietas</Label>
                  <Input
                    id="variety"
                    value={newHarvest.variety}
                    onChange={(e) => setNewHarvest({ ...newHarvest, variety: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Tanggal Panen</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={newHarvest.harvestDate}
                    onChange={(e) => setNewHarvest({ ...newHarvest, harvestDate: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Jumlah</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newHarvest.quantity}
                      onChange={(e) => setNewHarvest({ ...newHarvest, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Satuan</Label>
                    <Select
                      value={newHarvest.unit}
                      onValueChange={(value) => setNewHarvest({ ...newHarvest, unit: value })}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="ton">Ton</SelectItem>
                        <SelectItem value="kuintal">Kuintal</SelectItem>
                        <SelectItem value="karung">Karung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Kualitas</Label>
                <Select
                  value={newHarvest.quality}
                  onValueChange={(value) => setNewHarvest({ ...newHarvest, quality: value })}
                >
                  <SelectTrigger id="quality">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sangat Baik">Sangat Baik</SelectItem>
                    <SelectItem value="Baik">Baik</SelectItem>
                    <SelectItem value="Sedang">Sedang</SelectItem>
                    <SelectItem value="Kurang">Kurang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={newHarvest.notes}
                  onChange={(e) => setNewHarvest({ ...newHarvest, notes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newHarvest.status}
                  onValueChange={(value) => setNewHarvest({ ...newHarvest, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersimpan">Tersimpan</SelectItem>
                    <SelectItem value="Sebagian Terjual">Sebagian Terjual</SelectItem>
                    <SelectItem value="Terjual">Terjual</SelectItem>
                    <SelectItem value="Rusak">Rusak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddHarvest}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Statistik Panen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Panen</p>
              <p className="text-2xl font-bold">{harvests.reduce((sum, h) => sum + h.quantity, 0)} kg</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Jenis Tanaman</p>
              <p className="text-2xl font-bold">{new Set(harvests.map((h) => h.crop)).size}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Panen Terakhir</p>
              <p className="text-2xl font-bold">
                {harvests.length > 0
                  ? new Date(Math.max(...harvests.map((h) => new Date(h.harvestDate).getTime()))).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanaman</TableHead>
                <TableHead>Varietas</TableHead>
                <TableHead>Tanggal Panen</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Kualitas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {harvests.map((harvest) => (
                <TableRow key={harvest.id}>
                  <TableCell className="font-medium">{harvest.crop}</TableCell>
                  <TableCell>{harvest.variety}</TableCell>
                  <TableCell>
                    {new Date(harvest.harvestDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {harvest.quantity} {harvest.unit}
                  </TableCell>
                  <TableCell>{harvest.quality}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        harvest.status === "Terjual"
                          ? "bg-green-100 text-green-800"
                          : harvest.status === "Sebagian Terjual"
                            ? "bg-blue-100 text-blue-800"
                            : harvest.status === "Tersimpan"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {harvest.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(harvest)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteHarvest(harvest.id)}>
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
            <DialogTitle>Edit Hasil Panen</DialogTitle>
            <DialogDescription>Perbarui informasi hasil panen Anda.</DialogDescription>
          </DialogHeader>
          {currentHarvest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-crop">Jenis Tanaman</Label>
                  <Input
                    id="edit-crop"
                    value={currentHarvest.crop}
                    onChange={(e) => setCurrentHarvest({ ...currentHarvest, crop: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-variety">Varietas</Label>
                  <Input
                    id="edit-variety"
                    value={currentHarvest.variety}
                    onChange={(e) => setCurrentHarvest({ ...currentHarvest, variety: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-harvestDate">Tanggal Panen</Label>
                  <Input
                    id="edit-harvestDate"
                    type="date"
                    value={currentHarvest.harvestDate}
                    onChange={(e) => setCurrentHarvest({ ...currentHarvest, harvestDate: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantity">Jumlah</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      value={currentHarvest.quantity}
                      onChange={(e) => setCurrentHarvest({ ...currentHarvest, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit">Satuan</Label>
                    <Select
                      value={currentHarvest.unit}
                      onValueChange={(value) => setCurrentHarvest({ ...currentHarvest, unit: value })}
                    >
                      <SelectTrigger id="edit-unit">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="ton">Ton</SelectItem>
                        <SelectItem value="kuintal">Kuintal</SelectItem>
                        <SelectItem value="karung">Karung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quality">Kualitas</Label>
                <Select
                  value={currentHarvest.quality}
                  onValueChange={(value) => setCurrentHarvest({ ...currentHarvest, quality: value })}
                >
                  <SelectTrigger id="edit-quality">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sangat Baik">Sangat Baik</SelectItem>
                    <SelectItem value="Baik">Baik</SelectItem>
                    <SelectItem value="Sedang">Sedang</SelectItem>
                    <SelectItem value="Kurang">Kurang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Catatan</Label>
                <Textarea
                  id="edit-notes"
                  value={currentHarvest.notes}
                  onChange={(e) => setCurrentHarvest({ ...currentHarvest, notes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={currentHarvest.status}
                  onValueChange={(value) => setCurrentHarvest({ ...currentHarvest, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersimpan">Tersimpan</SelectItem>
                    <SelectItem value="Sebagian Terjual">Sebagian Terjual</SelectItem>
                    <SelectItem value="Terjual">Terjual</SelectItem>
                    <SelectItem value="Rusak">Rusak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditHarvest}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
