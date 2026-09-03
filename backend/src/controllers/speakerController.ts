import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// Helper to parse bidang
const parseBidang = (bidang: string) => {
  let no_urut = "01";
  let asal_sekolah = bidang;
  
  if (bidang.startsWith("No. ") && bidang.includes(" - ")) {
    const parts = bidang.substring(4).split(" - ");
    no_urut = parts[0].trim();
    asal_sekolah = parts.slice(1).join(" - ").trim();
  }
  return { no_urut, asal_sekolah };
};

// Helper to determine category_id based on school/instansi name
const determineCategoryId = (nama: string, asal_sekolah: string): number => {
  const text = `${nama} ${asal_sekolah}`.toLowerCase();
  if (text.includes("smp") || text.includes("mts")) {
    return 1; // SMP Sederajat
  }
  return 2; // SMA/SMK/MA Sederajat
};

let speakersCache: any = null;
let speakersCacheTime = 0;

export const clearSpeakersCache = () => {
  speakersCache = null;
  speakersCacheTime = 0;
};

// GET ALL SPEAKERS (Teams)
export const getSpeakers = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    // Cache for 10 seconds
    if (speakersCache && (now - speakersCacheTime < 10000)) {
      return res.status(200).json(speakersCache);
    }

    const teams = await prisma.teams.findMany({
      orderBy: { id: "asc" }
    });
    
    // Map to frontend expected Pembicara (Speaker / Team) format
    const speakers = teams.map(f => ({
      id: f.id,
      nama: f.nama,
      bidang: `No. ${f.no_urut} - ${f.asal_sekolah}`,
      email: "",
      foto_url: f.foto_url,
      category_id: f.category_id
    }));
    
    speakersCache = speakers;
    speakersCacheTime = now;

    res.status(200).json(speakers);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data tim/peserta", error });
  }
};

// CREATE SPEAKER (Team)
export const createSpeaker = async (req: Request, res: Response) => {
  try {
    const { nama, bidang, foto_url, category_id } = req.body;
    if (!nama || !bidang) {
      return res.status(400).json({ message: "Nama dan bidang harus diisi" });
    }
    
    const { no_urut, asal_sekolah } = parseBidang(bidang);
    const final_category_id = category_id ? Number(category_id) : determineCategoryId(nama, asal_sekolah);
    
    const newTeam = await prisma.teams.create({
      data: {
        nama,
        no_urut,
        asal_sekolah,
        category_id: final_category_id,
        foto_url: foto_url || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(nama)}`
      }
    });
    
    const speaker = {
      id: newTeam.id,
      nama: newTeam.nama,
      bidang: `No. ${newTeam.no_urut} - ${newTeam.asal_sekolah}`,
      email: "",
      foto_url: newTeam.foto_url,
      category_id: newTeam.category_id
    };
    
    clearSpeakersCache();
    res.status(201).json(speaker);
  } catch (error) {
    console.error("Gagal membuat team:", error);
    res.status(500).json({ message: "Gagal membuat tim/peserta", error });
  }
};

// UPDATE SPEAKER (Team)
export const updateSpeaker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, bidang, foto_url, category_id } = req.body;
    
    const { no_urut, asal_sekolah } = parseBidang(bidang);
    const final_category_id = category_id ? Number(category_id) : determineCategoryId(nama, asal_sekolah);
    
    const updatedTeam = await prisma.teams.update({
      where: { id: Number(id) },
      data: {
        nama,
        no_urut,
        asal_sekolah,
        category_id: final_category_id,
        foto_url: foto_url !== undefined ? foto_url : undefined
      }
    });
    
    const speaker = {
      id: updatedTeam.id,
      nama: updatedTeam.nama,
      bidang: `No. ${updatedTeam.no_urut} - ${updatedTeam.asal_sekolah}`,
      email: "",
      foto_url: updatedTeam.foto_url,
      category_id: updatedTeam.category_id
    };
    
    clearSpeakersCache();
    res.status(200).json(speaker);
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui peserta", error });
  }
};

// DELETE SPEAKER (Team)
export const deleteSpeaker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.teams.delete({ where: { id: Number(id) } });
    clearSpeakersCache();
    res.status(200).json({ message: "Peserta berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus peserta", error });
  }
};