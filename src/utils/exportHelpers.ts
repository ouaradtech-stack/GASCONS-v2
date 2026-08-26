import { CompanyProfile, Department, FuelExit, StockConfig, Vehicle, VehicleCategory } from '../types';

/**
 * Downloads a string content as a file with the given filename and mime-type.
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a list of fuel exits as an Excel-compatible CSV file (with UTF-8 BOM).
 */
export function exportExitsToCSV(
  exits: FuelExit[],
  getVehicleById: (id: string) => Vehicle | undefined,
  getCategoryById: (id: string) => VehicleCategory | undefined,
  getDepartmentById: (id: string) => Department | undefined,
  filenamePrefix = 'Sorties_Gasoil'
) {
  const headers = [
    'N° Ticket',
    'Date',
    'Heure',
    'Véhicule / Engin',
    'Immatriculation',
    'Catégorie',
    'Unité',
    'Volume (Litres)',
    'Ancien Index',
    'Nouvel Index',
    'Différence (km/h)',
    'Consommation Calculée',
    'Unité Conso',
    'Demandeur / Chauffeur',
    'Pompiste / Opérateur',
    'Département / Chantier',
    'Motif / Destination',
    'Signature Numérique',
    'Notes',
    'Date Enregistrement',
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = exits.map((exit) => {
    const vehicle = getVehicleById(exit.vehicleId);
    const category = getCategoryById(exit.categoryId);
    const department = getDepartmentById(exit.departmentId);
    const isHours = (vehicle?.unitType || category?.unitType) === 'HEURES';

    return [
      escapeCSV(exit.ticketNumber),
      escapeCSV(exit.date),
      escapeCSV(exit.time),
      escapeCSV(vehicle?.name || exit.vehicleId),
      escapeCSV(vehicle?.plateNumber || '-'),
      escapeCSV(category?.name || '-'),
      escapeCSV(isHours ? 'Heures' : 'KM'),
      escapeCSV(exit.quantityLiters),
      escapeCSV(exit.previousReading),
      escapeCSV(exit.currentReading),
      escapeCSV(exit.distanceOrHours),
      escapeCSV(exit.calculatedConsumption > 0 ? exit.calculatedConsumption.toFixed(2) : '-'),
      escapeCSV(isHours ? 'L/h' : 'L/100km'),
      escapeCSV(exit.requesterName),
      escapeCSV(exit.pumpOperatorName),
      escapeCSV(department?.name || '-'),
      escapeCSV(exit.purpose || '-'),
      escapeCSV(exit.signatureDataUrl ? 'Oui (Validé)' : 'Non'),
      escapeCSV(exit.notes || ''),
      escapeCSV(exit.createdAt),
    ].join(';');
  });

  // UTF-8 BOM for Excel
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `${filenamePrefix}_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports a single fuel exit as a standalone printable receipt / HTML file.
 */
export function downloadVoucherHTML(
  exit: FuelExit,
  vehicle: Vehicle | undefined,
  category: VehicleCategory | undefined,
  department: Department | undefined,
  stockConfig: StockConfig,
  companyProfile?: CompanyProfile
) {
  const isHours = vehicle?.unitType === 'HEURES';
  const unitLabel = isHours ? 'Heures (h)' : 'Kilomètres (km)';
  const consoUnit = isHours ? 'L/h' : 'L/100km';
  const compName = companyProfile?.name || 'GASCONS';
  const compLogo = companyProfile?.logoUrl;
  const compTagline = companyProfile?.headerTagline || 'Gestion & Contrôle Carburant';
  const compTax = companyProfile?.taxId ? `NIF/RC: ${companyProfile.taxId}` : '';

  const logoHTML = compLogo && compLogo.startsWith('data:')
    ? `<img src="${compLogo}" alt="Logo" style="max-height: 42px; max-width: 120px; object-fit: contain; margin-right: 12px; vertical-align: middle;" />`
    : '';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bon de Sortie Gasoil - ${exit.ticketNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 30px;
      margin: 0;
    }
    .ticket-card {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 22px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-left: 8px;
    }
    .ticket-badge {
      text-align: right;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 14px;
      border-radius: 8px;
    }
    .ticket-num {
      font-family: monospace;
      font-size: 18px;
      font-weight: 900;
      color: #1e3a8a;
    }
    .qty-spotlight {
      background: #fef3c7;
      border: 1.5px solid #f59e0b;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .qty-title {
      font-size: 12px;
      font-weight: 700;
      color: #78350f;
      text-transform: uppercase;
    }
    .qty-val {
      font-size: 32px;
      font-weight: 900;
      font-family: monospace;
      color: #451a03;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
    }
    .box-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 6px;
    }
    .label { color: #64748b; }
    .val { font-weight: 600; color: #0f172a; }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 20px;
    }
    .sig-box {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px;
      min-height: 110px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sig-img {
      max-height: 48px;
      object-fit: contain;
    }
    .footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .ticket-card { box-shadow: none; border-color: #94a3b8; }
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="header">
      <div>
        <div class="brand">
          ${logoHTML}
          <span>${compName}</span>
          <span class="badge">Carburant</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 4px; font-weight: 500;">
          ${compTagline} ${compTax ? '• ' + compTax : ''}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          Cuve: <strong>${stockConfig.tankName || 'Cuve Principale'}</strong> — ${stockConfig.location || 'Site Central'}
        </div>
      </div>
      <div class="ticket-badge">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold;">Bon de Sortie N°</div>
        <div class="ticket-num">${exit.ticketNumber}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${exit.date} à ${exit.time}</div>
      </div>
    </div>

    <div class="qty-spotlight">
      <div>
        <div class="qty-title">Quantité Gasoil Distribuée</div>
        <div class="qty-val">${exit.quantityLiters.toLocaleString('fr-FR')} <span style="font-size: 20px;">Litres</span></div>
        <div style="font-size: 11px; color: #92400e;">Produit: Gasoil / Diesel B7 Standard</div>
      </div>
      <div style="text-align: right; border-left: 1px solid #fde68a; padding-left: 16px;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Consommation</div>
        <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: #1e293b;">
          ${exit.calculatedConsumption > 0 ? exit.calculatedConsumption.toFixed(2) : '-'} <span style="font-size: 12px;">${consoUnit}</span>
        </div>
        <div style="font-size: 11px; color: #16a34a; font-weight: bold; margin-top: 4px;">✓ Conforme</div>
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <div class="box-title">Véhicule & Affectation</div>
        <div class="row"><span class="label">Immatriculation:</span><span class="val" style="font-family: monospace;">${vehicle?.plateNumber || exit.vehicleId}</span></div>
        <div class="row"><span class="label">Désignation:</span><span class="val">${vehicle?.name || '-'}</span></div>
        <div class="row"><span class="label">Catégorie:</span><span class="val">${category?.name || '-'}</span></div>
        <div class="row"><span class="label">Département:</span><span class="val">${department?.name || '-'}</span></div>
        ${exit.purpose ? `<div class="row"><span class="label">Motif:</span><span class="val">${exit.purpose}</span></div>` : ''}
      </div>

      <div class="box">
        <div class="box-title">Relevé des Index (${unitLabel})</div>
        <div class="row"><span class="label">Index Précédent:</span><span class="val">${exit.previousReading.toLocaleString('fr-FR')}</span></div>
        <div class="row"><span class="label">Index Actuel:</span><span class="val" style="color: #1e3a8a;">${exit.currentReading.toLocaleString('fr-FR')}</span></div>
        <div class="row"><span class="label">Différence:</span><span class="val" style="color: #16a34a;">+${exit.distanceOrHours.toLocaleString('fr-FR')}</span></div>
        <div class="row"><span class="label">Réservoir Véhicule:</span><span class="val">${vehicle?.tankCapacity ? vehicle.tankCapacity + ' L' : '-'}</span></div>
        ${exit.notes ? `<div class="row"><span class="label">Notes:</span><span class="val">${exit.notes}</span></div>` : ''}
      </div>
    </div>

    <div class="signatures">
      <div class="sig-box">
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Pompiste / Opérateur</div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 4px;">${exit.pumpOperatorName || 'Agent Dépôt'}</div>
        </div>
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 6px; font-size: 10px; color: #16a34a; font-weight: bold;">
          VISA DÉPÔT VALIDÉ ✓
        </div>
      </div>

      <div class="sig-box">
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Demandeur / Chauffeur</div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 4px;">${exit.requesterName}</div>
        </div>
        ${
          exit.signatureDataUrl
            ? `<div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 2px; text-align: center;"><img class="sig-img" src="${exit.signatureDataUrl}" alt="Signature" /></div>`
            : `<div style="font-size: 11px; color: #94a3b8; font-style: italic; border: 1px dashed #cbd5e1; border-radius: 6px; height: 40px; display: flex; align-items: center; justify-content: center;">Signature manuscrite</div>`
        }
      </div>
    </div>

    <div class="footer">
      <span>Gascons v1.0 • Gestion et Contrôle des Sorties de Carburant</span>
      <span>Édité le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</span>
    </div>
  </div>
  <script>
    window.onload = function() {
      // Auto-focus or ready
    };
  </script>
</body>
</html>`;

  downloadFile(html, `Bon_${exit.ticketNumber}_${exit.date}.html`, 'text/html;charset=utf-8');
}
