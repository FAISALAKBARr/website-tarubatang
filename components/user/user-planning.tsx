"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Calendar } from "lucide-react"

// Sample data for planting plans
const initialPlans = [
  {
    id: 1,
    crop: "Padi",
    variety: "IR64",
    area: 0.5,
    areaUnit: "hektar",
    plantingDate: "2023-11-15",
    estimatedHarvest: "2024-02-15",
    status: "Direncanakan",
  },
  {
    id: 2,
    crop: "Jagung",
    variety: "Hibrida Pioneer",
    area: 0.25,
    areaUnit: "hektar",
    plantingDate: "2023-12-01",
    estimatedHarvest: "2024-03-01",
    status: "Direncanakan",
  },
]

// Sample weather forecast data
const weatherForecast = [
  { date: "2023-11-01", condition: "Cerah", temperature: "28°C", rainfall: "0 mm", humidity: "65%" },
  { date: "2023-11-02", condition: "Cerah Berawan", temperature: "29°C", rainfall: "0 mm", humidity: "70%" },
  { date: "2023-11-03", condition: "Berawan", temperature: "27°C", rainfall: "5 mm", humidity: "75%" },
  { date: "2023-11-04", condition: "Hujan Ringan", temperature: "26°C", rainfall: "15 mm", humidity: "80%" },
  { date: "2023-11-05", condition: "Hujan", temperature: "25°C", rainfall: "25 mm", humidity: "85%" },
  { date: "2023-11-06", condition: "Cerah Berawan", temperature: "27°C", rainfall: "0 mm", humidity: "75%" },
  { date: "2023-11-07", condition: "Cerah", temperature: "28°C", rainfall: "0 mm", humidity: "70%" },
]

