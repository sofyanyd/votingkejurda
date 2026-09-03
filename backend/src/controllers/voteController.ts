import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// Tentukan apakah periode voting sudah berakhir (true = ditutup, false = dibuka)
export const IS_VOTING_CLOSED = false;

let leaderboardCache: any = null;
let leaderboardCacheTime = 0;

export const clearLeaderboardCache = () => {
  leaderboardCache = null;
  leaderboardCacheTime = 0;
};

// GET LEADERBOARD STANDINGS
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    // Cache for 5 seconds
    if (leaderboardCache && (now - leaderboardCacheTime < 5000)) {
      return res.status(200).json(leaderboardCache);
    }

    const teams = await prisma.teams.findMany({
      include: {
        votes: true,
        categories: true
      }
    });

    const totalVotesOverall = teams.reduce((acc, f) => acc + f.votes.length, 0);

    // Group votes by category to calculate category totals
    const categoryTotals: { [key: number]: number } = {};
    teams.forEach(f => {
      categoryTotals[f.category_id] = (categoryTotals[f.category_id] || 0) + f.votes.length;
    });

    const standings = teams.map(f => {
      const votesCount = f.votes.length;
      const totalCatVotes = categoryTotals[f.category_id] || 0;
      const percentage = totalCatVotes > 0 ? Math.round((votesCount / totalCatVotes) * 100) : 0;
      return {
        id: f.id,
        nama: f.nama,
        instansi: f.asal_sekolah,
        category_id: f.category_id,
        category_nama: f.categories ? f.categories.nama : "Lainnya",
        votes: votesCount,
        percentage
      };
    });

    // Group teams by category to assign per-category rank
    const teamsByCategory: { [key: number]: typeof standings } = {};
    standings.forEach(item => {
      if (!teamsByCategory[item.category_id]) {
        teamsByCategory[item.category_id] = [];
      }
      teamsByCategory[item.category_id].push(item);
    });

    const finalStandings: any[] = [];
    Object.values(teamsByCategory).forEach(group => {
      // Sort descending by votes inside each category
      group.sort((a, b) => b.votes - a.votes);
      group.forEach((item, idx) => {
        finalStandings.push({
          ...item,
          categoryRank: idx + 1, // Fair rank inside category
          rank: idx + 1
        });
      });
    });

    // Sort final output by category_id then categoryRank
    finalStandings.sort((a, b) => {
      if (a.category_id !== b.category_id) return a.category_id - b.category_id;
      return a.categoryRank - b.categoryRank;
    });

    leaderboardCache = finalStandings;
    leaderboardCacheTime = now;

    res.status(200).json(finalStandings);
  } catch (error) {
    res.status(500).json({ message: "Gagal memuat papan klasemen", error });
  }
};

// GET TRANSACTION HISTORY
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transactions.findMany({
      include: {
        teams: true
      },
      orderBy: {
        id: "desc"
      }
    });

    const mapped = transactions.map(t => {
      return {
        id: t.code,
        date: t.created_at ? new Date(t.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Jakarta"
        }) + " " + new Date(t.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta"
        }) : "-",
        namaKlub: t.teams ? t.teams.nama : "Team",
        voterEmail: t.voter_email,
        votesCount: t.votes_count,
        amount: t.amount,
        kodeUnik: t.kode_unik || 0,
        grandTotal: t.grand_total || t.amount,
        status: t.status === "pending" ? "Pending" : t.status === "Lunas" ? "Lunas" : t.status === "Batal" ? "Batal" : t.status,
        createdAt: t.created_at
      };
    });

    res.status(200).json(mapped);
  } catch (error) {
    console.error("Gagal mengambil transaksi:", error);
    res.status(500).json({ message: "Gagal memuat histori transaksi", error });
  }
};

