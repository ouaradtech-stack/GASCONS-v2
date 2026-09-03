import { CompanyProfile, Department, FuelDelivery, FuelExit, StockConfig, Supplier, Vehicle, VehicleCategory } from '../types';

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

/**
 * Exports a list of fuel deliveries as an Excel-compatible CSV file (with UTF-8 BOM).
 */
export function exportDeliveriesToCSV(
  deliveries: FuelDelivery[],
  getSupplierById: (id: string) => Supplier | undefined,
  filenamePrefix = 'Livraisons_Fournisseurs'
) {
  const headers = [
    'N° BL / Facture',
    'Date',
    'Heure',
    'Fournisseur',
    'Volume Reçu (Litres)',
    'Prix Unitaire (€/L)',
    'Montant Total (€)',
    'Cuve de Réception',
    'Chauffeur Citerne',
    'Immatriculation Camion',
    'Réceptionné Par',
    'Observations / Contrôle Qualité',
    'Date Enregistrement',
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = deliveries.map((del) => {
    const supplier = getSupplierById(del.supplierId);
    return [
      escapeCSV(del.deliveryNumber),
      escapeCSV(del.date),
      escapeCSV(del.time),
      escapeCSV(supplier?.name || del.supplierId),
      escapeCSV(del.quantityLiters),
      escapeCSV(del.unitPrice !== undefined ? del.unitPrice.toFixed(3) : '-'),
      escapeCSV(del.totalCost !== undefined ? del.totalCost.toFixed(2) : '-'),
      escapeCSV(del.tankName || 'Cuve Principale'),
      escapeCSV(del.driverName || '-'),
      escapeCSV(del.truckPlate || '-'),
      escapeCSV(del.receiverName),
      escapeCSV(del.notes || ''),
      escapeCSV(del.createdAt || '-'),
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `${filenamePrefix}_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports a single fuel delivery reception slip as a standalone printable HTML receipt.
 */
export function downloadDeliveryVoucherHTML(
  delivery: FuelDelivery,
  supplier: Supplier | undefined,
  stockConfig: StockConfig,
  companyProfile: CompanyProfile
) {
  const dateFormatted = delivery.date
    ? new Date(delivery.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : delivery.date;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Bon de Réception Carburant N° ${delivery.deliveryNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 32px 16px;
    }
    .ticket-card {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
      padding: 32px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #047857;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .company-title {
      font-size: 20px;
      font-weight: 900;
      color: #047857;
      margin: 0 0 4px 0;
    }
    .company-subtitle {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .bl-info {
      text-align: right;
    }
    .bl-num {
      font-size: 20px;
      font-weight: 800;
      font-family: monospace;
      color: #047857;
      margin-top: 4px;
    }
    .qty-spotlight {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #86efac;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .qty-title {
      font-size: 12px;
      font-weight: 700;
      color: #166534;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .qty-val {
      font-size: 36px;
      font-weight: 900;
      font-family: monospace;
      color: #14532d;
      line-height: 1.1;
      margin: 4px 0;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .box {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      background: #f8fafc;
    }
    .box-title {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }
    .row:last-child {
      margin-bottom: 0;
    }
    .label {
      color: #64748b;
    }
    .val {
      font-weight: 600;
      color: #0f172a;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .sig-box {
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      padding: 16px;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .ticket-card {
        border: none;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="header">
      <div>
        <span class="badge">Bon de Réception Carburant</span>
        <h1 class="company-title">${companyProfile.name || 'ENTREPRISE'}</h1>
        <p class="company-subtitle">${companyProfile.legalStatus || 'Société'} • NIF/RC: ${companyProfile.taxId || 'Consommation Interne'}</p>
        <p class="company-subtitle">${companyProfile.address || ''} • ${companyProfile.phone || ''}</p>
      </div>
      <div class="bl-info">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold;">N° Bon de Livraison</div>
        <div class="bl-num">${delivery.deliveryNumber}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${dateFormatted} à ${delivery.time}</div>
      </div>
    </div>

    <div class="qty-spotlight">
      <div>
        <div class="qty-title">Volume Réceptionné Cuve</div>
        <div class="qty-val">+${delivery.quantityLiters.toLocaleString('fr-FR')} <span style="font-size: 20px;">Litres</span></div>
        <div style="font-size: 11px; color: #15803d; font-weight: 600;">Produit : Gasoil / Carburant Diesel B7</div>
      </div>
      <div style="text-align: right; border-left: 1px solid #a7f3d0; padding-left: 20px;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Montant Total BL</div>
        <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: #14532d;">
          ${delivery.totalCost ? delivery.totalCost.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €' : '-'}
        </div>
        <div style="font-size: 11px; color: #166534; font-weight: 600; margin-top: 4px;">
          P.U : ${delivery.unitPrice ? delivery.unitPrice.toFixed(3) + ' €/L' : '-'}
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <div class="box-title">Fournisseur & Transporteur</div>
        <div class="row"><span class="label">Société Fournisseur:</span><span class="val">${supplier?.name || delivery.supplierId}</span></div>
        <div class="row"><span class="label">Contact Fournisseur:</span><span class="val">${supplier?.contactName || supplier?.phone || '-'}</span></div>
        <div class="row"><span class="label">Chauffeur Citerne:</span><span class="val">${delivery.driverName || 'Non précisé'}</span></div>
        <div class="row"><span class="label">Immatriculation Camion:</span><span class="val" style="font-family: monospace;">${delivery.truckPlate || 'Standard'}</span></div>
      </div>

      <div class="box">
        <div class="box-title">Dépôt & Réception</div>
        <div class="row"><span class="label">Cuve de Dépotage:</span><span class="val">${delivery.tankName || stockConfig.tankName}</span></div>
        <div class="row"><span class="label">Capacité Cuve:</span><span class="val">${stockConfig.tankCapacity.toLocaleString('fr-FR')} L</span></div>
        <div class="row"><span class="label">Réceptionné Par:</span><span class="val" style="color: #047857;">${delivery.receiverName}</span></div>
        ${delivery.notes ? `<div class="row"><span class="label">Contrôle / Notes:</span><span class="val">${delivery.notes}</span></div>` : ''}
      </div>
    </div>

    <div class="signatures">
      <div class="sig-box">
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Le Livreur / Chauffeur Citerne</div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 4px;">${delivery.driverName || supplier?.name || 'Chauffeur'}</div>
        </div>
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 6px; font-size: 10px; color: #64748b; font-style: italic;">
          Signature & Émargement Livreur
        </div>
      </div>

      <div class="sig-box">
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Le Responsable Réceptionnaire</div>
          <div style="font-size: 12px; font-weight: 700; color: #047857; margin-top: 4px;">${delivery.receiverName}</div>
        </div>
        <div style="border-top: 1px dashed #a7f3d0; padding-top: 6px; font-size: 10px; color: #047857; font-weight: bold;">
          CONFORME AU DÉPOTAGE ✓
        </div>
      </div>
    </div>

    <div class="footer">
      <span>${companyProfile.name || 'Gascons'} • Gestion & Contrôle des Approvisionnements Carburant</span>
      <span style="display: block; margin-top: 2px;">Édité le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</span>
    </div>
  </div>
</body>
</html>`;

  downloadFile(html, `Bon_Reception_${delivery.deliveryNumber}_${delivery.date}.html`, 'text/html;charset=utf-8');
}
