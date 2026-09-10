import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requestDokuDynamicQris, requestDokuVirtualAccount, requestDokuCheckout, verifyDokuWebhookSignature } from "../lib/doku.js";
import { clearLeaderboardCache, IS_VOTING_CLOSED } from "./voteController.js";

const DEFAULT_PRICE_PER_VOTE = Number(process.env.PRICE_PER_VOTE) || 2000;

/**
 * POST /api/payment/doku/create
 * Creates transaction in DB and requests Dynamic QRIS or Virtual Account from DOKU
 */
export const createDokuPayment = async (req: Request, res: Response) => {
  try {
    if (IS_VOTING_CLOSED) {
      return res.status(400).json({ message: "Voting telah ditutup. Pembelian suara baru tidak diizinkan." });
    }

    const { teamId, quantity, cart, voterEmail, paymentMethod, bankCode } = req.body;
    const email = voterEmail && typeof voterEmail === "string" ? voterEmail.trim() : "guest@forbasi.com";
    const selectedMethod = (paymentMethod || "VA").toUpperCase(); // Default to VA for instant active payment

    // Support both single team selection and cart array
    let itemsToProcess: { teamId: number; quantity: number }[] = [];

    if (cart && Array.isArray(cart) && cart.length > 0) {
      for (const c of cart) {
        const tid = Number(c.teamId || c.id);
        const qty = Number(c.quantity || c.qty);
        if (isNaN(tid) || isNaN(qty) || !Number.isInteger(qty) || qty <= 0 || qty > 100000) {
          return res.status(400).json({ message: "Data keranjang vote tidak valid (jumlah harus bilangan bulat positif max 100.000)" });
        }
        itemsToProcess.push({ teamId: tid, quantity: qty });
      }
    } else if (teamId !== undefined && quantity !== undefined) {
      const tid = Number(teamId);
      const qty = Number(quantity);
      if (isNaN(tid) || isNaN(qty) || !Number.isInteger(qty) || qty <= 0 || qty > 100000) {
        return res.status(400).json({ message: "ID Tim dan jumlah vote harus valid (bilangan bulat positif max 100.000)" });
      }
      itemsToProcess.push({ teamId: tid, quantity: qty });
    } else {
      return res.status(400).json({ message: "Wajib menyertakan teamId & quantity atau cart" });
    }

    // Validate teams exist in DB and calculate total amount on backend ONLY
    let totalVotesCount = 0;
    let primaryTeam: any = null;

    for (const item of itemsToProcess) {
      const teamExists = await prisma.teams.findUnique({
        where: { id: item.teamId }
      });
      if (!teamExists) {
        return res.status(404).json({ message: `Tim dengan ID ${item.teamId} tidak ditemukan` });
      }
      if (!primaryTeam) primaryTeam = teamExists;
      totalVotesCount += item.quantity;
    }

    const pricePerVote = DEFAULT_PRICE_PER_VOTE;
    const totalAmount = totalVotesCount * pricePerVote;

    if (selectedMethod === "VA" && totalAmount < 10000) {
      return res.status(400).json({ 
        message: "Minimal pembelian untuk Virtual Account adalah 5 vote (Rp 10.000) sesuai regulasi perbankan." 
      });
    }

    // Generate unique invoice number: e.g. KJDA-2026-84920412
    const invoiceId = `KJDA-2026-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Create transaction record in DB with PENDING status
    const createdTx = await prisma.transactions.create({
      data: {
        code: invoiceId,
        invoice_id: invoiceId,
        team_id: itemsToProcess[0].teamId,
        votes_count: totalVotesCount,
        price_per_vote: pricePerVote,
        amount: totalAmount,
        voter_email: email,
        status: "PENDING",
        grand_total: totalAmount
      }
    });

    let dokuResult: any = null;

    if (selectedMethod === "VA") {
      const requestedBank = (bankCode || "PERMATA").toUpperCase();
      const vaRes = await requestDokuVirtualAccount({
        invoiceId,
        amount: totalAmount,
        bankCode: requestedBank,
        customerEmail: email
      });

      dokuResult = {
        paymentMethod: "VA",
        vaNumber: vaRes.vaNumber,
        bankName: vaRes.bankName,
        howToPayPage: vaRes.howToPayPage || undefined,
        dokuReference: vaRes.dokuReference,
        expiresAt: vaRes.expiresAt,
        qrContent: `VA:${vaRes.bankName}:${vaRes.vaNumber}`
      };
    } else {
      const qrisRes = await requestDokuDynamicQris({
        invoiceId,
        amount: totalAmount,
        teamName: primaryTeam ? primaryTeam.nama : "KEJURDA FORBASI"
      });

      dokuResult = {
        paymentMethod: "QRIS",
        qrContent: qrisRes.qrContent,
        dokuReference: qrisRes.dokuReference,
        expiresAt: qrisRes.expiresAt
      };
    }

    // Save QR / VA content & DOKU reference into DB
    await prisma.transactions.update({
      where: { id: createdTx.id },
      data: {
        qr_content: dokuResult.qrContent,
        doku_reference: dokuResult.dokuReference,
        expires_at: dokuResult.expiresAt
      }
    });

    // Return ONLY safe information to frontend
    return res.status(200).json({
      invoiceId: invoiceId,
      amount: totalAmount,
      quantity: totalVotesCount,
      pricePerVote: pricePerVote,
      status: "PENDING",
      paymentMethod: dokuResult.paymentMethod,
      vaNumber: dokuResult.vaNumber || undefined,
      bankName: dokuResult.bankName || undefined,
      howToPayPage: dokuResult.howToPayPage || undefined,
      qrContent: dokuResult.qrContent,
      expiresAt: dokuResult.expiresAt.toISOString()
    });

  } catch (error: any) {
    console.error("Gagal membuat pembayaran DOKU:", error);
    return res.status(500).json({ message: error.message || "Gagal membuat transaksi pembayaran" });
  }
};


/**
 * POST /api/payment/doku/webhook
 * Handles payment notification webhook from DOKU for both Virtual Account and QRIS
 */
export const dokuWebhook = async (req: Request, res: Response) => {
  try {
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const targetPath = req.originalUrl || req.url || "/api/payment/doku/webhook";

    // 1. Verify DOKU signature
    const isValidSignature = verifyDokuWebhookSignature(req.headers, rawBody, targetPath);
    if (!isValidSignature) {
      console.error("[DOKU WEBHOOK] Signature verification failed!");
      return res.status(401).json({ status: "FAILED", message: "Invalid Signature" });
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    console.log("[DOKU WEBHOOK RECEIVED Payload]:", JSON.stringify(payload));

    // Extract invoiceId / transaction reference from various DOKU notification payload fields
    const invoiceId = payload.order?.invoice_number || 
                      payload.invoice || 
                      payload.invoice_number || 
                      payload.transaction?.invoice_number || 
                      payload.order_id || 
                      payload.externalId || 
                      payload.doku_invoice_number ||
                      payload.virtual_account_info?.virtual_account_number;

    const dokuStatus = payload.transaction?.status || 
                       payload.status || 
                       payload.txnStatus || 
                       payload.payment_status || 
                       "SUCCESS";

    const paidAmount = Number(payload.order?.amount || payload.amount || payload.total_amount);

    if (!invoiceId) {
      return res.status(400).json({ status: "FAILED", message: "Invoice ID tidak ditemukan dalam notifikasi" });
    }

    // Check if status represents successful payment
    const isSuccessStatus = ["SUCCESS", "SUCCESSFUL", "0000", "00", "S", "PAID", "LUNAS"].includes(String(dokuStatus).toUpperCase());
    if (!isSuccessStatus) {
      console.log(`[DOKU WEBHOOK] Payment status is not success (${dokuStatus}) for invoice ${invoiceId}`);
      return res.status(200).json({ status: "SUCCESS", message: "Notification received but payment not completed" });
    }

    // 2. Find transaction in database
    const existingTx = await prisma.transactions.findFirst({
      where: {
        OR: [
          { invoice_id: String(invoiceId) },
          { code: String(invoiceId) },
          { doku_reference: String(invoiceId) }
        ]
      }
    });

    if (!existingTx) {
      console.error(`[DOKU WEBHOOK] Transaction not found for invoice: ${invoiceId}`);
      return res.status(404).json({ status: "FAILED", message: "Transaksi tidak ditemukan" });
    }

    // Verify nominal matches if paidAmount is supplied
    if (!isNaN(paidAmount) && paidAmount > 0 && paidAmount !== existingTx.amount) {
      console.warn(`[DOKU WEBHOOK WARNING] Nominal mismatch for invoice ${invoiceId}. Expected: ${existingTx.amount}, Received: ${paidAmount}`);
    }

    // 3. IDEMPOTENT DB TRANSACTION: Lock & Check if already PAID
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch transaction inside lock
      const currentTx = await tx.transactions.findUnique({
        where: { id: existingTx.id }
      });

      if (!currentTx) {
        throw new Error("Transaksi hilang saat diproses");
      }

      // Strict Idempotency Check:
      // If transaction status is already PAID or Lunas, ignore duplicate webhook!
      if (currentTx.status === "PAID" || currentTx.status === "Lunas") {
        console.log(`[DOKU WEBHOOK IDEMPOTENCY] Duplicate webhook for invoice ${invoiceId} ignored. Vote count will NOT be incremented.`);
        return { duplicate: true };
      }

      // Update transaction status to PAID
      await tx.transactions.update({
        where: { id: currentTx.id },
        data: {
          status: "PAID",
          paid_at: new Date(),
          doku_reference: payload.transaction?.id || payload.doku_grand_id || payload.reference_number || currentTx.doku_reference
        }
      });

      // Increment votes by creating tickets and vote entries in DB
      let user = await tx.users.findFirst({ where: { role: "voter" } });
      if (!user) {
        user = await tx.users.findFirst();
      }
      const userId = user ? user.id : 2;

      const teamId = currentTx.team_id;
      const qty = currentTx.votes_count;
      const cleanCode = currentTx.code;

      const CHUNK_SIZE = 500;
      for (let i = 0; i < qty; i += CHUNK_SIZE) {
        const chunkQty = Math.min(CHUNK_SIZE, qty - i);
        const ticketCodes: string[] = [];
        for (let j = 0; j < chunkQty; j++) {
          const idx = i + j;
          const ticketCode = `DOKU-TICK-${cleanCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${idx}-${Math.floor(100 + Math.random() * 900)}`;
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

      return { duplicate: false, votesAdded: qty };
    }, {
      maxWait: 15000,
      timeout: 60000
    });

    clearLeaderboardCache();

    if (result.duplicate) {
      return res.status(200).json({ status: "SUCCESS", message: "Duplicate webhook ignored (Already PAID)" });
    }

    console.log(`[DOKU WEBHOOK SUCCESS] Invoice ${invoiceId} marked as PAID. ${result.votesAdded} vote(s) added successfully!`);
    return res.status(200).json({ status: "SUCCESS", message: "Payment processed and votes incremented" });
  } catch (error: any) {
    console.error("Gagal memproses webhook DOKU:", error);
    return res.status(500).json({ status: "FAILED", message: error.message || "Internal Server Error" });
  }
};

/**
 * GET /api/payment/status/:invoiceId
 * Polling endpoint returning safe transaction status only
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice ID tidak boleh kosong" });
    }

    const tx = await prisma.transactions.findFirst({
      where: {
        OR: [
          { invoice_id: String(invoiceId) },
          { code: String(invoiceId) }
        ]
      },
      select: {
        invoice_id: true,
        code: true,
        status: true,
        amount: true,
        paid_at: true,
        qr_content: true
      }
    });

    if (!tx) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    const normalizedStatus = (tx.status === "Lunas" || tx.status === "PAID") ? "PAID" : tx.status.toUpperCase();

    return res.status(200).json({
      invoiceId: tx.invoice_id || tx.code,
      status: normalizedStatus
    });
  } catch (error: any) {
    console.error("Gagal mengecek status pembayaran:", error);
    return res.status(500).json({ message: error.message || "Gagal mengecek status transaksi" });
  }
};
