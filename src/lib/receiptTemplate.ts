export interface ReceiptData {
  id: string
  tokenNumber: string
  status: string
  date: string
  timeSlot: string
  centreName: string
  centreAddress?: string
  centreDistrict?: string
  centreState?: string
  farmerName: string
  farmerId: string
  farmerPhone?: string
  farmerVillage?: string
  farmerDistrict?: string
  farmerState?: string
  crop: string
  quantity: number
  qualityGrade: string
  moistureLevel: number
  mspRate: number
  totalAmount: number
  paymentStatus: string
  transactionId: string
  bankAccountMasked: string
  ifscCode: string
  paymentDate?: string
}

function numberToWordsINR(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (n: number): string => {
    let str = ''
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '')
    } else {
      str += a[n]
    }
    return str
  }

  if (num === 0) return 'Zero Rupees Only'
  let n = Math.floor(num)
  let crore = Math.floor(n / 10000000)
  n %= 10000000
  let lakh = Math.floor(n / 100000)
  n %= 100000
  let thousand = Math.floor(n / 1000)
  n %= 1000
  let hundred = Math.floor(n / 100)
  let rest = n % 100

  let out = ''
  if (crore > 0) out += inWords(crore) + ' Crore '
  if (lakh > 0) out += inWords(lakh) + ' Lakh '
  if (thousand > 0) out += inWords(thousand) + ' Thousand '
  if (hundred > 0) out += inWords(hundred) + ' Hundred '
  if (rest > 0) {
    if (out !== '') out += 'and '
    out += inWords(rest) + ' '
  }
  return out.trim() + ' Rupees Only'
}

