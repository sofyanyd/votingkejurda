import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updatePurna() {
  console.log("Updating Purna teams in Neon database...");

  // Delete existing Purna teams (category_id = 4)
  await prisma.teams.deleteMany({
    where: { category_id: 4 }
  });

  console.log("Deleted old Purna teams.");

  // Reset sequence in PostgreSQL to current max id
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('teams', 'id'), COALESCE((SELECT MAX(id) FROM teams), 1));`);

  const newPurnaTeams = [
    { no_urut: "04", nama: "Grobogan C", asal_sekolah: "Grobogan C", foto_url: "https://via.placeholder.com/400x400.png?text=Grobogan+C", category_id: 4 },
    { no_urut: "02", nama: "Grobogan B", asal_sekolah: "Grobogan B", foto_url: "https://via.placeholder.com/400x400.png?text=Grobogan+B", category_id: 4 },
    { no_urut: "03", nama: "Grobogan A", asal_sekolah: "Grobogan A", foto_url: "https://via.placeholder.com/400x400.png?text=Grobogan+A", category_id: 4 },
    { no_urut: "08", nama: "Kota Semarang C", asal_sekolah: "Kota Semarang C", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Semarang+C", category_id: 4 },
    { no_urut: "06", nama: "Kota Semarang B", asal_sekolah: "Kota Semarang B", foto_url: "https://via.placeholder.com/400x400.png?text=Kota+Semarang+B", category_id: 4 },
    { no_urut: "07", nama: "Surakarta", asal_sekolah: "Surakarta", foto_url: "https://via.placeholder.com/400x400.png?text=Surakarta", category_id: 4 },
    { no_urut: "05", nama: "Demak C", asal_sekolah: "Demak C", foto_url: "https://via.placeholder.com/400x400.png?text=Demak+C", category_id: 4 },
  ];

  for (const team of newPurnaTeams) {
    await prisma.teams.create({
      data: team
    });
  }

  console.log("Purna teams updated successfully!");
}

updatePurna()
  .catch((e) => {
    console.error("Update failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
