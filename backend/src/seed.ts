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

  // 2. Insert Categories
  console.log("Seeding categories...");
  await prisma.categories.createMany({
    data: [
      {
        id: 1,
        nama: "SMP Sederajat",
        deskripsi: "Kategori Lomba untuk Pleton tingkat SMP / MTs sederajat",
      },
      {
        id: 2,
        nama: "SMA/SMK/MA Sederajat",
        deskripsi: "Kategori Lomba untuk Pleton tingkat SMA / SMK / MA sederajat",
      },
    ],
  });

  // 3. Insert Users (BCrypt hashes match credentials)
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

  // 4. Insert Teams (Pleton Peserta)
  console.log("Seeding teams...");
  await prisma.teams.createMany({
    data: [
      // SMP/MTs (Category 1)
      { id: 1, no_urut: "01", nama: "SMP N 2 Tegal", asal_sekolah: "SMP N 2 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+2+Tegal", category_id: 1 },
      { id: 2, no_urut: "02", nama: "SMP N 5 Tegal", asal_sekolah: "SMP N 5 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+5+Tegal", category_id: 1 },
      { id: 3, no_urut: "03", nama: "SMP N 7 Tegal", asal_sekolah: "SMP N 7 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+7+Tegal", category_id: 1 },
      { id: 4, no_urut: "04", nama: "SMP N 10 Tegal", asal_sekolah: "SMP N 10 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMP+N+10+Tegal", category_id: 1 },
      { id: 5, no_urut: "05", nama: "Mts Tegal", asal_sekolah: "Mts Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=Mts+Tegal", category_id: 1 },
      // SMA/SMK/MA (Category 2)
      { id: 6, no_urut: "01", nama: "SMA N 1 Tegal", asal_sekolah: "SMA N 1 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+1+Tegal", category_id: 2 },
      { id: 7, no_urut: "02", nama: "SMA N 3 Tegal", asal_sekolah: "SMA N 3 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+3+Tegal", category_id: 2 },
      { id: 8, no_urut: "03", nama: "SMA N 4 Tegal", asal_sekolah: "SMA N 4 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+4+Tegal", category_id: 2 },
      { id: 9, no_urut: "04", nama: "SMA N 5 Tegal Tim A", asal_sekolah: "SMA N 5 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+N+5+Tegal+Tim+A", category_id: 2 },
      { id: 10, no_urut: "05", nama: "SMAN 5 Tegal Tim B", asal_sekolah: "SMAN 5 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMAN+5+Tegal+Tim+B", category_id: 2 },
      { id: 11, no_urut: "06", nama: "SMK N 1 Tegal", asal_sekolah: "SMK N 1 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+N+1+Tegal", category_id: 2 },
      { id: 12, no_urut: "07", nama: "SMK N 2 Tegal", asal_sekolah: "SMK N 2 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+N+2+Tegal", category_id: 2 },
      { id: 13, no_urut: "08", nama: "SMK N 3 Tegal Tim A", asal_sekolah: "SMK N 3 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+N+3+Tegal+Tim+A", category_id: 2 },
      { id: 14, no_urut: "09", nama: "SMK N 3 Tegal Tim B", asal_sekolah: "SMK N 3 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+N+3+Tegal+Tim+B", category_id: 2 },
      { id: 15, no_urut: "10", nama: "SMK Muhammadiyah 1 Tegal", asal_sekolah: "SMK Muhammadiyah 1 Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+Muhammadiyah+1+Tegal", category_id: 2 },
      { id: 16, no_urut: "11", nama: "SMK Harber Tegal", asal_sekolah: "SMK Harber Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMK+Harber+Tegal", category_id: 2 },
      { id: 17, no_urut: "12", nama: "SUPM Tegal", asal_sekolah: "SUPM Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SUPM+Tegal", category_id: 2 },
      { id: 18, no_urut: "13", nama: "SMA Muhammadiyah Tegal", asal_sekolah: "SMA Muhammadiyah Tegal", foto_url: "https://via.placeholder.com/400x400.png?text=SMA+Muhammadiyah+Tegal", category_id: 2 },
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
