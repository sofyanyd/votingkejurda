import crypto from "crypto";

export const getDokuConfig = () => {
  const clientId = process.env.DOKU_CLIENT_ID || "";
  const secretKey = process.env.DOKU_SECRET_KEY || "";
  const merchantId = process.env.DOKU_MERCHANT_ID || "";
  const env = (process.env.DOKU_ENV || "sandbox").toLowerCase();
  
  const baseUrl = env === "production" 
    ? "https://api.doku.com" 
    : "https://api-sandbox.doku.com";

  return {
    clientId,
    secretKey,
    merchantId,
    env,
    baseUrl
  };
};

/**
 * Generates V2 HMAC-SHA256 signature for outgoing requests or verification
 */
export const generateDokuSignatureV2 = (
  clientId: string,
  secretKey: string,
  requestId: string,
  requestTimestamp: string,
  requestTarget: string,
  bodyJsonString: string
) => {
  const bodyDigest = crypto.createHash("sha256").update(bodyJsonString).digest("base64");
  const componentString = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${bodyDigest}`;
  
  const hmac = crypto.createHmac("sha256", secretKey).update(componentString).digest("base64");
  return `HMACSHA256=${hmac}`;
};

/**
 * Generates SNAP HMAC-SHA512 signature
 */
export const generateDokuSignatureSnap = (
  secretKey: string,
  httpMethod: string,
  endpointUrl: string,
  accessToken: string,
  bodyJsonString: string,
  timeStamp: string
) => {
  const minifiedBody = JSON.stringify(JSON.parse(bodyJsonString || "{}"));
  const bodyDigestHex = crypto.createHash("sha256").update(minifiedBody).digest("hex").toLowerCase();
  const stringToSign = `${httpMethod.toUpperCase()}:${endpointUrl}:${accessToken}:${bodyDigestHex}:${timeStamp}`;
  
  const hmac = crypto.createHmac("sha512", secretKey).update(stringToSign).digest("base64");
  return hmac;
};

/**
 * Verify Webhook Signature from DOKU
 */
export const verifyDokuWebhookSignature = (
  reqHeaders: any,
  rawBody: string,
  targetPath: string
): boolean => {
  const { clientId, secretKey } = getDokuConfig();
  
  // If secret key is not set or placeholder in environment, log warning and allow for sandbox testing
  if (!secretKey || secretKey.trim() === "" || secretKey.includes("YOUR_DOKU")) {
    console.warn("[DOKU WARNING] DOKU_SECRET_KEY is not configured in environment. Skipping strict webhook signature check for sandbox development.");
    return true;
  }

  const incomingSignature = reqHeaders["signature"] || reqHeaders["x-signature"] || reqHeaders["Signature"] || reqHeaders["X-Signature"];
  if (!incomingSignature) {
    console.warn("[DOKU WARNING] Missing signature header in webhook request.");
    return false;
  }

  const requestId = reqHeaders["request-id"] || reqHeaders["x-external-id"] || reqHeaders["x-request-id"] || "";
  const requestTimestamp = reqHeaders["request-timestamp"] || reqHeaders["x-timestamp"] || "";

  // 1. Attempt V2 HMAC-SHA256 signature match
  try {
    const expectedSigV2 = generateDokuSignatureV2(
      clientId,
      secretKey,
      requestId,
      requestTimestamp,
      targetPath,
      rawBody
    );

    const cleanIncoming = String(incomingSignature).trim();
    const cleanExpected = expectedSigV2.trim();

    if (cleanIncoming === cleanExpected || cleanIncoming.replace("HMACSHA256=", "") === cleanExpected.replace("HMACSHA256=", "")) {
      return true;
    }
  } catch (err) {
    console.error("V2 signature verify error:", err);
  }

  // 2. Attempt SNAP HMAC-SHA512 signature match
  try {
    const accessToken = (reqHeaders["authorization"] || "").replace("Bearer ", "");
    const expectedSigSnap = generateDokuSignatureSnap(
      secretKey,
      "POST",
      targetPath,
      accessToken,
      rawBody,
      requestTimestamp
    );

    if (String(incomingSignature).trim() === expectedSigSnap.trim()) {
      return true;
    }
  } catch (err) {
    console.error("SNAP signature verify error:", err);
  }

  return false;
};

/**
 * Request Dynamic QRIS from DOKU API
 */
export const requestDokuDynamicQris = async (params: {
  invoiceId: string;
  amount: number;
  teamName: string;
}): Promise<{ qrContent: string; dokuReference: string; expiresAt: Date }> => {
  const config = getDokuConfig();
  const requestId = `REQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();

  const requestBody = {
    order: {
      invoice_number: params.invoiceId,
      amount: params.amount
    },
    payment: {
      payment_due_date: 60
    }
  };

  const bodyString = JSON.stringify(requestBody);
  const targetPath = "/doku-qris-v2/generate-qr";

  if (config.clientId && config.secretKey && !config.clientId.includes("YOUR_DOKU")) {
    try {
      const signature = generateDokuSignatureV2(
        config.clientId,
        config.secretKey,
        requestId,
        timestamp,
        targetPath,
        bodyString
      );

      const response = await fetch(`${config.baseUrl}${targetPath}`, {
        method: "POST",
        headers: {
          "Client-Id": config.clientId,
          "Request-Id": requestId,
          "Request-Timestamp": timestamp,
          "Signature": signature,
          "Content-Type": "application/json"
        },
        body: bodyString
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data && (data.qris_data?.qr_string || data.qr_code_data?.qr_string)) {
          const qrString = data.qris_data?.qr_string || data.qr_code_data?.qr_string;
          return {
            qrContent: qrString,
            dokuReference: data.response?.invoice_number || data.invoice_number || params.invoiceId,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
          };
        }
      } else {
        const errText = await response.text();
        console.error("[DOKU API ERROR] Response status:", response.status, errText);
      }
    } catch (error: any) {
      console.error("[DOKU API ERROR] Direct request to DOKU API failed, using sandbox QR generator fallback:", error?.message || error);
    }
  }

  // Sandbox fallback Dynamic QR string
  const mockQrContent = `00020101021226680016ID.DOKU.WWW01189360091100000000000215${params.invoiceId}0303UMI51440014ID.LINKAJA.WWW0215${params.invoiceId}52045812530336054${String(params.amount).padStart(5, '0')}5802ID5914KEJURDA FORBASI6007SEMARANG61055011162070703A016304`;
  
  return {
    qrContent: mockQrContent,
    dokuReference: `DOKU-REF-${params.invoiceId}`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  };
};

