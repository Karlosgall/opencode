const { chromium } = require('playwright');
const nodemailer = require('nodemailer');

const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'carlos@tvsgroup.nl',
    pass: 'gotmayyebawhesxx'
  }
};

const notifyEmail = 'karlitosgallego123@gmail.com';

async function sendErrorEmail(errorDetails) {
  const transporter = nodemailer.createTransport(emailConfig);
  
  const mailOptions = {
    from: '"Payment Test" <carlos@tvsgroup.nl>',
    to: notifyEmail,
    subject: `⚠️ ERROR EN PRUEBA DE PAGO: ${errorDetails.paymentMethod}`,
    html: `
      <h2>🔴 Error en Prueba de Pago</h2>
      <p><strong>Método de pago:</strong> ${errorDetails.paymentMethod}</p>
      <p><strong>Link:</strong> ${errorDetails.paymentLink}</p>
      <p><strong>Error:</strong> ${errorDetails.error}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>Por favor revisar el sistema de pagos.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email de error enviado a:', notifyEmail);
  } catch (emailError) {
    console.error('❌ Error enviando email:', emailError.message);
  }
}

async function runPaymentTest(paymentLink, paymentMethod) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    success: false,
    paymentLink,
    paymentMethod,
    steps: [],
    errors: []
  };

  try {
    console.log(`🔗 Navigating to payment link: ${paymentLink}`);
    results.steps.push({ step: 'navigation', status: 'started' });
    
    await page.goto(paymentLink);
    await page.waitForLoadState('networkidle');
    results.steps.push({ step: 'navigation', status: 'completed' });

    console.log('⏳ Waiting for payment options to load...');
    await page.waitForTimeout(2000);

    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    results.pageTitle = pageTitle;

    const invoiceInfo = await page.locator('text=Verkoopfactuur').count();
    if (invoiceInfo > 0) {
      console.log('✅ Invoice page loaded successfully');
      results.steps.push({ step: 'invoice_load', status: 'completed' });
    } else {
      throw new Error('Invoice page not loaded');
    }

    let methodButton;
    let methodName;
    
    if (paymentMethod === 'credit_card' || paymentMethod === 'credit card') {
      methodName = 'Credit card';
      methodButton = page.getByRole('button', { name: /Credit card/i });
    } else if (paymentMethod === 'ideal' || paymentMethod === 'iDEAL') {
      methodName = 'iDEAL';
      methodButton = page.getByRole('button', { name: /iDEAL/i });
    } else if (paymentMethod === 'debit_card' || paymentMethod === 'debit card') {
      methodName = 'Debit card';
      methodButton = page.getByRole('button', { name: /Debit card/i });
    } else if (paymentMethod === 'bank_transfer' || paymentMethod === 'bank transfer') {
      methodName = 'Bank transfer';
      methodButton = page.getByRole('button', { name: /Bank transfer/i });
    } else {
      throw new Error(`Unknown payment method: ${paymentMethod}`);
    }

    console.log(`💳 Testing payment method: ${methodName}`);
    results.steps.push({ step: 'select_method', method: methodName, status: 'started' });

    const buttonExists = await methodButton.count();
    if (buttonExists === 0) {
      throw new Error(`Payment button for ${methodName} not found`);
    }

    await methodButton.click();
    await page.waitForTimeout(2000);
    results.steps.push({ step: 'select_method', method: methodName, status: 'completed' });

    if (paymentMethod === 'credit_card' || paymentMethod === 'credit card') {
      const cardFormExists = await page.locator('text=Card Holder Name').count();
      if (cardFormExists > 0) {
        console.log('✅ Credit card form loaded successfully');
        results.steps.push({ step: 'credit_card_form', status: 'completed' });
        
        const amountTable = await page.locator('text=Amount charged now').count();
        if (amountTable > 0) {
          const amountText = await page.locator('text=Amount charged now').locator('..').locator('td:last-child').textContent();
          console.log(`💰 Amount to charge: ${amountText}`);
          results.chargeAmount = amountText;
          results.steps.push({ step: 'verify_amount', status: 'completed' });
        }
      } else {
        throw new Error('Credit card form not loaded');
      }
    } else if (paymentMethod === 'ideal' || paymentMethod === 'iDEAL') {
      const currentUrl = page.url();
      if (currentUrl.includes('ideal') || currentUrl.includes('pay.')) {
        console.log('✅ iDEAL redirect working - redirected to payment provider');
        results.steps.push({ step: 'ideal_redirect', status: 'completed' });
      } else {
        const idealFormExists = await page.locator('text=Betalen met iDEAL').count() + await page.locator('text=iDEAL').count();
        if (idealFormExists > 0) {
          console.log('✅ iDEAL payment page loaded successfully');
          results.steps.push({ step: 'ideal_form', status: 'completed' });
        }
      }
    }

    results.success = true;
    console.log('✅ Payment test completed successfully');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    results.errors.push(error.message);
    results.steps.push({ step: 'error', error: error.message, status: 'failed' });
    
    await sendErrorEmail({
      paymentLink,
      paymentMethod,
      error: error.message
    });
  } finally {
    await browser.close();
  }

  return results;
}

const args = process.argv.slice(2);
let paymentLink = '';
let paymentMethod = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--link' && args[i + 1]) {
    paymentLink = args[i + 1];
    i++;
  } else if (args[i] === '--method' && args[i + 1]) {
    paymentMethod = args[i + 1];
    i++;
  } else if (!paymentLink) {
    paymentLink = args[i];
  } else if (!paymentMethod) {
    paymentMethod = args[i];
  }
}

if (!paymentLink || !paymentMethod) {
  console.log(`
📝 Usage: node payment-test.js [options] <payment_link> <payment_method>

Options:
  --link <url>     Payment link URL
  --method <name>  Payment method (credit_card, ideal, debit_card, bank_transfer)

Examples:
  node payment-test.js "https://payments.staging.tvserp.com/invoice//project/PROJ-1137?sign=xxx" credit_card
  node payment-test.js --link "https://payments.staging.tvserp.com/invoice//project/PROJ-1137?sign=xxx" --method ideal
`);
  process.exit(1);
}

console.log('🚀 Starting Payment Test');
console.log('========================');
runPaymentTest(paymentLink, paymentMethod)
  .then(results => {
    console.log('\n📊 Test Results:');
    console.log(JSON.stringify(results, null, 2));
    process.exit(results.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