export default function UserPlanning() {
  const [plans, setPlans] = useState(initialPlans)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [newPlan, setNewPlan] = useState({
    crop: "",
    variety: "",
    area: 0,
    areaUnit: "hektar",
    plantingDate: "",
    estimatedHarvest: "",
    status: "Direncanakan"
  })

  const handleAddPlan = () => {
    const planToAdd = {
      id: plans.length + 1,
      ...newPlan
    }
    setPlans([...plans, planToAdd])
    setNewPlan({
      crop: "",
      variety: "",
      area: 0,
      areaUnit: "hektar",
      plantingDate: "",
      estimatedHarvest: "",
      status: "Direncanakan"
    })
    setIsAddDialogOpen(false)
  }

  const handleEditPlan = () => {
    if (!currentPlan) return
    
    const updatedPlans = plans.map(plan => 
      plan.id === currentPlan.id ? currentPlan : plan
    )
    
    setPlans(updatedPlans)
    setIsEditDialogOpen(false)
    setCurrentPlan(null)
  }

  const handleDeletePlan = (id: number) => {
    const updatedPlans = plans.filter(plan => plan.id !== id)
    setPlans(updatedPlans)
  }

  const openEditDialog = (plan: any) => {
    setCurrentPlan({...plan})
    setIsEditDialogOpen(true)
  }

  // Calculate total planned area
  const totalArea = plans.reduce((sum, plan) => {
    // Convert all to hectares for calculation
    let areaInHectares = plan.area
    if (plan.areaUnit === "meter") {
      areaInHectares = plan.area / 10000
    }
    return sum + areaInHectares
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Perencanaan Tanam</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Rencana</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Rencana Tanam</DialogTitle>
              <DialogDescription>
                Rencanakan kegiatan pertanian Anda untuk musim mendatang.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crop">Jenis Tanaman</Label>
                  <Input 
                    id="crop" 
                    value={newPlan.crop} 
                    onChange={(e) => setNewPlan({...newPlan, crop: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variety">Varietas</Label>
                  <Input 
                    id="variety" 
                    value={newPlan.variety} 
                    onChange={(e) => setNewPlan({...newPlan, variety: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="area">Luas</Label>
                    <Input 
                      id="area" 
                      type="number" 
                      value={newPlan.area} 
                      onChange={(e) => setNewPlan({...newPlan, area: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areaUnit">Satuan</Label>
                    <Select 
                      value={newPlan.areaUnit} 
                      onValueChange={(value) => setNewPlan({...newPlan, areaUnit: value})}
                    >
                      <SelectTrigger id="areaUnit">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hektar">Hektar</SelectItem>
                        <SelectItem value="meter">Meter Persegi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newPlan.status} 
                    onValueChange={(value) => setNewPlan({...newPlan, status: value})}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direncanakan">Direncanakan</SelectItem>
                      <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                      <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plantingDate">Tanggal Tanam</Label>
                  <Input 
                    id="plantingDate" 
                    type="date" 
                    value={newPlan.plantingDate} 
                    onChange={(e) => setNewPlan({...newPlan, plantingDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedHarvest">Perkiraan Panen</Label>
                  <Input 
                    id="estimatedHarvest" 
                    type="date" 
                    value={newPlan.estimatedHarvest} 
                    onChange={(e) => setNewPlan({...newPlan, estimatedHarvest: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
              <Button onClick={handleAddPlan}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Ringkasan Perencanaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Luas Lahan Direncanakan</p>
                <p className="text-2xl font-bold">{totalArea.toFixed(2)} hektar</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Jenis Tanaman</p>
                <p className="text-2xl font-bold">{new Set(plans.map(plan => plan.crop)).size}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Rencana Tanam Terdekat</p>
                <p className="text-2xl font-bold">
                  {plans.length > 0 
                    ? new Date(Math.min(...plans.map(p => new Date(p.plantingDate).getTime())))
                        .toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Prakiraan Cuaca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weatherForecast.map((forecast, index) => (
                <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      {new Date(forecast.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{forecast.condition}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{forecast.temperature}</p>
                    <p className="text-sm text-gray-600">
                      Curah hujan: {forecast.rainfall}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Rencana Tanam</DialogTitle>
            <DialogDescription>
              Ubah detail rencana tanam Anda.
            </DialogDescription>
          </DialogHeader>
          {currentPlan && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-crop">Jenis Tanaman</Label>
                  <Input 
                    id="edit-crop" 
                    value={currentPlan.crop} 
                    onChange={(e) => setCurrentPlan({...currentPlan, crop: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-variety">Varietas</Label>
                  <Input 
                    id="edit-variety" 
                    value={currentPlan.variety} 
                    onChange={(e) => setCurrentPlan({...currentPlan, variety: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-area">Luas</Label>
                    <Input 
                      id="edit-area" 
                      type="number" 
                      value={currentPlan.area} 
                      onChange={(e) => setCurrentPlan({...currentPlan, area: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-areaUnit">Satuan</Label>
                    <Select 
                      value={currentPlan.areaUnit} 
                      onValueChange={(value) => setCurrentPlan({...currentPlan, areaUnit: value})}
                    >
                      <SelectTrigger id="edit-areaUnit">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hektar">Hektar</SelectItem>
                        <SelectItem value="meter">Meter Persegi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={currentPlan.status} 
                    onValueChange={(value) => setCurrentPlan({...currentPlan, status: value})}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direncanakan">Direncanakan</SelectItem>
                      <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                      <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-plantingDate">Tanggal Tanam</Label>
                  <Input 
                    id="edit-plantingDate" 
                    type="date" 
                    value={currentPlan.plantingDate} 
                    onChange={(e) => setCurrentPlan({...currentPlan, plantingDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-estimatedHarvest">Perkiraan Panen</Label>
                  <Input 
                    id="edit-estimatedHarvest" 
                    type="date" 
                    value={currentPlan.estimatedHarvest} 
                    onChange={(e) => setCurrentPlan({...currentPlan, estimatedHarvest: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleEditPlan}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Rencana Tanam</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h4 className="font-medium">{plan.crop} - {plan.variety}</h4>
                  <p className="text-sm text-gray-600">
                    Luas: {plan.area} {plan.areaUnit}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tanam: {new Date(plan.plantingDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
