const { chromium } = require('playwright');
const { t, getLanguage, getTranslations, addLanguage, getSupportedLanguages } = require('../lib/i18n.js');

const INVOICE_URL = 'https://payments.staging.tvserp.com/invoice//project/PROJ-1183?sign=rDgvaj4fhjDLtc07WcQQKytGD885Jk_Q-7RB8n1TpaI';

const ENGLISH_TRANSLATIONS = {
  "invoice": "Sales Invoice",
  "customerDetails": "Customer Details",
  "customerName": "Customer Name:",
  "phoneNumber": "Phone Number:",
  "invoiceAddress": "Invoice Address:",
  "email": "Email:",
  "editData": "Edit Data",
  "editDataHint": "Click the button to edit customer data.",
  "invoiceDetails": "Invoice Details",
  "invoiceNumber": "Invoice #:",
  "date": "Date:",
  "dueDate": "Due Date:",
  "status": "Status:",
  "pending": "Pending",
  "paid": "Paid",
  "paymentType": "Payment Type",
  "fullPayment": "Full Payment",
  "partialPayment": "Partial Payment",
  "paymentHistory": "Payment History",
  "noPaymentHistory": "No payment history available",
  "subtotal": "Subtotal",
  "vat": "VAT 21% @ 21.0",
  "invoiceTotal": "Invoice total",
  "creditCard": "Credit card",
  "debitCard": "Debit card",
  "ideal": "iDEAL",
  "bankTransfer": "Bank transfer",
  "processingFee": "+ 2.8% Processing card fee",
  "instant": "(instant)",
  "businessDays": "(may take 1-3 business days)"
};

const TRANSLATION_MAPPINGS = [
  { dutch: "Verkoopfactuur", english: "Sales Invoice" },
  { dutch: "Klantgegevens", english: "Customer Details" },
  { dutch: "Klantnaam:", english: "Customer Name:" },
  { dutch: "Telefoonnummer:", english: "Phone Number:" },
  { dutch: "Factuuradres:", english: "Invoice Address:" },
  { dutch: "Email:", english: "Email:" },
  { dutch: "Klik op de knop om klantgegevens te bewerken.", english: "Click the button to edit customer data." },
  { dutch: "Gegevens bewerken", english: "Edit Data" },
  { dutch: "Factuurgegevens", english: "Invoice Details" },
  { dutch: "Verkoopfactuur#:", english: "Invoice #:" },
  { dutch: "Datum:", english: "Date:" },
  { dutch: "Vervaldatum:", english: "Due Date:" },
  { dutch: "Toestand:", english: "Status:" },
  { dutch: "Beschrijving", english: "Description" },
  { dutch: "Hoeveelheid", english: "Quantity" },
  { dutch: "Tarief", english: "Rate" },
  { dutch: "Bedrag", english: "Amount" },
  { dutch: "Subtotal", english: "Subtotal" },
  { dutch: "Invoice total", english: "Invoice total" },
  { dutch: "Full Payment", english: "Full Payment" },
  { dutch: "Partial Payment", english: "Partial Payment" },
  { dutch: "Payment History", english: "Payment History" },
  { dutch: "No payment history available", english: "No payment history available" },
];

async function applyEnglishTranslations(page) {
  await page.evaluate((mappings) => {
    const dutchToEnglish = {};
    mappings.forEach(m => {
      dutchToEnglish[m.dutch.toLowerCase()] = m.english;
    });

    function translateElement(el) {
      if (!el) return;
      const text = el.textContent?.trim();
      if (!text) return;
      
      const lowerText = text.toLowerCase();
      if (dutchToEnglish[lowerText]) {
        el.textContent = el.textContent.replace(text, dutchToEnglish[lowerText]);
      }
    }

    function walkAndTranslate(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text && dutchToEnglish[text.toLowerCase()]) {
          node.textContent = node.textContent.replace(text, dutchToEnglish[text.toLowerCase()]);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
          translateElement(node);
          node.childNodes.forEach(walkAndTranslate);
        }
      }
    }

    document.body.childNodes.forEach(walkAndTranslate);
  }, TRANSLATION_MAPPINGS);
}

async function showEnglishVersion() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log(`🌐 Navigating to: ${INVOICE_URL}`);
    await page.goto(INVOICE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`📝 Applying English translations...`);
    await applyEnglishTranslations(page);
    
    console.log(`✅ English translations applied!`);
    console.log(`\n🖼️ Taking screenshot of English version...\n`);
    
    await page.screenshot({ path: 'invoice-english.png', fullPage: true });
    console.log(`📸 Screenshot saved to: invoice-english.png`);
    
    console.log(`\n⚠️ Browser will remain open for you to view the English version.`);
    console.log(`Press Ctrl+C to close when done.`);
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

showEnglishVersion();
