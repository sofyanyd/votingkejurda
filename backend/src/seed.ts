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

  // 2. Insert Categories (SMA, SMP, SD, Purna)
  console.log("Seeding categories...");
  await prisma.categories.createMany({
    data: [
      {
        id: 1,
        nama: "SMA Sederajat",
        deskripsi: "Kategori Lomba untuk Pleton tingkat SMA / SMK / MA sederajat",
      },
      {
        id: 2,
        nama: "SMP Sederajat",
        deskripsi: "Kategori Lomba untuk Pleton tingkat SMP / MTs sederajat",
      },
      {
        id: 3,
        nama: "SD Sederajat",
        deskripsi: "Kategori Lomba untuk Pleton tingkat SD / MI sederajat",
      },
      {
        id: 4,
        nama: "Purna",
        deskripsi: "Kategori Lomba untuk Pleton tingkat Purna / Umum",
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

  // 4. Insert Teams (Pleton Peserta per Kategori)
  console.log("Seeding teams...");
  await prisma.teams.createMany({
    data: [
      // ── SMA Sederajat (Category 1) ──
      { id: 1, no_urut: "01", nama: "SMA N 1 Tegal", asal_sekolah: "SMA N 1 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+1+Tegal", category_id: 1 },
      { id: 2, no_urut: "02", nama: "SMA N 3 Tegal", asal_sekolah: "SMA N 3 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+3+Tegal", category_id: 1 },
      { id: 3, no_urut: "03", nama: "SMA N 4 Tegal", asal_sekolah: "SMA N 4 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+4+Tegal", category_id: 1 },
      { id: 4, no_urut: "04", nama: "SMA N 5 Tegal Tim A", asal_sekolah: "SMA N 5 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+5+Tegal+Tim+A", category_id: 1 },
      { id: 5, no_urut: "05", nama: "SMAN 5 Tegal Tim B", asal_sekolah: "SMAN 5 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMAN+5+Tegal+Tim+B", category_id: 1 },
      { id: 6, no_urut: "06", nama: "SMK N 1 Tegal", asal_sekolah: "SMK N 1 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+N+1+Tegal", category_id: 1 },

      // ── SMP Sederajat (Category 2) ──
      { id: 7, no_urut: "01", nama: "SMP N 2 Tegal", asal_sekolah: "SMP N 2 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+2+Tegal", category_id: 2 },
      { id: 8, no_urut: "02", nama: "SMP N 5 Tegal", asal_sekolah: "SMP N 5 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+5+Tegal", category_id: 2 },
      { id: 9, no_urut: "03", nama: "SMP N 7 Tegal", asal_sekolah: "SMP N 7 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+7+Tegal", category_id: 2 },
      { id: 10, no_urut: "04", nama: "SMP N 10 Tegal", asal_sekolah: "SMP N 10 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+10+Tegal", category_id: 2 },

      // ── SD Sederajat (Category 3) ──
      { id: 11, no_urut: "01", nama: "SD N Mangkukusuman 1", asal_sekolah: "SD N Mangkukusuman 1", foto_url: "https://via.placeholder.com/400x400.png?text=SD+N+Mangkukusuman+1", category_id: 3 },
      { id: 12, no_urut: "02", nama: "SD N Pekauman 2", asal_sekolah: "SD N Pekauman 2", foto_url: "https://via.placeholder.com/400x400.png?text=SD+N+Pekauman+2", category_id: 3 },
      { id: 13, no_urut: "03", nama: "MI Ihsaniyah Tegal", asal_sekolah: "MI Ihsaniyah Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=MI+Ihsaniyah+Tegal", category_id: 3 },

      // ── Purna (Category 4) ──
      { id: 14, no_urut: "01", nama: "Purna Paskibraka Kota Tegal", asal_sekolah: "Purna Kota Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=Purna+Paskibraka+Tegal", category_id: 4 },
      { id: 15, no_urut: "02", nama: "Purna Garuda Wira", asal_sekolah: "Purna Garuda Wira", foto_url: "https://via.placeholder.com/400x400.png?text=Purna+Garuda+Wira", category_id: 4 },
    ]
  });

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
