import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { ExcelData } from './types';

export class ExcelGenerator {
    private templatePath: string;

    constructor() {
        this.templatePath = path.join(process.cwd(), "src", "assets", "excel", "template.xlsx");
    }

    private cmToPoints(cm: number): number {
        return (cm / 2.54) * 96;
    }

    // Essential to prevent "Cell Information" errors caused by illegal XML chars
    private sanitize(val: any): string {
        if (val === null || val === undefined) return "";
        return val.toString().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
    }

    private formatName(first: string, middle: string, last: string, suffix?: string, customSuffix?: string): { f: string, m: string, l: string } {
        let finalFirst = first || "";
        const sfx = suffix === "Others" ? customSuffix : suffix;
        if (sfx) {
            finalFirst = `${finalFirst} ${sfx}`.trim();
        }
        return {
            f: this.sanitize(finalFirst).toUpperCase(),
            m: this.sanitize(middle).toUpperCase(),
            l: this.sanitize(last).toUpperCase()
        };
    }

    private cleanTown(town: string): string {
        if (!town) return "";
        return town.replace(/\(Capital\)/gi, "").trim();
    }

    async generate(data: ExcelData): Promise<Buffer> {
        if (!fs.existsSync(this.templatePath)) {
            throw new Error(`Template not found at ${this.templatePath}`);
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(this.templatePath);

        const now = new Date();
        const dayNow = now.getDate().toString();
        const monthNow = now.toLocaleString('default', { month: 'long' });
        const yearNow = now.getFullYear().toString();

        const gCleanTown = this.cleanTown(data.gTown);
        const bCleanTown = this.cleanTown(data.bTown);
        const gTownProv = `${gCleanTown}, ${data.gProv || 'Nueva Vizcaya'}`;
        const bTownProv = `${bCleanTown}, ${data.bProv || 'Nueva Vizcaya'}`;
        const gFullAddr = `Brgy., ${data.gBrgy || ''}, ${gTownProv}`;
        const bFullAddr = `Brgy., ${data.bBrgy || ''}, ${bTownProv}`;

        // Formatted Names (Merged Suffixes)
        const groom = this.formatName(data.gFirst, data.gMiddle, data.gLast, data.gSuffix, data.gCustomSuffix);
        const bride = this.formatName(data.bFirst, data.bMiddle, data.bLast, data.bSuffix, data.bCustomSuffix);
        const gFath = this.formatName(data.gFathF, data.gFathM, data.gFathL, data.gFathSuffix, data.gFathCustomSuffix);
        const gMoth = this.formatName(data.gMothF, data.gMothM, data.gMothL, data.gMothSuffix, data.gMothCustomSuffix);
        const bFath = this.formatName(data.bFathF, data.bFathM, data.bFathL, data.bFathSuffix, data.bFathCustomSuffix);
        const bMoth = this.formatName(data.bMothF, data.bMothM, data.bMothL, data.bMothSuffix, data.bMothCustomSuffix);
        const gGiver = this.formatName(data.gGiverF, data.gGiverM, data.gGiverL, data.gGiverSuffix, data.gGiverCustomSuffix);
        const bGiver = this.formatName(data.bGiverF, data.bGiverM, data.bGiverL, data.bGiverSuffix, data.bGiverCustomSuffix);

        // LOGIC FOR SHEETS
        const sheetsToKeep = ["APPLICATION", "Notice"];
        const gAge = data.gAge;
        const bAge = data.bAge;

        let extraSheet: string | null = null;
        if (bAge >= 18 && bAge <= 20 && gAge >= 25) extraSheet = "CONSENT F";
        else if (gAge >= 18 && gAge <= 20 && bAge >= 25) extraSheet = "CONSENT M";
        else if (bAge >= 18 && bAge <= 20 && gAge >= 18 && gAge <= 20) extraSheet = "CONSENT M&F";
        else if (bAge >= 21 && bAge <= 24 && gAge >= 25) extraSheet = "ADVICE F";
        else if (gAge >= 21 && gAge <= 24 && bAge >= 25) extraSheet = "ADVICE M";
        else if (bAge >= 21 && bAge <= 24 && gAge >= 21 && gAge <= 24) extraSheet = "ADVICE M&F";
        else if (gAge >= 21 && gAge <= 24 && bAge >= 18 && bAge <= 20) extraSheet = "ADVICE M-CONSENT F";
        else if (bAge >= 21 && bAge <= 24 && gAge >= 18 && gAge <= 20) extraSheet = "ADVICE F-CONSENT M";

        if (extraSheet) sheetsToKeep.push(extraSheet);
        if (gTownProv !== "Solano, Nueva Vizcaya" || bTownProv !== "Solano, Nueva Vizcaya") {
            sheetsToKeep.push("AddressBACKnotice", "EnvelopeAddress");
        }

        // --- 1. USE HIDING INSTEAD OF DELETION ---
        // Physical deletion is likely what is breaking your specific template's XML
        workbook.worksheets.forEach(sheet => {
            if (!sheetsToKeep.includes(sheet.name)) {
                sheet.state = 'veryHidden'; // Keeps it away from users without breaking references
            } else {
                sheet.state = 'visible';
            }
        });

        const appSheet = workbook.getWorksheet('APPLICATION') || workbook.getWorksheet(1);

        // --- 2. FILL DATA (USING YOUR ORIGINAL PATHING) ---
        if (appSheet) {
            appSheet.getCell('B8').value = groom.f;
            appSheet.getCell('B9').value = groom.m;
            appSheet.getCell('B10').value = groom.l;
            appSheet.getCell('B11').value = this.sanitize(data.gBday);
            appSheet.getCell('N11').value = data.gAge || 0;
            appSheet.getCell('B12').value = this.sanitize(data.gBirthPlace).toUpperCase();

            const gCountryVal = this.sanitize(data.gCountry) || 'Philippines';
            appSheet.getCell('L12').value = gCountryVal;
            appSheet.getCell('B13').value = "Male";
            appSheet.getCell('H13').value = this.sanitize(data.gCitizen) || 'Filipino';
            appSheet.getCell('B15').value = this.sanitize(gFullAddr);
            appSheet.getCell('M15').value = gCountryVal;
            const gFullRel = data.gReligion === "Others" ? data.gCustomReligion : data.gReligion;
            appSheet.getCell('B16').value = this.sanitize(gFullRel);
            appSheet.getCell('B17').value = this.sanitize(data.gStatus) || 'Single';

            appSheet.getCell('B22').value = gFath.f;
            appSheet.getCell('H22').value = gFath.m;
            appSheet.getCell('L22').value = gFath.l;

            appSheet.getCell('B26').value = gMoth.f;
            appSheet.getCell('G26').value = gMoth.m;
            appSheet.getCell('K26').value = gMoth.l;

            const hasGroomGiver = !!(data.gGiverF || data.gGiverL);
            if (hasGroomGiver || (gAge >= 18 && gAge <= 24)) {
                appSheet.getCell('B30').value = gGiver.f;
                appSheet.getCell('H30').value = gGiver.m;
                appSheet.getCell('L30').value = gGiver.l;

                const gRel = data.gGiverRelation === "Other" ? data.gGiverOtherTitle : data.gGiverRelation;
                appSheet.getCell('B31').value = this.sanitize(gRel).toUpperCase();
                appSheet.getCell('B32').value = this.sanitize(data.gCitizen) || 'Filipino';
            } else {
                appSheet.getCell('B30').value = "";
                appSheet.getCell('H30').value = "";
                appSheet.getCell('L30').value = "";
                appSheet.getCell('B31').value = "";
                appSheet.getCell('B32').value = "";
            }

            // Groom & Bride IDs (Conditional)
            const gFullIdType = data.gIdType === "Others" ? data.gIdCustomType : data.gIdType;
            const bFullIdType = data.bIdType === "Others" ? data.bIdCustomType : data.bIdType;
            appSheet.getCell('D39').value = data.gIncludeId ? this.sanitize(`${gFullIdType || ''}: ${data.gIdNo || ''}`) : "";
            appSheet.getCell('V39').value = data.bIncludeId ? this.sanitize(`${bFullIdType || ''}: ${data.bIdNo || ''}`) : "";

            // Bride
            appSheet.getCell('U8').value = bride.f;
            appSheet.getCell('U9').value = bride.m;
            appSheet.getCell('U10').value = bride.l;
            appSheet.getCell('U11').value = this.sanitize(data.bBday);
            appSheet.getCell('AF11').value = data.bAge || 0;
            appSheet.getCell('U12').value = this.sanitize(data.bBirthPlace).toUpperCase();

            const bCountryVal = this.sanitize(data.bCountry) || 'Philippines';
            appSheet.getCell('AE12').value = bCountryVal;
            appSheet.getCell('U13').value = "Female";
            appSheet.getCell('Z13').value = this.sanitize(data.bCitizen) || 'Filipino';
            appSheet.getCell('U15').value = this.sanitize(bFullAddr);
            appSheet.getCell('AF15').value = bCountryVal;
            const bFullRel = data.bReligion === "Others" ? data.bCustomReligion : data.bReligion;
            appSheet.getCell('U16').value = this.sanitize(bFullRel);
            appSheet.getCell('U17').value = this.sanitize(data.bStatus) || 'Single';

            appSheet.getCell('U22').value = bFath.f;
            appSheet.getCell('Y22').value = bFath.m;
            appSheet.getCell('AC22').value = bFath.l;

            appSheet.getCell('U26').value = bMoth.f;
            appSheet.getCell('Y26').value = bMoth.m;
            appSheet.getCell('AD26').value = bMoth.l;

            const hasBrideGiver = !!(data.bGiverF || data.bGiverL);
            if (hasBrideGiver || (bAge >= 18 && bAge <= 24)) {
                appSheet.getCell('U30').value = bGiver.f;
                appSheet.getCell('Y30').value = bGiver.m;
                appSheet.getCell('AD30').value = bGiver.l;

                const bRel = data.bGiverRelation === "Other" ? data.bGiverOtherTitle : data.bGiverRelation;
                appSheet.getCell('U31').value = this.sanitize(bRel).toUpperCase();
                appSheet.getCell('U32').value = this.sanitize(data.bCitizen) || 'Filipino';
            } else {
                appSheet.getCell('U30').value = "";
                appSheet.getCell('Y30').value = "";
                appSheet.getCell('AD30').value = "";
                appSheet.getCell('U31').value = "";
                appSheet.getCell('U32').value = "";
            }

            appSheet.getCell('F5').value = this.sanitize(dayNow);
            appSheet.getCell('B37').value = this.sanitize(dayNow);
            appSheet.getCell('U37').value = this.sanitize(dayNow);
            appSheet.getCell('G5').value = this.sanitize(monthNow);
            appSheet.getCell('E37').value = this.sanitize(monthNow);
            appSheet.getCell('W37').value = this.sanitize(monthNow);
            appSheet.getCell('L5').value = this.sanitize(yearNow);
            appSheet.getCell('L37').value = this.sanitize(yearNow);
            appSheet.getCell('AD37').value = this.sanitize(yearNow);
            appSheet.getCell('B38').value = "Solano, Nueva Vizcaya";
            appSheet.getCell('U38').value = "Solano, Nueva Vizcaya";
            appSheet.getCell('F4').value = (data.employeeName || "").toUpperCase();
        }

        // --- 3. FILL EXTRA SHEET IDs ---
        if (extraSheet) {
            const extra = workbook.getWorksheet(extraSheet);
            if (extra) {
                const gGiverFullIdType = data.gGiverIdType === "Others" ? data.gGiverIdCustomType : data.gGiverIdType;
                const bGiverFullIdType = data.bGiverIdType === "Others" ? data.bGiverIdCustomType : data.bGiverIdType;
                const gIdStr = data.gGiverIncludeId ? `${gGiverFullIdType || ''}: ${data.gGiverIdNo || ''}` : "";
                const bIdStr = data.bGiverIncludeId ? `${bGiverFullIdType || ''}: ${data.bGiverIdNo || ''}` : "";

                if (extraSheet === "CONSENT M&F") { extra.getCell('T25').value = gIdStr; extra.getCell('T58').value = bIdStr; }
                else if (extraSheet === "CONSENT F") { extra.getCell('T29').value = bIdStr; }
                else if (extraSheet === "CONSENT M") { extra.getCell('T29').value = gIdStr; }
                else if (extraSheet === "ADVICE F") { extra.getCell('T25').value = bIdStr; }
                else if (extraSheet === "ADVICE M") { extra.getCell('T25').value = gIdStr; }
                else if (extraSheet === "ADVICE M&F") { extra.getCell('T24').value = gIdStr; extra.getCell('T28').value = bIdStr; }
                else if (extraSheet === "ADVICE M-CONSENT F") { extra.getCell('T23').value = gIdStr; extra.getCell('T60').value = bIdStr; }
                else if (extraSheet === "ADVICE F-CONSENT M") { extra.getCell('T26').value = gIdStr; extra.getCell('T55').value = bIdStr; }
            }
        }

        // --- 4. NOTICE SHEET FILTERING ---
        const noticeSheet = workbook.getWorksheet('Notice');
        if (noticeSheet) {
            const gIsSolano = gCleanTown.toLowerCase().includes("solano");
            const bIsSolano = bCleanTown.toLowerCase().includes("solano");

            const gNonSolano = !gIsSolano;
            const bNonSolano = !bIsSolano;

            if (bNonSolano && gNonSolano) {
                // Both NOT from Solano
                noticeSheet.getCell('E44').value = this.sanitize(`${bCleanTown}, ${data.bProv || 'Nueva Vizcaya'}`);
                noticeSheet.getCell('E45').value = this.sanitize(`${gCleanTown}, ${data.gProv || 'Nueva Vizcaya'}`);
            } else if (bNonSolano) {
                // Only Bride NOT from Solano
                noticeSheet.getCell('E44').value = this.sanitize(`${bCleanTown}, ${data.bProv || 'Nueva Vizcaya'}`);
                noticeSheet.getCell('E45').value = "";
            } else if (gNonSolano) {
                // Only Groom NOT from Solano
                noticeSheet.getCell('E44').value = this.sanitize(`${gCleanTown}, ${data.gProv || 'Nueva Vizcaya'}`);
                noticeSheet.getCell('E45').value = "";
            } else {
                // Both ARE from Solano
                noticeSheet.getCell('E44').value = "";
                noticeSheet.getCell('E45').value = "";
            }
        }

        // --- 5. HANDLE IMAGE REPLACEMENT ---
        if (data.coupleImagePath && fs.existsSync(data.coupleImagePath)) {
            const noticeSheet = workbook.getWorksheet('Notice');
            if (noticeSheet) {
                try {
                    // Determine final extension for ExcelJS (only supports 'jpeg' or 'png')
                    const ext = (data.imageExtension || 'png').toLowerCase();
                    const finalExt = (ext === 'jpg' || ext === 'jpeg') ? 'jpeg' : 'png';

                    const imageId = workbook.addImage({
                        filename: data.coupleImagePath,
                        extension: finalExt as 'jpeg' | 'png',
                    });

                    // Positioning like Python: Cell T11
                    // 3.75cm height, 5.73cm width
                    // exceljs uses pixels or points depending on method. 
                    // Let's use extents (96 dpi based pixels)
                    noticeSheet.addImage(imageId, {
                        tl: { col: 19, row: 10 }, // T is column 20 (0-indexed is 19), 11 is row 11 (0-indexed is 10)
                        ext: {
                            width: (5.73 / 2.54) * 96,
                            height: (3.75 / 2.54) * 96
                        }
                    });
                } catch (error) {
                    console.error("Warning: Image overlay failed:", error);
                }
            }
        }
        // --- 5. CRITICAL WORKBOOK METADATA RESET ---
        // This clears the "broken" view data that often causes the recovery log error
        workbook.views = [
            {
                x: 0, y: 0, width: 10000, height: 20000,
                firstSheet: 0, activeTab: 0, visibility: 'visible'
            }
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}