export function generateReceiptHtml(receipt: ReceiptData, autoPrint = false): string {
  const words = numberToWordsINR(receipt.totalAmount)
  const grossWeight = (receipt.quantity + 0.45).toFixed(2)
  const tareWeight = '0.45'
  const netWeight = receipt.quantity.toFixed(2)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Procurement Receipt - ${receipt.tokenNumber} | Mandi Marg</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      padding: 24px;
      display: flex;
      justify-content: center;
    }
    .receipt-container {
      width: 100%;
      max-width: 820px;
      background: #ffffff;
      border: 2px solid #047857;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      padding: 28px;
      position: relative;
    }
    /* National Flag Tricolor Bar */
    .tricolor-bar {
      height: 6px;
      width: 100%;
      background: linear-gradient(90deg, #ff9933 0%, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%, #138808 100%);
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #065f46;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .govt-heading {
      text-align: center;
    }
    .govt-heading h4 {
      font-size: 13px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #065f46;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .govt-heading h2 {
      font-size: 20px;
      color: #044e36;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin: 2px 0;
    }
    .govt-heading p {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
      letter-spacing: 0.8px;
    }
    .badge-voucher {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 14px;
      background-color: #ecfdf5;
      border: 1px solid #059669;
      color: #065f46;
      font-size: 11px;
      font-weight: 800;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 16px;
      font-size: 12px;
    }
    .meta-bar strong {
      color: #065f46;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .card-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }
    .card-box-header {
      background: #f1f5f9;
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #1e293b;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #cbd5e1;
    }
    .card-box-body {
      padding: 10px 12px;
      font-size: 12px;
      line-height: 1.6;
    }
    .card-box-body table {
      width: 100%;
      border-collapse: collapse;
    }
    .card-box-body td {
      padding: 3px 0;
      vertical-align: top;
    }
    .card-box-body td.label {
      width: 42%;
      color: #64748b;
      font-weight: 600;
      font-size: 11px;
    }
    .card-box-body td.val {
      font-weight: 700;
      color: #0f172a;
      font-size: 11px;
    }
    /* Weighbridge Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 12px;
    }
    .data-table th {
      background-color: #065f46;
      color: #ffffff;
      padding: 8px 10px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid #065f46;
    }
    .data-table td {
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      font-size: 11px;
    }
    .data-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .amount-highlight {
      font-size: 14px;
      font-weight: 900;
      color: #047857;
    }
    /* Payment Summary */
    .settlement-box {
      background: #fafaf9;
      border: 1.5px solid #d6d3d1;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .settlement-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .settlement-row.total {
      border-top: 2px dashed #a8a29e;
      padding-top: 8px;
      margin-top: 6px;
      font-size: 14px;
      font-weight: 900;
      color: #065f46;
    }
    .words-box {
      margin-top: 6px;
      font-size: 11px;
      color: #44403c;
      font-style: italic;
      background: #f5f5f4;
      padding: 6px 10px;
      border-radius: 4px;
    }
    /* Footer Stamps & Security */
    .verification-footer {
      display: grid;
      grid-template-columns: 140px 1fr 180px;
      gap: 16px;
      align-items: center;
      border-top: 2px solid #e2e8f0;
      padding-top: 16px;
      margin-top: 16px;
    }
    .qr-container {
      width: 100px;
      height: 100px;
      background: #ffffff;
      border: 2px solid #0f172a;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .stamp-container {
      text-align: center;
    }
    .stamp-circle {
      display: inline-block;
      border: 2px dashed #059669;
      color: #059669;
      border-radius: 50%;
      width: 90px;
      height: 90px;
      padding: 8px;
      font-size: 8px;
      font-weight: 900;
      text-transform: uppercase;
      line-height: 1.2;
      transform: rotate(-6deg);
    }
    .signatory {
      text-align: right;
      font-size: 11px;
    }
    .signatory .sign-line {
      height: 38px;
      border-bottom: 1px solid #64748b;
      margin-bottom: 4px;
    }
    .disclaimer {
      margin-top: 16px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      font-size: 9px;
      color: #64748b;
      text-align: center;
      line-height: 1.4;
    }
    /* Controls Bar */
    .actions-bar {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary {
      background: #047857;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #065f46;
    }
    .btn-outline {
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #cbd5e1;
    }
    .btn-outline:hover {
      background: #f1f5f9;
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .actions-bar {
        display: none !important;
      }
      .receipt-container {
        box-shadow: none;
        border: 1.5px solid #000000;
        max-width: 100%;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 820px;">
    <div class="actions-bar">
      <button class="btn btn-outline" onclick="window.close()">✕ Close</button>
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="receipt-container" id="receipt">
      <div class="tricolor-bar"></div>

      <div class="header-table">
        <div class="govt-heading">
          <h4>Government of India • Ministry of Agriculture & Farmers Welfare</h4>
          <h2>Mandi Marg E-Procurement Authority</h2>
          <p>National Agricultural Minimum Support Price (MSP) Direct Procurement System</p>
          <div class="badge-voucher">Form MSP-04 • Official Produce Procurement & Weighbridge Voucher</div>
        </div>
      </div>

      <div class="meta-bar">
        <div>
          <span>Receipt No: </span><strong>MM/REC/2026/${receipt.tokenNumber}</strong>
        </div>
        <div>
          <span>Token Pass: </span><strong style="color: #b45309; font-size: 13px;">${receipt.tokenNumber}</strong>
        </div>
        <div>
          <span>Date of Issue: </span><strong>${receipt.date} (${receipt.timeSlot})</strong>
        </div>
        <div>
          <span>Status: </span><strong style="color: #15803d;">COMPLETED (DBT CREDITED)</strong>
        </div>
      </div>

      <div class="grid-2">
        <!-- Farmer Details -->
        <div class="card-box">
          <div class="card-box-header">I. Farmer Beneficiary Particulars</div>
          <div class="card-box-body">
            <table>
              <tr>
                <td class="label">Farmer Name:</td>
                <td class="val">${receipt.farmerName}</td>
              </tr>
              <tr>
                <td class="label">Farmer Reg ID:</td>
                <td class="val">${receipt.farmerId}</td>
              </tr>
              <tr>
                <td class="label">Registered Phone:</td>
                <td class="val">${receipt.farmerPhone ? '+91 ' + receipt.farmerPhone : 'Verified'}</td>
              </tr>
              <tr>
                <td class="label">Village / District:</td>
                <td class="val">${receipt.farmerVillage ? receipt.farmerVillage + ', ' : ''}${receipt.farmerDistrict || receipt.centreDistrict || 'Central Mandi Area'}</td>
              </tr>
              <tr>
                <td class="label">State / Region:</td>
                <td class="val">${receipt.farmerState || receipt.centreState || 'India'}</td>
              </tr>
              <tr>
                <td class="label">Aadhaar Linked A/C:</td>
                <td class="val" style="font-family: monospace;">${receipt.bankAccountMasked}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Mandi Procurement Centre Details -->
        <div class="card-box">
          <div class="card-box-header">II. Procurement Centre & Gate Details</div>
          <div class="card-box-body">
            <table>
              <tr>
                <td class="label">Centre Name:</td>
                <td class="val">${receipt.centreName}</td>
              </tr>
              <tr>
                <td class="label">Mandi APMC Code:</td>
                <td class="val">APMC-${(receipt.centreDistrict || 'CENT').toUpperCase().slice(0, 4)}-01</td>
              </tr>
              <tr>
                <td class="label">Yard Address:</td>
                <td class="val">${receipt.centreAddress || 'Main Mandi Yard, GT Road'}</td>
              </tr>
              <tr>
                <td class="label">District / State:</td>
                <td class="val">${receipt.centreDistrict ? receipt.centreDistrict + ', ' : ''}${receipt.centreState || 'State Board'}</td>
              </tr>
              <tr>
                <td class="label">Weighbridge Scale:</td>
                <td class="val">Electronic Pitless Scale #02 (Calibrated)</td>
              </tr>
              <tr>
                <td class="label">Procurement Season:</td>
                <td class="val">Rabi & Kharif MSP 2025-26</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Weighbridge and Quality Assessment -->
      <table class="data-table">
        <thead>
          <tr>
            <th>Commodity / Crop</th>
            <th>Gross Wt (Qtl)</th>
            <th>Tare Wt (Qtl)</th>
            <th>Net Qty (Qtl)</th>
            <th>Moisture</th>
            <th>Grade</th>
            <th>MSP Rate (₹/Qtl)</th>
            <th>Total Value (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${receipt.crop}</strong></td>
            <td>${grossWeight}</td>
            <td>${tareWeight}</td>
            <td style="font-weight: 800; color: #065f46;">${netWeight} Qtl</td>
            <td>${receipt.moistureLevel}% <span style="color:#059669; font-size:9px;">(Pass ≤12%)</span></td>
            <td><strong style="color: #047857;">${receipt.qualityGrade}</strong></td>
            <td>₹ ${receipt.mspRate.toLocaleString('en-IN')}</td>
            <td class="amount-highlight">₹ ${receipt.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <!-- Financial & Settlement Breakdown -->
      <div class="settlement-box">
        <div class="settlement-row">
          <span>Gross Commodity Value (${netWeight} Quintals @ ₹ ${receipt.mspRate.toLocaleString('en-IN')}/Qtl):</span>
          <strong>₹ ${receipt.totalAmount.toLocaleString('en-IN')}.00</strong>
        </div>
        <div class="settlement-row" style="color: #64748b;">
          <span>Statutory Mandi Market Fee & Cess (Direct Procurement Exemption):</span>
          <span>₹ 0.00</span>
        </div>
        <div class="settlement-row" style="color: #64748b;">
          <span>Handling, Unloading & Cleaning Charges (Govt Borne):</span>
          <span>₹ 0.00</span>
        </div>
        <div class="settlement-row total">
          <span>Net Direct Benefit Transfer (DBT) Disbursal:</span>
          <span style="font-size: 16px;">₹ ${receipt.totalAmount.toLocaleString('en-IN')}.00</span>
        </div>
        <div class="words-box">
          <strong>Amount in Words: </strong>${words}
        </div>
      </div>

      <!-- DBT Payment Details -->
      <div class="card-box" style="margin-bottom: 16px;">
        <div class="card-box-header" style="background: #f0fdf4; color: #065f46;">III. DBT Financial Disbursal & PFMS Clearance</div>
        <div class="card-box-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <p style="font-size: 10px; color: #64748b; font-weight: 700;">PFMS TRANSACTION REFERENCE</p>
            <p style="font-size: 12px; font-family: monospace; font-weight: 800; color: #0f172a;">${receipt.transactionId}</p>
          </div>
          <div>
            <p style="font-size: 10px; color: #64748b; font-weight: 700;">PAYMENT METHOD</p>
            <p style="font-size: 12px; font-weight: 700; color: #0f172a;">Aadhaar Enabled Payment System (AEPS / DBT)</p>
          </div>
          <div>
            <p style="font-size: 10px; color: #64748b; font-weight: 700;">DESTINATION BANK & IFSC</p>
            <p style="font-size: 12px; font-weight: 700; color: #0f172a;">State Bank of India (${receipt.ifscCode})</p>
          </div>
          <div>
            <p style="font-size: 10px; color: #64748b; font-weight: 700;">DISBURSAL STATUS</p>
            <p style="font-size: 12px; font-weight: 800; color: #15803d;">✓ SUCCESS (Credited on ${receipt.paymentDate || receipt.date})</p>
          </div>
        </div>
      </div>

      <!-- Verification Footer with QR & Stamp -->
      <div class="verification-footer">
        <div class="qr-container">
          <!-- SVG QR Code Simulation -->
          <svg viewBox="0 0 100 100" width="90" height="90">
            <rect width="100" height="100" fill="#ffffff" />
            <!-- Corner Position Markers -->
            <rect x="5" y="5" width="26" height="26" fill="#000000" />
            <rect x="8" y="8" width="20" height="20" fill="#ffffff" />
            <rect x="12" y="12" width="12" height="12" fill="#000000" />

            <rect x="69" y="5" width="26" height="26" fill="#000000" />
            <rect x="72" y="8" width="20" height="20" fill="#ffffff" />
            <rect x="76" y="12" width="12" height="12" fill="#000000" />

            <rect x="5" y="69" width="26" height="26" fill="#000000" />
            <rect x="8" y="72" width="20" height="20" fill="#ffffff" />
            <rect x="12" y="76" width="12" height="12" fill="#000000" />

            <!-- Simulated Data Modules -->
            <rect x="36" y="10" width="5" height="15" fill="#000000" />
            <rect x="45" y="5" width="8" height="6" fill="#000000" />
            <rect x="56" y="12" width="7" height="12" fill="#000000" />
            <rect x="10" y="36" width="15" height="5" fill="#000000" />
            <rect x="36" y="36" width="28" height="28" fill="#000000" />
            <rect x="42" y="42" width="16" height="16" fill="#ffffff" />
            <rect x="46" y="46" width="8" height="8" fill="#047857" />
            <rect x="70" y="36" width="10" height="6" fill="#000000" />
            <rect x="85" y="45" width="10" height="15" fill="#000000" />
            <rect x="36" y="70" width="12" height="8" fill="#000000" />
            <rect x="55" y="75" width="20" height="6" fill="#000000" />
            <rect x="80" y="80" width="15" height="15" fill="#000000" />
          </svg>
        </div>

        <div class="stamp-container">
          <div class="stamp-circle">
            ★ MANDI MARG ★<br>
            GOVT OF INDIA<br>
            WEIGHBRIDGE<br>
            VERIFIED &amp; APPROVED<br>
            ${receipt.tokenNumber}
          </div>
        </div>

        <div class="signatory">
          <div class="sign-line" style="display: flex; align-items: flex-end; justify-content: flex-end;">
            <span style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 18px; color: #1e3a8a;">S. Verma (Supervisor)</span>
          </div>
          <strong>Mandi In-Charge / Superintendent</strong><br>
          <span>APMC Procurement Division</span><br>
          <span style="color: #64748b; font-size: 10px;">Digitally Authenticated</span>
        </div>
      </div>

      <div class="disclaimer">
        This is an official computer-generated electronic procurement voucher issued under the National Agricultural E-Market Framework. 
        It is valid across all banking, credit and agricultural subsidy schemes of the Union & State Governments. 
        For electronic authenticity verification, scan the QR code above or visit https://mandimarg.gov.in/verify
      </div>
    </div>
  </div>

  ${autoPrint ? `<script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>` : ''}
</body>
</html>`
}