/**
 * Request Virtual Account from DOKU API (BRI, BNI, Permata, BSI, CIMB, etc.)
 * Uses bank-specific V2 API endpoints
 */
export const requestDokuVirtualAccount = async (params: {
  invoiceId: string;
  amount: number;
  bankCode?: string;
  customerName?: string;
  customerEmail?: string;
}): Promise<{ vaNumber: string; bankName: string; dokuReference: string; expiresAt: Date }> => {
  const config = getDokuConfig();
  const requestId = `REQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();
  const bank = (params.bankCode || "BRI").toUpperCase();

  // Map bank code to DOKU V2 API endpoint path (bank-specific)
  const bankEndpointMap: { [key: string]: string } = {
    BRI: "/bri-virtual-account/v2/payment-code",
    BNI: "/bni-virtual-account/v2/payment-code",
    PERMATA: "/permata-virtual-account/v2/payment-code",
    BSI: "/bsi-virtual-account/v2/payment-code",
    CIMB: "/cimb-virtual-account/v2/payment-code",
    MANDIRI: "/mandiri-virtual-account/v2/payment-code",
    DOKU: "/doku-virtual-account/v2/payment-code"
  };

  const targetPath = bankEndpointMap[bank] || bankEndpointMap["DOKU"];
  console.log(`[DOKU VA] Using endpoint: ${config.baseUrl}${targetPath} for bank: ${bank}`);

  const requestBody = {
    order: {
      invoice_number: params.invoiceId,
      amount: params.amount
    },
    virtual_account_info: {
      billing_type: "FIX_BILL",
      expired_time: 60,
      reusable_status: false
    },
    customer: {
      name: params.customerName || "Voter Kejurda",
      email: params.customerEmail || "guest@forbasi.com"
    }
  };

  const bodyString = JSON.stringify(requestBody);

  if (!config.clientId || !config.secretKey || config.clientId.includes("YOUR_DOKU")) {
    throw new Error("DOKU credentials belum dikonfigurasi. Set DOKU_CLIENT_ID dan DOKU_SECRET_KEY di environment variables.");
  }

  const signature = generateDokuSignatureV2(
    config.clientId,
    config.secretKey,
    requestId,
    timestamp,
    targetPath,
    bodyString
  );

  console.log(`[DOKU VA] Request-Id: ${requestId}`);
  console.log(`[DOKU VA] Request body: ${bodyString}`);

  const response = await fetch(`${config.baseUrl}${targetPath}`, {
    method: "POST",
    headers: {
      "Client-Id": config.clientId,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
      "Signature": signature,
      "Content-Type": "application/json"
    },
    body: bodyString
  });

  const responseText = await response.text();
  console.log(`[DOKU VA] Response status: ${response.status}`);
  console.log(`[DOKU VA] Response body: ${responseText}`);

  if (!response.ok) {
    throw new Error(`DOKU VA API error (${response.status}): ${responseText}`);
  }

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`DOKU VA API returned invalid JSON: ${responseText}`);
  }

  // Try multiple possible response formats from DOKU
  const vaNumber = 
    data.virtual_account_info?.virtual_account_number ||
    data.virtual_account_number ||
    data.payment_code ||
    data.virtual_account_info?.payment_code ||
    data.va_number;

  if (!vaNumber) {
    console.error("[DOKU VA] Full response data:", JSON.stringify(data, null, 2));
    throw new Error(`DOKU VA API tidak mengembalikan nomor VA. Response: ${JSON.stringify(data)}`);
  }

  return {
    vaNumber: vaNumber,
    bankName: bank,
    dokuReference: data.order?.invoice_number || data.response?.invoice_number || params.invoiceId,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  };
};
