import PDFDocument from 'pdfkit';
import type { RapportData } from './rapports.types.js';

const formatDate = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleDateString('fr-FR');
};

const formatDateTime = (date: Date): string =>
  date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export const generateRapportPdf = (data: RapportData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica');
    doc.fillColor('#000000');

    const { periode, kpi, activite } = data;

    doc.fontSize(18).text('Ministere des Forces Armees', { align: 'center' });
    doc.fontSize(14).text("Parc Informatique - Rapport d'activite", { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Periode : ${periode.label}`, { align: 'center' });
    doc.fontSize(10).text(`Genere le ${formatDateTime(data.generatedAt)} par ${data.generatedBy}`, {
      align: 'center',
    });
    doc.moveDown(1.5);

    doc.fontSize(13).text('1. Synthese du parc (etat actuel)', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Materiels actifs : ${kpi.totalMateriels}`);
    doc.text(`En service : ${kpi.materielsEnService} | En stock : ${kpi.materielsEnStock}`);
    doc.text(`En maintenance : ${kpi.materielsEnMaintenance} | Hors service : ${kpi.materielsHorsService}`);
    doc.text(`Taux de disponibilite : ${kpi.tauxDisponibilite} %`);
    doc.text(`Tickets ouverts : ${kpi.ticketsOuverts} | En cours : ${kpi.ticketsEnCours}`);
    doc.text(`Maintenances en cours : ${kpi.maintenancesEnCours}`);
    doc.text(`Affectations actives : ${kpi.affectationsActives}`);
    doc.moveDown();

    doc.fontSize(13).text(`2. Activite - ${periode.label}`, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Tickets crees : ${activite.ticketsCrees} | Resolus : ${activite.ticketsResolus} | Fermes : ${activite.ticketsFermes}`);
    doc.text(`Maintenances demarrees : ${activite.maintenancesDemarrees} | Terminees : ${activite.maintenancesTerminees}`);
    doc.text(`  - Preventives : ${activite.maintenancesPreventives} | Correctives : ${activite.maintenancesCorrectives}`);
    doc.text(`Affectations : ${activite.affectationsCrees} creees | ${activite.affectationsTerminees} cloturees`);
    doc.moveDown();

    if (data.tickets.length > 0) {
      doc.fontSize(13).text('3. Tickets (extrait)', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(9);
      for (const ticket of data.tickets.slice(0, 20)) {
        doc.text(
          `${ticket.numeroTicket} - ${ticket.titre} [${ticket.statut}/${ticket.priorite}] - ${formatDate(ticket.dateCreation)}`,
        );
      }
      doc.moveDown();
    }

    if (data.maintenances.length > 0) {
      doc.fontSize(13).text('4. Maintenances (extrait)', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(9);
      for (const m of data.maintenances.slice(0, 20)) {
        doc.text(
          `${m.numeroMaintenance} - ${m.titre} (${m.type}) [${m.statut}] - ${m.materielCode} - ${formatDate(m.dateDebut)} -> ${formatDate(m.dateFin)}`,
        );
      }
    }

    doc.moveDown(2);
    doc.fontSize(8).text('Document genere automatiquement - Parc Informatique MFA', {
      align: 'center',
    });

    doc.end();
  });
};