// SUBMIT VOTES (After checkout/payment - direct submission)
export const submitVotes = async (req: Request, res: Response) => {
  try {
    const { cart } = req.body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "Keranjang vote kosong atau tidak valid" });
    }

    const userId = 2; // Default voter user ID for guest checkout

    await prisma.$transaction(async (tx) => {
      for (const item of cart) {
        const teamId = Number(item.id);
        const qty = Number(item.qty);

        const teamExists = await tx.teams.findUnique({
          where: { id: teamId }
        });
        if (!teamExists) {
          throw new Error(`Tim dengan ID ${teamId} tidak ditemukan`);
        }

        // 1. Create transaction record for this team purchase
        const txCode = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
        await tx.transactions.create({
          data: {
            code: txCode,
            team_id: teamId,
            votes_count: qty,
            amount: qty * 3000,
            voter_email: "guest@forbasi.com",
            status: "Lunas"
          }
        });

        // 2. Create tickets and votes in parallel
        const votePromises = [];
        for (let i = 0; i < qty; i++) {
          const ticketCode = `TICKET-AUTO-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
          
          votePromises.push((async () => {
            const newTicket = await tx.tickets.create({
              data: {
                code: ticketCode,
                status: "used",
                user_id: userId,
                used_at: new Date()
              }
            });

            await tx.votes.create({
              data: {
                user_id: userId,
                team_id: teamId,
                ticket_id: newTicket.id
              }
            });
          })());
        }

        await Promise.all(votePromises);
      }
    }, {
      maxWait: 5000,
      timeout: 30000,
    });

    res.status(200).json({ message: "Vote berhasil dikirim!" });
  } catch (error: any) {
    console.error("Gagal melakukan voting:", error);
    res.status(500).json({ message: error.message || "Gagal memproses vote", error });
  }
};

export const requestPayment = async (req: Request, res: Response) => {
  try {
    if (IS_VOTING_CLOSED) {
      return res.status(400).json({ message: "Voting telah ditutup. Pembelian suara baru tidak diizinkan." });
    }
    const { cart } = req.body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "Keranjang vote kosong atau tidak valid" });
    }

    const paymentCode = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let totalAmount = 0;
    const voterEmail = "guest@forbasi.com";

    for (const item of cart) {
      const qty = Number(item.qty);
      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({ message: "Jumlah vote harus berupa bilangan bulat positif" });
      }

      const teamId = Number(item.id);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "ID Tim tidak valid" });
      }

      const teamExists = await prisma.teams.findUnique({
        where: { id: teamId }
      });
      if (!teamExists) {
        return res.status(400).json({ message: `Tim dengan ID ${teamId} tidak ditemukan` });
      }

      totalAmount += (qty * 3000);
    }

    const kodeUnik = 0;
    const grandTotal = totalAmount;

    for (const item of cart) {
      const teamId = Number(item.id);
      const qty = Number(item.qty);
      const amount = qty * 3000;

      await prisma.transactions.create({
        data: {
          code: `TX-${teamId}-${paymentCode}`,
          team_id: teamId,
          votes_count: qty,
          amount: amount, 
          voter_email: voterEmail,
          status: "pending",
          kode_unik: kodeUnik,      
          grand_total: grandTotal   
        }
      });
    }

    res.status(200).json({
      transactionCode: paymentCode,
      totalAmount: totalAmount,
      kodeUnik: kodeUnik,
      grandTotal: grandTotal
    });
  } catch (error: any) {
    console.error("Gagal request payment:", error);
    res.status(500).json({ message: error.message || "Gagal memproses request pembayaran" });
  }
};

export const completePayment = async (paymentCode: string) => {
  let cleanCode = paymentCode;
  if (paymentCode.startsWith("TX-")) {
    cleanCode = paymentCode.split("-").slice(2).join("-");
  }

  let user = await prisma.users.findFirst({ where: { role: "voter" } });
  if (!user) {
    user = await prisma.users.findFirst();
  }
  const userId = user ? user.id : 2;

  return await prisma.$transaction(async (tx) => {
    const updateResult = await tx.transactions.updateMany({
      where: {
        code: {
          contains: cleanCode
        },
        status: "pending"
      },
      data: {
        status: "Lunas"
      }
    });

    if (updateResult.count === 0) {
      console.log(`No pending transactions found for paymentCode: ${cleanCode}`);
      return { success: false, message: "No pending transactions found or already processed" };
    }

    const transactions = await tx.transactions.findMany({
      where: {
        code: {
          contains: cleanCode
        },
        status: "Lunas"
      }
    });

    for (const transaction of transactions) {
      const teamId = transaction.team_id;
      const qty = transaction.votes_count;

      const ticketCodes: string[] = [];
      for (let i = 0; i < qty; i++) {
        const ticketCode = `TXV-${cleanCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${i}-${Math.floor(100 + Math.random() * 900)}`;
        ticketCodes.push(ticketCode);
      }

      await tx.tickets.createMany({
        data: ticketCodes.map(code => ({
          code,
          status: "used",
          user_id: userId,
          used_at: new Date()
        }))
      });

      const createdTickets = await tx.tickets.findMany({
        where: {
          code: { in: ticketCodes }
        },
        select: { id: true }
      });

      await tx.votes.createMany({
        data: createdTickets.map(t => ({
          user_id: userId,
          team_id: teamId,
          ticket_id: t.id
        }))
      });
    }

    clearLeaderboardCache();
    return { success: true, count: transactions.length };
  }, {
    maxWait: 15000,
    timeout: 60000
  });
};

export const finalizePayment = async (req: Request, res: Response) => {
  try {
    const { transactionCode } = req.body;
    if (!transactionCode) {
      return res.status(400).json({ message: "Data penyelesaian pembayaran tidak lengkap" });
    }

    const result = await completePayment(transactionCode);
    if (!result.success) {
      const existingLunas = await prisma.transactions.findFirst({
        where: {
          code: {
            contains: transactionCode
          },
          status: "Lunas"
        }
      });
      if (existingLunas) {
        return res.status(200).json({ message: "Pembayaran terverifikasi, vote berhasil dimasukkan ke sistem!" });
      }
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: "Pembayaran terverifikasi, vote berhasil dimasukkan ke sistem!" });
  } catch (error: any) {
    console.error("Gagal memfinalisasi pembayaran:", error);
    res.status(500).json({ message: error.message || "Gagal memproses penyelesaian pembayaran", error });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: "Kode transaksi tidak boleh kosong" });
    }

    const codeStr = String(code);
    let cleanCode = codeStr;
    if (codeStr.startsWith("TX-")) {
      cleanCode = codeStr.split("-").slice(2).join("-");
    }

    const result = await prisma.$transaction(async (tx) => {
      const transactions = await tx.transactions.findMany({
        where: {
          code: {
            contains: cleanCode
          }
        }
      });

      const ticketsToDelete = await tx.tickets.findMany({
        where: {
          code: {
            contains: cleanCode
          }
        }
      });

      const ticketIds = ticketsToDelete.map((t) => t.id);

      if (ticketIds.length === 0) {
        for (const transaction of transactions) {
          if (transaction.status === "Lunas" && transaction.created_at) {
            const txTime = new Date(transaction.created_at);
            const fifteenSecondsBefore = new Date(txTime.getTime() - 15000);
            const fifteenSecondsAfter = new Date(txTime.getTime() + 15000);

            const oldVotes = await tx.votes.findMany({
              where: {
                team_id: transaction.team_id,
                voted_at: {
                  gte: fifteenSecondsBefore,
                  lte: fifteenSecondsAfter
                }
              },
              take: transaction.votes_count
            });

            const oldTicketIds = oldVotes.map((v) => v.ticket_id);
            if (oldTicketIds.length > 0) {
              ticketIds.push(...oldTicketIds);
            }
          }
        }
      }

      if (ticketIds.length > 0) {
        await tx.votes.deleteMany({
          where: {
            ticket_id: {
              in: ticketIds
            }
          }
        });

        await tx.tickets.deleteMany({
          where: {
            id: {
              in: ticketIds
            }
          }
        });
      }

      const deleteResult = await tx.transactions.deleteMany({
        where: {
          code: {
            contains: cleanCode
          }
        }
      });

      return { success: true, deletedCount: deleteResult.count };
    });

    clearLeaderboardCache();
    res.status(200).json({ message: "Transaksi dan seluruh suara terkait berhasil dihapus!", count: result.deletedCount });
  } catch (error: any) {
    console.error("Gagal menghapus transaksi:", error);
    res.status(500).json({ message: error.message || "Gagal menghapus transaksi", error });
  }
};

export const submitOfflineVotes = async (req: Request, res: Response) => {
  try {
    const { finalistId, votesCount, voterEmail } = req.body;
    
    const teamIdNum = Number(finalistId);
    const votesCountNum = Number(votesCount);

    if (isNaN(teamIdNum) || isNaN(votesCountNum) || votesCountNum <= 0) {
      return res.status(400).json({ message: "ID Tim atau Jumlah Vote tidak valid" });
    }

    const teamExists = await prisma.teams.findUnique({
      where: { id: teamIdNum }
    });
    if (!teamExists) {
      return res.status(404).json({ message: "Tim tidak ditemukan" });
    }

    const email = voterEmail || "offline@forbasi.com";
    const paymentCode = `OFFLINE-${Date.now()}`;
    const transactionCode = `TX-${teamIdNum}-${paymentCode}`;

    let user = await prisma.users.findFirst({ where: { role: "voter" } });
    if (!user) {
      user = await prisma.users.findFirst();
    }
    const userId = user ? user.id : 2;

    await prisma.$transaction(async (tx) => {
      await tx.transactions.create({
        data: {
          code: transactionCode,
          team_id: teamIdNum,
          votes_count: votesCountNum,
          amount: votesCountNum * 3000,
          voter_email: email,
          status: "Lunas",
          kode_unik: 0,
          grand_total: votesCountNum * 3000
        }
      });

      const ticketCodes: string[] = [];
      for (let i = 0; i < votesCountNum; i++) {
        const ticketCode = `TXV-${paymentCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${i}-${Math.floor(100 + Math.random() * 900)}`;
        ticketCodes.push(ticketCode);
      }

      await tx.tickets.createMany({
        data: ticketCodes.map(code => ({
          code,
          status: "used",
          user_id: userId,
          used_at: new Date()
        }))
      });

      const createdTickets = await tx.tickets.findMany({
        where: {
          code: { in: ticketCodes }
        },
        select: { id: true }
      });

      await tx.votes.createMany({
        data: createdTickets.map(t => ({
          user_id: userId,
          team_id: teamIdNum,
          ticket_id: t.id
        }))
      });
    }, {
      maxWait: 15000,
      timeout: 60000
    });

    clearLeaderboardCache();
    res.status(200).json({ message: "Vote offline berhasil dimasukkan ke sistem!", success: true });
  } catch (error: any) {
    console.error("Gagal submit vote offline:", error);
    res.status(500).json({ message: error.message || "Gagal memproses vote offline" });
  }
};