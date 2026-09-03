import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET ALL EVENTS (from PostgreSQL DB)
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.events.findMany({
      include: {
        categories: true,
        teams: true
      },
      orderBy: {
        id: "asc"
      }
    });

    // Map to frontend expected Event format
    const mapped = events.map(e => ({
      id: e.id,
      nama: e.nama,
      lokasi: e.lokasi,
      tanggal: e.tanggal,
      deskripsi: e.deskripsi || "",
      categoryId: e.category_id,
      pembicaraId: e.pembicara_id,
      category: { nama: e.categories.nama },
      pembicara: { nama: e.teams.nama, bidang: `No. ${e.teams.no_urut} - ${e.teams.asal_sekolah}` }
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    console.error("Gagal mengambil data event:", error);
    res.status(500).json({ message: "Gagal memuat data event", error });
  }
};

// CREATE EVENT (in PostgreSQL DB)
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { nama, lokasi, tanggal, deskripsi, categoryId, pembicaraId } = req.body;
    if (!nama || !lokasi || !tanggal) {
      return res.status(400).json({ message: "Data wajib diisi semua!" });
    }

    const newEvent = await prisma.events.create({
      data: {
        nama,
        lokasi,
        tanggal: new Date(tanggal),
        deskripsi: deskripsi || "",
        category_id: Number(categoryId),
        pembicara_id: Number(pembicaraId)
      },
      include: {
        categories: true,
        teams: true
      }
    });

    const mapped = {
      id: newEvent.id,
      nama: newEvent.nama,
      lokasi: newEvent.lokasi,
      tanggal: newEvent.tanggal,
      deskripsi: newEvent.deskripsi || "",
      categoryId: newEvent.category_id,
      pembicaraId: newEvent.pembicara_id,
      category: { nama: newEvent.categories.nama },
      pembicara: { nama: newEvent.teams.nama, bidang: `No. ${newEvent.teams.no_urut} - ${newEvent.teams.asal_sekolah}` }
    };

    res.status(201).json(mapped);
  } catch (error: any) {
    console.error("Gagal membuat event:", error);
    res.status(500).json({ message: "Gagal membuat event", error });
  }
};

// UPDATE EVENT (in PostgreSQL DB)
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, lokasi, tanggal, deskripsi, categoryId, pembicaraId } = req.body;

    const data: any = {};
    if (nama) data.nama = nama;
    if (lokasi) data.lokasi = lokasi;
    if (tanggal) data.tanggal = new Date(tanggal);
    if (deskripsi !== undefined) data.deskripsi = deskripsi;
    if (categoryId) data.category_id = Number(categoryId);
    if (pembicaraId) data.pembicara_id = Number(pembicaraId);

    const updatedEvent = await prisma.events.update({
      where: { id: Number(id) },
      data,
      include: {
        categories: true,
        teams: true
      }
    });

    const mapped = {
      id: updatedEvent.id,
      nama: updatedEvent.nama,
      lokasi: updatedEvent.lokasi,
      tanggal: updatedEvent.tanggal,
      deskripsi: updatedEvent.deskripsi || "",
      categoryId: updatedEvent.category_id,
      pembicaraId: updatedEvent.pembicara_id,
      category: { nama: updatedEvent.categories.nama },
      pembicara: { nama: updatedEvent.teams.nama, bidang: `No. ${updatedEvent.teams.no_urut} - ${updatedEvent.teams.asal_sekolah}` }
    };

    res.status(200).json(mapped);
  } catch (error: any) {
    console.error("Gagal memperbarui event:", error);
    res.status(500).json({ message: "Gagal memperbarui event", error });
  }
};

// DELETE EVENT (from PostgreSQL DB)
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.events.delete({
      where: { id: Number(id) }
    });
    res.status(200).json({ message: "Event berhasil dihapus" });
  } catch (error: any) {
    console.error("Gagal menghapus event:", error);
    res.status(500).json({ message: "Gagal menghapus event", error });
  }
};