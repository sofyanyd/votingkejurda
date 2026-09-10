import { Router } from "express";
import { 
  createDokuPayment, 
  dokuWebhook, 
  getPaymentStatus 
} from "../controllers/dokuController.js";

const router = Router();

// Endpoint DOKU Dynamic QRIS Payment Flow
router.post("/doku/create", createDokuPayment);
router.post("/doku/webhook", dokuWebhook);
router.get("/status/:invoiceId", getPaymentStatus);

export default router;
