const { chromium } = require('playwright');
const { t, getLanguage, applyTranslations, getSupportedLanguages, getTranslations } = require('../lib/i18n.js');

const INVOICE_URL = process.env.INVOICE_URL || 'https://payments.staging.tvserp.com/invoice//project/PROJ-1183?sign=rDgvaj4fhjDLtc07WcQQKytGD885Jk_Q-7RB8n1TpaI';

async function extractInvoiceData(page, lang) {
  await page.waitForLoadState('networkidle');
  
  const data = await page.evaluate((currentLang) => {
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : null;
    };
    
    const getTableData = () => {
      const rows = document.querySelectorAll('table tr');
      const items = [];
      rows.forEach((row, index) => {
        if (index === 0) return;
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
          items.push({
            sr: cells[0].textContent.trim(),
            description: cells[1].textContent.trim(),
            quantity: cells[2].textContent.trim(),
            rate: cells[3].textContent.trim(),
            amount: cells[4].textContent.trim()
          });
        }
      });
      return items;
    };
    
    return {
      invoiceTitle: document.querySelector('h1')?.textContent?.trim() || 'Invoice',
      customerDetails: {
        nameLabel: 'Customer Name',
        name: getText('[class*="Klantnaam"], [class*="customer"]') || '',
        phoneLabel: 'Phone',
        phone: getText('[class*="Telefoonnummer"], [class*="phone"]') || '',
        addressLabel: 'Address',
        address: getText('[class*="Factuuradres"], [class*="address"]') || '',
        emailLabel: 'Email',
        email: getText('[class*="Email"], [class*="email"]') || ''
      },
      invoiceInfo: {
        number: getText('[class*="Verkoopfactuur#"], [class*="invoice"]') || '',
        date: getText('[class*="Datum"], [class*="date"]') || '',
        dueDate: getText('[class*="Vervaldatum"], [class*="due"]') || '',
        status: getText('[class*="Toestand"], [class*="status"]') || ''
      },
      items: getTableData(),
      payment: {
        fullPayment: getText('[class*="Full Payment"], [class*="full"]') || 'Full Payment',
        partialPayment: getText('[class*="Partial Payment"], [class*="partial"]') || 'Partial Payment',
        subtotal: getText('[class*="Subtotal"]') || '',
        vat: getText('[class*="VAT"]') || '',
        total: getText('[class*="Invoice total"]') || ''
      },
      paymentMethods: {
        creditCard: getText('[class*="Credit card"]') || 'Credit card',
        debitCard: getText('[class*="Debit card"]') || 'Debit card',
        ideal: getText('[class*="iDEAL"]') || 'iDEAL',
        bankTransfer: getText('[class*="Bank transfer"]') || 'Bank transfer'
      },
      detectedLanguage: currentLang
    };
  }, lang);
  
  return data;
}

async function runPaymentPageTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    locale: 'en-US'
  });
  const page = await context.newPage();
  
  const result = {
    url: INVOICE_URL,
    detectedLanguage: null,
    invoiceData: null,
    success: false,
    errors: [],
    supportedLanguages: getSupportedLanguages()
  };
  
  try {
    console.log(`🌐 Navigating to: ${INVOICE_URL}`);
    await page.goto(INVOICE_URL);
    
    await page.waitForTimeout(2000);
    
    const lang = getLanguage();
    result.detectedLanguage = lang;
    
    console.log(`🔍 Detected browser language: ${lang}`);
    console.log(`📖 Current translations for ${lang}:`, JSON.stringify(getTranslations(lang), null, 2).substring(0, 500) + '...');
    
    result.invoiceData = await extractInvoiceData(page, lang);
    
    console.log(`\n✅ Page loaded successfully!`);
    console.log(`📋 Invoice Title: ${result.invoiceData.invoiceTitle}`);
    console.log(`💰 Total: ${result.invoiceData.payment.total}`);
    console.log(`💳 Payment Methods: ${Object.keys(result.invoiceData.paymentMethods).join(', ')}`);
    
    result.success = true;
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    result.errors.push(error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n📊 Result:', JSON.stringify(result, null, 2));
  return result;
}

async function runPaymentPageTestWithLanguage(targetLang) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    locale: targetLang
  });
  const page = await context.newPage();
  
  const result = {
    url: INVOICE_URL,
    testLanguage: targetLang,
    detectedLanguage: null,
    invoiceData: null,
    success: false,
    errors: []
  };
  
  try {
    console.log(`🌐 Testing with locale: ${targetLang}`);
    await page.goto(INVOICE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const lang = getLanguage();
    result.detectedLanguage = lang;
    result.invoiceData = await extractInvoiceData(page, lang);
    
    console.log(`✅ Test completed for ${targetLang}`);
    console.log(`📋 Invoice Title: ${result.invoiceData.invoiceTitle}`);
    
    result.success = true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    result.errors.push(error.message);
  } finally {
    await browser.close();
  }
  
  return result;
}

const args = process.argv.slice(2);

async function main() {
  if (args[0] === '--test-all') {
    console.log('🧪 Testing all supported languages...\n');
    const languages = getSupportedLanguages();
    for (const lang of languages) {
      console.log(`\n=== Testing ${lang} ===`);
      await runPaymentPageTestWithLanguage(lang);
    }
  } else if (args[0] && args[0] !== '--help') {
    return runPaymentPageTestWithLanguage(args[0]);
  } else {
    console.log(`
📝 Payment Page i18n Test
==========================

Usage:
  node payment-page.js                    Run default test (detects browser language)
  node payment-page.js <locale>           Test with specific locale (en, nl, de, fr, es)
  node payment-page.js --test-all         Test all supported languages
  node payment-page.js --help             Show this help

Examples:
  node payment-page.js en-US
  node payment-page.js nl-NL
  node payment-page.js --test-all

Supported languages: ${getSupportedLanguages().join(', ')}
    `);
    
    return runPaymentPageTest();
  }
}

main()
  .then(result => process.exit(result?.success ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
