// app/api/produk/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// export async function GET() {
//   const data = await prisma.produk.findMany({
//     orderBy: { createdAt: 'desc' },
//   })
//   return NextResponse.json(data)
// }

// export async function POST(req: NextRequest) {
//   const body = await req.json()

//   const newProduk = await prisma.produk.create({
//     data: {
//       nama: body.nama,
//       harga: Number(body.harga),
//       gambarUrl: body.gambarUrl,
//       kontak: body.kontak,
//       deskripsi: body.deskripsi,
//       ownerId: body.ownerId, // pastikan ini valid!
//     },
//   })

//   return NextResponse.json(newProduk, { status: 201 })
// }


export async function GET() {
  const umkm = await prisma.uMKM.findMany({ include: { owner: true } });
  return NextResponse.json(umkm);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newUMKM = await prisma.uMKM.create({ data });
  return NextResponse.json(newUMKM, { status: 201 });
}