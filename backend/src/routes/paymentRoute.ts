import { Router } from "express";
import { 
  createDokuPayment, 
  dokuWebhook, 
  checkWebhookHealth,
  manualSyncPayment,
  getPaymentStatus 
} from "../controllers/dokuController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Endpoint DOKU Dynamic QRIS & VA Payment Flow
router.post("/doku/create", createDokuPayment);
router.post("/doku/webhook", dokuWebhook);
router.get("/doku/webhook", checkWebhookHealth);
router.post("/sync/:invoiceId", requireAdmin, manualSyncPayment);
router.get("/status/:invoiceId", getPaymentStatus);

export default router;
