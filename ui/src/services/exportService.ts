import ExcelJS from 'exceljs';
import { FlattenedApplication } from '../utils/excel/excelFormatter';

/**
 * exportService.ts
 * Decoupled business logic for generating Excel reports with premium formatting.
 */

export interface ExportMetadata {
    generationDate: string;
    timeframe: string;
    totalRecords: number;
}

export interface ReportStats {
    statusCounts: Record<string, number>;
    municipalityCounts: Record<string, number>;
    ageGroups: Record<string, number>;
    religionCounts: Record<string, number>;
}

export const generateExcelReport = async (
    data: FlattenedApplication[],
    metadata: ExportMetadata,
    stats: ReportStats,
    fileName: string = 'Marriage_License_Report'
) => {
    try {
        const workbook = new ExcelJS.Workbook();

        // --- 1. Raw Data Sheet ---
        const worksheet = workbook.addWorksheet('Application Data');

        // Add Metadata block at the top
        worksheet.addRow(['Report Generation Date:', metadata.generationDate]);
        worksheet.addRow(['Selected Timeframe:', metadata.timeframe]);
        worksheet.addRow(['Total Records:', metadata.totalRecords]);
        worksheet.addRow([]); // Blank row as a separator

        // Get headers from first data item or a predefined list
        const headers = [
            'App Code', 'Status', 'Submission Date',
            'Registry Number',
            'Groom First', 'Groom Last', 'Groom Age', 'Groom Citizenship', 'Groom Religion', 'Groom Town', 'Groom Brgy',
            'Bride First', 'Bride Last', 'Bride Age', 'Bride Citizenship', 'Bride Religion', 'Bride Town', 'Bride Brgy'
        ];

        // Add header row
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF18181B' } // Dark gray/black like the theme
        };

        // Freeze the header row (Row 5 because metadata is 1-3, separator 4)
        worksheet.views = [
            { state: 'frozen', ySplit: 5 }
        ];

        // Map data to flat rows
        data.forEach(item => {
            const row = worksheet.addRow([
                item.application_code,
                item.status,
                item.submission_date,
                item.registry_number,
                item.groom_first_name,
                item.groom_last_name,
                item.groom_age, // Numeric
                item.groom_citizenship,
                item.groom_religion,
                item.groom_municipality,
                item.groom_barangay,
                item.bride_first_name,
                item.bride_last_name,
                item.bride_age, // Numeric
                item.bride_citizenship,
                item.bride_religion,
                item.bride_municipality,
                item.bride_barangay
            ]);

            row.getCell(7).numFmt = '#';
            row.getCell(14).numFmt = '#';
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell!({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) maxLength = columnLength;
            });
            column.width = Math.min(maxLength + 2, 40);
        });

        // --- 2. Summary Reports Sheet ---
        const summarySheet = workbook.addWorksheet('Reports');

        const addTableSection = (title: string, headers: string[], rows: any[][], startRow: number) => {
            summarySheet.mergeCells(startRow, 1, startRow, headers.length);
            const titleRow = summarySheet.getRow(startRow);
            titleRow.getCell(1).value = title.toUpperCase();
            titleRow.font = { bold: true, size: 12 };
            titleRow.alignment = { horizontal: 'left' };

            const hRow = summarySheet.getRow(startRow + 1);
            hRow.values = headers;
            hRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF18181B' } };

            rows.forEach((row, i) => {
                const r = summarySheet.getRow(startRow + 2 + i);
                r.values = row;
            });

            return startRow + rows.length + 4; // Return next available row
        };

        let currentRow = 1;
        summarySheet.addRow(['METADATA']);
        summarySheet.addRow(['Report Generation Date:', metadata.generationDate]);
        summarySheet.addRow(['Timeframe:', metadata.timeframe]);
        summarySheet.addRow(['Total Sample Size (N):', metadata.totalRecords]);
        currentRow = 6;

        const statusRows = Object.entries(stats.statusCounts).map(([status, count]) => {
            const pct = metadata.totalRecords > 0 ? (count / metadata.totalRecords) * 100 : 0;
            return [status.toUpperCase(), count, `${pct.toFixed(2)}%`];
        });
        currentRow = addTableSection('Application Status Distribution', ['Status', 'Frequency (n)', 'Percentage (%)'], statusRows, currentRow);

        const muniRows = Object.entries(stats.municipalityCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([muni, count]) => {
                const totalApplicants = metadata.totalRecords * 2;
                const pct = totalApplicants > 0 ? (count / totalApplicants) * 100 : 0;
                return [muni, count, `${pct.toFixed(2)}%`];
            });
        currentRow = addTableSection('Top Municipalities (Prevalence)', ['Municipality', 'Applicant Count', 'Relative Frequency (%)'], muniRows, currentRow);

        // Age Groups
        const ageRows = Object.entries(stats.ageGroups).map(([group, count]) => {
            const totalApplicants = metadata.totalRecords * 2;
            const pct = totalApplicants > 0 ? (count / totalApplicants) * 100 : 0;
            return [group, count, `${pct.toFixed(2)}%`];
        });
        currentRow = addTableSection('Age Distribution', ['Age Bracket', 'Count (n)', 'Percentage (%)'], ageRows, currentRow);

        // Religious Distribution
        const relRows = Object.entries(stats.religionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([rel, count]) => {
                const totalApplicants = metadata.totalRecords * 2;
                const pct = totalApplicants > 0 ? (count / totalApplicants) * 100 : 0;
                return [rel.toUpperCase(), count, `${pct.toFixed(2)}%`];
            });
        currentRow = addTableSection('Religious Affiliation', ['Religion', 'Count (n)', 'Percentage (%)'], relRows, currentRow);

        summarySheet.columns.forEach(col => { col.width = 25; });

        // --- 3. Completed Applications Sheet ---
        const completedSheet = workbook.addWorksheet('Completed');

        const completedHeaders = [
            'Registry Number', 'App Code', 'Submission Date',
            'Groom Full Name', 'Bride Full Name', 'Attending Clerk'
        ];

        const compHeadRow = completedSheet.addRow(completedHeaders);
        compHeadRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        compHeadRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF18181B' } };

        const completedApps = data
            .filter(app => app.status.toUpperCase() === 'COMPLETED')
            .sort((a, b) => a.registry_number.localeCompare(b.registry_number));

        completedApps.forEach(app => {
            completedSheet.addRow([
                app.registry_number,
                app.application_code,
                app.submission_date,
                `${app.groom_first_name} ${app.groom_last_name}`,
                `${app.bride_first_name} ${app.bride_last_name}`,
                // Since clerk is not in FlattenedApplication, we leave it for now or add it later if needed
                '-'
            ]);
        });

        completedSheet.columns.forEach(col => { col.width = 25; });

        // Write to buffer and trigger download in browser
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return true;
    } catch (error) {
        console.error("Excel generation failed:", error);
        throw error;
    }
};
