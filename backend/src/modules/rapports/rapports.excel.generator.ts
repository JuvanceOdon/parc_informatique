import ExcelJS from 'exceljs';
import type { RapportData } from './rapports.types.js';

const formatDate = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleDateString('fr-FR');
};

const styleHeader = (row: ExcelJS.Row): void => {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
};

export const generateRapportExcel = async (data: RapportData): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Parc Informatique MFA';
  workbook.created = data.generatedAt;

  const synthese = workbook.addWorksheet('Synthèse');
  synthese.columns = [
    { header: 'Indicateur', key: 'indicateur', width: 40 },
    { header: 'Valeur', key: 'valeur', width: 20 },
  ];
  styleHeader(synthese.getRow(1));

  synthese.addRow({ indicateur: 'Période', valeur: data.periode.label });
  synthese.addRow({ indicateur: 'Généré par', valeur: data.generatedBy });
  synthese.addRow({ indicateur: 'Matériels actifs', valeur: data.kpi.totalMateriels });
  synthese.addRow({ indicateur: 'Taux de disponibilité (%)', valeur: data.kpi.tauxDisponibilite });
  synthese.addRow({ indicateur: 'Tickets ouverts', valeur: data.kpi.ticketsOuverts });
  synthese.addRow({ indicateur: 'Maintenances en cours', valeur: data.kpi.maintenancesEnCours });
  synthese.addRow({ indicateur: 'Tickets créés (période)', valeur: data.activite.ticketsCrees });
  synthese.addRow({ indicateur: 'Tickets résolus (période)', valeur: data.activite.ticketsResolus });
  synthese.addRow({
    indicateur: 'Maintenances terminées (période)',
    valeur: data.activite.maintenancesTerminees,
  });
  synthese.addRow({
    indicateur: 'Maintenances préventives (période)',
    valeur: data.activite.maintenancesPreventives,
  });
  synthese.addRow({
    indicateur: 'Maintenances correctives (période)',
    valeur: data.activite.maintenancesCorrectives,
  });
  synthese.addRow({ indicateur: 'Affectations créées (période)', valeur: data.activite.affectationsCrees });

  const ticketsSheet = workbook.addWorksheet('Tickets');
  ticketsSheet.columns = [
    { header: 'N° Ticket', key: 'numero', width: 18 },
    { header: 'Titre', key: 'titre', width: 40 },
    { header: 'Statut', key: 'statut', width: 15 },
    { header: 'Priorité', key: 'priorite', width: 12 },
    { header: 'Date création', key: 'date', width: 15 },
  ];
  styleHeader(ticketsSheet.getRow(1));
  for (const ticket of data.tickets) {
    ticketsSheet.addRow({
      numero: ticket.numeroTicket,
      titre: ticket.titre,
      statut: ticket.statut,
      priorite: ticket.priorite,
      date: formatDate(ticket.dateCreation),
    });
  }

  const maintSheet = workbook.addWorksheet('Maintenances');
  maintSheet.columns = [
    { header: 'N° Maintenance', key: 'numero', width: 18 },
    { header: 'Titre', key: 'titre', width: 35 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Statut', key: 'statut', width: 14 },
    { header: 'Matériel', key: 'materiel', width: 16 },
    { header: 'Début', key: 'debut', width: 12 },
    { header: 'Fin', key: 'fin', width: 12 },
  ];
  styleHeader(maintSheet.getRow(1));
  for (const m of data.maintenances) {
    maintSheet.addRow({
      numero: m.numeroMaintenance,
      titre: m.titre,
      type: m.type,
      statut: m.statut,
      materiel: m.materielCode,
      debut: formatDate(m.dateDebut),
      fin: formatDate(m.dateFin),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
