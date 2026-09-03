import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed script...");

  // 1. Clean up existing data in correct dependency order
  console.log("Cleaning up existing tables...");
  await prisma.votes.deleteMany({});
  await prisma.transactions.deleteMany({});
  await prisma.tickets.deleteMany({});
  await prisma.teams.deleteMany({});
  await prisma.users.deleteMany({});
  await prisma.categories.deleteMany({});

  console.log("Cleared existing data.");

  // 2. Insert Categories (U16, U13, U19, Purna)
  console.log("Seeding categories...");
  await prisma.categories.createMany({
    data: [
      {
        id: 1,
        nama: "U16",
        deskripsi: "Kategori Lomba untuk Pleton Usia U16",
      },
      {
        id: 2,
        nama: "U13",
        deskripsi: "Kategori Lomba untuk Pleton Usia U13",
      },
      {
        id: 3,
        nama: "U19",
        deskripsi: "Kategori Lomba untuk Pleton Usia U19",
      },
      {
        id: 4,
        nama: "Purna",
        deskripsi: "Kategori Lomba untuk Pleton Purna / Umum",
      },
    ],
  });

  // 3. Insert Users
  console.log("Seeding users...");
  await prisma.users.createMany({
    data: [
      {
        id: 1,
        name: "Administrator",
        email: "admin@gmail.com",
        password_hash: "$2b$10$Ki3//wP84SHb30WD1973zus4Urq69ex0C11AhEW8uV4UeuUzttc7S",
        role: "admin",
      },
      {
        id: 2,
        name: "Pranada Alfath",
        email: "pranadaalfath@gmail.com",
        password_hash: "$2b$10$6f1a2nfWxycrJkjhnrZZf.sPq.MKpfyi1VINL.ZCJFD3wFIZmVNLi",
        role: "voter",
      },
    ],
  });

  // 4. Insert Teams (Pleton Peserta per Kategori & Nomor Undi)
  console.log("Seeding teams...");
  let teamId = 1;
  const teamsData: any[] = [
    // ── KATEGORI U16 (Category 1) ──
    { id: teamId++, no_urut: "18", nama: "Klaten", asal_sekolah: "Klaten", foto_url: "https://via.placeholder.com/400x400.png?text=Klaten", category_id: 1 },
    { id: teamId++, no_urut: "08", nama: "Batang", asal_sekolah: "Batang", foto_url: "https://via.placeholder.com/400x400.png?text=Batang", category_id: 1 },
    { id: teamId++, no_urut: "03", nama: "Jepara", asal_sekolah: "Jepara", foto_url: "https://via.placeholder.com/400x400.png?text=Jepara", category_id: 1 },
    { id: teamId++, no_urut: "06", nama: "Banyumas", asal_sekolah: "Banyumas", foto_url: "https://via.placeholder.com/400x400.png?text=Banyumas", category_id: 1 },
    { id: teamId++, no_urut: "23", nama: "Sukoharjo", asal_sekolah: "Sukoharjo", foto_url: "https://via.placeholder.com/400x400.png?text=Sukoharjo", category_id: 1 },
    { id: teamId++, no_urut: "05", nama: "Karanganyar", asal_sekolah: "Karanganyar", foto_url: "https://via.placeholder.com/400x400.png?text=Karanganyar", category_id: 1 },
    { id: teamId++, no_urut: "16", nama: "Cilacap", asal_sekolah: "Cilacap", foto_url: "https://via.placeholder.com/400x400.png?text=Cilacap", category_id: 1 },
    { id: teamId++, no_urut: "21", nama: "Kota Pekalongan B", asal_sekolah: "Kota Pekalongan B", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Pekalongan+B", category_id: 1 },
    { id: teamId++, no_urut: "04", nama: "Kota Pekalongan A", asal_sekolah: "Kota Pekalongan A", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Pekalongan+A", category_id: 1 },
    { id: teamId++, no_urut: "15", nama: "Grobogan", asal_sekolah: "Grobogan", foto_url: "https://via.placeholder.com/400x400.png?text=Grobogan", category_id: 1 },
    { id: teamId++, no_urut: "01", nama: "Kota Semarang", asal_sekolah: "Kota Semarang", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Semarang", category_id: 1 },
    { id: teamId++, no_urut: "19", nama: "Sragen", asal_sekolah: "Sragen", foto_url: "https://via.placeholder.com/400x400.png?text=Sragen", category_id: 1 },
    { id: teamId++, no_urut: "24", nama: "Pekalongan B", asal_sekolah: "Pekalongan B", foto_url: "https://via.placeholder.com/400x400.png?text=Pekalongan+B", category_id: 1 },
    { id: teamId++, no_urut: "14", nama: "Pekalongan A", asal_sekolah: "Pekalongan A", foto_url: "https://via.placeholder.com/400x400.png?text=Pekalongan+A", category_id: 1 },
    { id: teamId++, no_urut: "12", nama: "Tegal B", asal_sekolah: "Tegal B", foto_url: "https://via.placeholder.com/400x400.png?text=Tegal+B", category_id: 1 },
    { id: teamId++, no_urut: "13", nama: "Tegal A", asal_sekolah: "Tegal A", foto_url: "https://via.placeholder.com/400x400.png?text=Tegal+A", category_id: 1 },
    { id: teamId++, no_urut: "20", nama: "Kota Tegal C", asal_sekolah: "Kota Tegal C", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Tegal+C", category_id: 1 },
    { id: teamId++, no_urut: "10", nama: "Kota Tegal B", asal_sekolah: "Kota Tegal B", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Tegal+B", category_id: 1 },
    { id: teamId++, no_urut: "25", nama: "Kota Tegal A", asal_sekolah: "Kota Tegal A", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Tegal+A", category_id: 1 },
    { id: teamId++, no_urut: "17", nama: "Surakarta", asal_sekolah: "Surakarta", foto_url: "https://via.placeholder.com/400x400.png?text=Surakarta", category_id: 1 },
    { id: teamId++, no_urut: "09", nama: "Demak", asal_sekolah: "Demak", foto_url: "https://via.placeholder.com/400x400.png?text=Demak", category_id: 1 },
    { id: teamId++, no_urut: "07", nama: "Semarang", asal_sekolah: "Semarang", foto_url: "https://via.placeholder.com/400x400.png?text=Semarang", category_id: 1 },
    { id: teamId++, no_urut: "02", nama: "Pemalang", asal_sekolah: "Pemalang", foto_url: "https://via.placeholder.com/400x400.png?text=Pemalang", category_id: 1 },
    { id: teamId++, no_urut: "11", nama: "Brebes B", asal_sekolah: "Brebes B", foto_url: "https://via.placeholder.com/400x400.png?text=Brebes+B", category_id: 1 },
    { id: teamId++, no_urut: "22", nama: "Brebes A", asal_sekolah: "Brebes A", foto_url: "https://via.placeholder.com/400x400.png?text=Brebes+A", category_id: 1 },

    // ── KATEGORI U13 (Category 2) ──
    { id: teamId++, no_urut: "07", nama: "Jepara", asal_sekolah: "Jepara", foto_url: "https://via.placeholder.com/400x400.png?text=Jepara", category_id: 2 },
    { id: teamId++, no_urut: "10", nama: "Karanganyar", asal_sekolah: "Karanganyar", foto_url: "https://via.placeholder.com/400x400.png?text=Karanganyar", category_id: 2 },
    { id: teamId++, no_urut: "06", nama: "Cilacap", asal_sekolah: "Cilacap", foto_url: "https://via.placeholder.com/400x400.png?text=Cilacap", category_id: 2 },
    { id: teamId++, no_urut: "08", nama: "Grobogan", asal_sekolah: "Grobogan", foto_url: "https://via.placeholder.com/400x400.png?text=Grobogan", category_id: 2 },
    { id: teamId++, no_urut: "09", nama: "Kota Semarang", asal_sekolah: "Kota Semarang", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Semarang", category_id: 2 },
    { id: teamId++, no_urut: "03", nama: "Sragen", asal_sekolah: "Sragen", foto_url: "https://via.placeholder.com/400x400.png?text=Sragen", category_id: 2 },
    { id: teamId++, no_urut: "01", nama: "Tegal B", asal_sekolah: "Tegal B", foto_url: "https://via.placeholder.com/400x400.png?text=Tegal+B", category_id: 2 },
    { id: teamId++, no_urut: "02", nama: "Tegal A", asal_sekolah: "Tegal A", foto_url: "https://via.placeholder.com/400x400.png?text=Tegal+A", category_id: 2 },
    { id: teamId++, no_urut: "11", nama: "Surakarta", asal_sekolah: "Surakarta", foto_url: "https://via.placeholder.com/400x400.png?text=Surakarta", category_id: 2 },
    { id: teamId++, no_urut: "05", nama: "Brebes B", asal_sekolah: "Brebes B", foto_url: "https://via.placeholder.com/400x400.png?text=Brebes+B", category_id: 2 },
    { id: teamId++, no_urut: "04", nama: "Brebes A", asal_sekolah: "Brebes A", foto_url: "https://via.placeholder.com/400x400.png?text=Brebes+A", category_id: 2 },

    // ── KATEGORI U19 (Category 3) ──
    { id: teamId++, no_urut: "08", nama: "Klaten", asal_sekolah: "Klaten", foto_url: "https://via.placeholder.com/400x400.png?text=Klaten", category_id: 3 },
    { id: teamId++, no_urut: "14", nama: "Batang B", asal_sekolah: "Batang B", foto_url: "https://via.placeholder.com/400x400.png?text=Batang+B", category_id: 3 },
    { id: teamId++, no_urut: "25", nama: "Batang A", asal_sekolah: "Batang A", foto_url: "https://via.placeholder.com/400x400.png?text=Batang+A", category_id: 3 },
    { id: teamId++, no_urut: "13", nama: "Jepara", asal_sekolah: "Jepara", foto_url: "https://via.placeholder.com/400x400.png?text=Jepara", category_id: 3 },
    { id: teamId++, no_urut: "03", nama: "Banyumas", asal_sekolah: "Banyumas", foto_url: "https://via.placeholder.com/400x400.png?text=Banyumas", category_id: 3 },
    { id: teamId++, no_urut: "27", nama: "Sukoharjo", asal_sekolah: "Sukoharjo", foto_url: "https://via.placeholder.com/400x400.png?text=Sukoharjo", category_id: 3 },
    { id: teamId++, no_urut: "23", nama: "Karanganyar", asal_sekolah: "Karanganyar", foto_url: "https://via.placeholder.com/400x400.png?text=Karanganyar", category_id: 3 },
    { id: teamId++, no_urut: "24", nama: "Cilacap", asal_sekolah: "Cilacap", foto_url: "https://via.placeholder.com/400x400.png?text=Cilacap", category_id: 3 },
    { id: teamId++, no_urut: "22", nama: "Kota Pekalongan B", asal_sekolah: "Kota Pekalongan B", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Pekalongan+B", category_id: 3 },
    { id: teamId++, no_urut: "26", nama: "Kota Pekalongan A", asal_sekolah: "Kota Pekalongan A", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Pekalongan+A", category_id: 3 },
    { id: teamId++, no_urut: "07", nama: "Grobogan", asal_sekolah: "Grobogan", foto_url: "https://via.placeholder.com/400x400.png?text=Grobogan", category_id: 3 },
    { id: teamId++, no_urut: "06", nama: "Kota Semarang", asal_sekolah: "Kota Semarang", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Semarang", category_id: 3 },
    { id: teamId++, no_urut: "04", nama: "Sragen", asal_sekolah: "Sragen", foto_url: "https://via.placeholder.com/400x400.png?text=Sragen", category_id: 3 },
    { id: teamId++, no_urut: "05", nama: "Pekalongan B", asal_sekolah: "Pekalongan B", foto_url: "https://via.placeholder.com/400x400.png?text=Pekalongan+B", category_id: 3 },
    { id: teamId++, no_urut: "21", nama: "Pekalongan A", asal_sekolah: "Pekalongan A", foto_url: "https://via.placeholder.com/400x400.png?text=Pekalongan+A", category_id: 3 },
    { id: teamId++, no_urut: "17", nama: "Tegal B", asal_sekolah: "Tegal B", foto_url: "https://via.placeholder.com/400x400.png?text=Tegal+B", category_id: 3 },
    { id: teamId++, no_urut: "11", nama: "Tegal A", asal_sekolah: "Tegal A", foto_url: "https://via.placeholder.com/400x400.png?text=Tegal+A", category_id: 3 },
    { id: teamId++, no_urut: "09", nama: "Kota Tegal C", asal_sekolah: "Kota Tegal C", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Tegal+C", category_id: 3 },
    { id: teamId++, no_urut: "12", nama: "Kota Tegal B", asal_sekolah: "Kota Tegal B", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Tegal+B", category_id: 3 },
    { id: teamId++, no_urut: "18", nama: "Kota Tegal A", asal_sekolah: "Kota Tegal A", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Tegal+A", category_id: 3 },
    { id: teamId++, no_urut: "15", nama: "Surakarta", asal_sekolah: "Surakarta", foto_url: "https://via.placeholder.com/400x400.png?text=Surakarta", category_id: 3 },
    { id: teamId++, no_urut: "10", nama: "Demak", asal_sekolah: "Demak", foto_url: "https://via.placeholder.com/400x400.png?text=Demak", category_id: 3 },
    { id: teamId++, no_urut: "02", nama: "Semarang", asal_sekolah: "Semarang", foto_url: "https://via.placeholder.com/400x400.png?text=Semarang", category_id: 3 },
    { id: teamId++, no_urut: "16", nama: "Pemalang B", asal_sekolah: "Pemalang B", foto_url: "https://via.placeholder.com/400x400.png?text=Pemalang+B", category_id: 3 },
    { id: teamId++, no_urut: "20", nama: "Pemalang A", asal_sekolah: "Pemalang A", foto_url: "https://via.placeholder.com/400x400.png?text=Pemalang+A", category_id: 3 },
    { id: teamId++, no_urut: "19", nama: "Brebes B", asal_sekolah: "Brebes B", foto_url: "https://via.placeholder.com/400x400.png?text=Brebes+B", category_id: 3 },
    { id: teamId++, no_urut: "01", nama: "Brebes A", asal_sekolah: "Brebes A", foto_url: "https://via.placeholder.com/400x400.png?text=Brebes+A", category_id: 3 },

    // ── KATEGORI PURNA (Category 4) ──
    { id: teamId++, no_urut: "06", nama: "Grobogan C", asal_sekolah: "Grobogan C", foto_url: "https://via.placeholder.com/400x400.png?text=Grobogan+C", category_id: 4 },
    { id: teamId++, no_urut: "04", nama: "Grobogan B", asal_sekolah: "Grobogan B", foto_url: "https://via.placeholder.com/400x400.png?text=Grobogan+B", category_id: 4 },
    { id: teamId++, no_urut: "05", nama: "Grobogan A", asal_sekolah: "Grobogan A", foto_url: "https://via.placeholder.com/400x400.png?text=Grobogan+A", category_id: 4 },
    { id: teamId++, no_urut: "10", nama: "Kota Semarang C", asal_sekolah: "Kota Semarang C", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Semarang+C", category_id: 4 },
    { id: teamId++, no_urut: "08", nama: "Kota Semarang B", asal_sekolah: "Kota Semarang B", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Semarang+B", category_id: 4 },
    { id: teamId++, no_urut: "01", nama: "Kota Semarang A", asal_sekolah: "Kota Semarang A", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Semarang+A", category_id: 4 },
    { id: teamId++, no_urut: "02", nama: "Surakarta", asal_sekolah: "Surakarta", foto_url: "https://via.placeholder.com/400x400.png?text=Surakarta", category_id: 4 },
    { id: teamId++, no_urut: "09", nama: "Demak C", asal_sekolah: "Demak C", foto_url: "https://via.placeholder.com/400x400.png?text=Demak+C", category_id: 4 },
    { id: teamId++, no_urut: "07", nama: "Demak B", asal_sekolah: "Demak B", foto_url: "https://via.placeholder.com/400x400.png?text=Demak+B", category_id: 4 },
    { id: teamId++, no_urut: "03", nama: "Demak A", asal_sekolah: "Demak A", foto_url: "https://via.placeholder.com/400x400.png?text=Demak+A", category_id: 4 },
  ];

  await prisma.teams.createMany({ data: teamsData });

  // 5. Insert Tickets
  console.log("Seeding tickets...");
  await prisma.tickets.createMany({
    data: [
      { id: 1, code: "TICKET-LKBB-AAAA-1111", status: "used", user_id: 2, used_at: new Date("2026-06-21T16:00:00Z") },
      { id: 2, code: "TICKET-LKBB-BBBB-2222", status: "active", user_id: 2 },
      { id: 3, code: "TICKET-LKBB-CCCC-3333", status: "active" },
      { id: 4, code: "TICKET-LKBB-DDDD-4444", status: "active" },
    ]
  });

  // 6. Insert Votes
  console.log("Seeding votes...");
  await prisma.votes.createMany({
    data: [
      { id: 1, user_id: 2, team_id: 1, ticket_id: 1, voted_at: new Date("2026-06-21T16:00:00Z") }
    ]
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
