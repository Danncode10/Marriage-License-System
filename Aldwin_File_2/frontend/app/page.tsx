"use client";

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useState } from 'react';

export default function MarriageForm() {
  const [formData, setFormData] = useState({
    // GROOM
    gFirst: "", gMiddle: "", gLast: "", gBday: "", gAge: 0,
    gBrgy: "", gTown: "", gProv: "NUEVA VIZCAYA", gCountry: "PHILIPPINES",
    gCitizen: "FILIPINO", gStatus: "SINGLE", gReligion: "",
    gFathF: "", gFathM: "", gFathL: "",
    gMothF: "", gMothM: "", gMothL: "",
    gGiverF: "", gGiverM: "", gGiverL: "", gGiverRelation: "",

    // BRIDE
    bFirst: "", bMiddle: "", bLast: "", bBday: "", bAge: 0,
    bBrgy: "", bTown: "", bProv: "NUEVA VIZCAYA", bCountry: "PHILIPPINES",
    bCitizen: "FILIPINO", bStatus: "SINGLE", bReligion: "",
    bFathF: "", bFathM: "", bFathL: "",
    bMothF: "", bMothM: "", bMothL: "",
    bGiverF: "", bGiverM: "", bGiverL: "", bGiverRelation: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationCode, setApplicationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  };

  const needsGiver = (age: number) => age >= 18 && age <= 24;

  const generateExcel = async () => {
    setLoading(true);
    try {
      const { gAge: mAge, bAge: fAge, gTown, gProv, bTown, bProv } = formData;
      
      let templateName = "application_only.xlsx";
      if (fAge >= 18 && fAge <= 20 && mAge >= 25) templateName = "consent_f.xlsx";
      else if (mAge >= 18 && mAge <= 20 && fAge >= 25) templateName = "consent_m.xlsx";
      else if (mAge >= 18 && mAge <= 20 && fAge >= 18 && fAge <= 20) templateName = "consent_m_f.xlsx";
      else if (fAge >= 21 && fAge <= 24 && mAge >= 25) templateName = "advice_f.xlsx";
      else if (mAge >= 21 && mAge <= 24 && fAge >= 25) templateName = "advice_m.xlsx";
      else if (mAge >= 21 && mAge <= 24 && fAge >= 21 && fAge <= 24) templateName = "advice_m_f.xlsx";
      else if (mAge >= 21 && mAge <= 24 && fAge >= 18 && fAge <= 20) templateName = "advice_m_consent_f.xlsx";
      else if (fAge >= 21 && fAge <= 24 && mAge >= 18 && mAge <= 20) templateName = "consent_m_advice_f.xlsx";

      const response = await fetch(`/${templateName}`);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const now = new Date();
      const dayNow = now.getDate();
      const monthNow = now.toLocaleString('default', { month: 'long' }).toUpperCase();
      const yearNow = now.getFullYear();

      const toUp = (val: any) => (val ? val.toString().toUpperCase().trim() : "");
      
      const gFullAddr = toUp(`${formData.gBrgy}, ${formData.gTown}, ${formData.gProv}`);
      const bFullAddr = toUp(`${formData.bBrgy}, ${formData.bTown}, ${formData.bProv}`);
      const gTownProv = toUp(`${formData.gTown}, ${formData.gProv}`);
      const bTownProv = toUp(`${formData.bTown}, ${formData.bProv}`);

      // Logic for External Address Sheets
      const isGroomExternal = gTownProv !== "SOLANO, NUEVA VIZCAYA";
      const isBrideExternal = bTownProv !== "SOLANO, NUEVA VIZCAYA";
      const needsBackSheets = isGroomExternal || isBrideExternal;

      workbook.worksheets.forEach(sheet => {
        const sName = sheet.name.toUpperCase();

        // Handle Sheet Visibility
        if (sName.includes("ADDRESSBACKNOTICE") || sName.includes("ENVELOPEADDRESS")) {
          sheet.state = needsBackSheets ? 'visible' : 'hidden';
        }

        if (sName.includes("APPLICATION")) {
          // --- MALE MAPPING ---
          sheet.getCell('B8').value = toUp(formData.gFirst);
          sheet.getCell('B9').value = toUp(formData.gMiddle);
          sheet.getCell('B10').value = toUp(formData.gLast);
          sheet.getCell('B11').value = toUp(formData.gBday);
          sheet.getCell('N11').value = formData.gAge;
          sheet.getCell('B12').value = gTownProv;
          sheet.getCell('L12').value = toUp(formData.gCountry);
          sheet.getCell('B13').value = "MALE";
          sheet.getCell('H13').value = toUp(formData.gCitizen);
          sheet.getCell('B15').value = gFullAddr;
          sheet.getCell('M15').value = toUp(formData.gCountry);
          sheet.getCell('B16').value = toUp(formData.gReligion);
          sheet.getCell('B17').value = toUp(formData.gStatus);
          sheet.getCell('B22').value = toUp(formData.gFathF);
          sheet.getCell('H22').value = toUp(formData.gFathM);
          sheet.getCell('L22').value = toUp(formData.gFathL);
          sheet.getCell('B23').value = toUp(formData.gCitizen);
          sheet.getCell('B25').value = gFullAddr;
          sheet.getCell('M25').value = toUp(formData.gCountry);
          sheet.getCell('B26').value = toUp(formData.gMothF);
          sheet.getCell('G26').value = toUp(formData.gMothM);
          sheet.getCell('K26').value = toUp(formData.gMothL);
          sheet.getCell('B27').value = toUp(formData.gCitizen);
          sheet.getCell('B29').value = gFullAddr;
          sheet.getCell('M29').value = toUp(formData.gCountry);
          sheet.getCell('B34').value = gFullAddr;
          sheet.getCell('M34').value = toUp(formData.gCountry);

          if(needsGiver(formData.gAge)) {
            sheet.getCell('B30').value = toUp(formData.gGiverF);
            sheet.getCell('H30').value = toUp(formData.gGiverM);
            sheet.getCell('L30').value = toUp(formData.gGiverL);
            sheet.getCell('B31').value = toUp(formData.gGiverRelation);
            sheet.getCell('B32').value = toUp(formData.gCitizen);
          }

          // --- FEMALE MAPPING ---
          sheet.getCell('U8').value = toUp(formData.bFirst);
          sheet.getCell('U9').value = toUp(formData.bMiddle);
          sheet.getCell('U10').value = toUp(formData.bLast);
          sheet.getCell('U11').value = toUp(formData.bBday);
          sheet.getCell('AF11').value = formData.bAge;
          sheet.getCell('U12').value = bTownProv;
          sheet.getCell('AE12').value = toUp(formData.bCountry);
          sheet.getCell('U13').value = "FEMALE";
          sheet.getCell('Z13').value = toUp(formData.bCitizen);
          sheet.getCell('U15').value = bFullAddr;
          sheet.getCell('AF15').value = toUp(formData.bCountry);
          sheet.getCell('U16').value = toUp(formData.bReligion);
          sheet.getCell('U17').value = toUp(formData.bStatus);
          sheet.getCell('U22').value = toUp(formData.bFathF);
          sheet.getCell('Y22').value = toUp(formData.bFathM);
          sheet.getCell('AC22').value = toUp(formData.bFathL);
          sheet.getCell('U23').value = toUp(formData.bCitizen);
          sheet.getCell('U25').value = bFullAddr;
          sheet.getCell('AF25').value = toUp(formData.bCountry);
          sheet.getCell('U26').value = toUp(formData.bMothF);
          sheet.getCell('Y26').value = toUp(formData.bMothM);
          sheet.getCell('AD26').value = toUp(formData.bMothL);
          sheet.getCell('U27').value = toUp(formData.bCitizen);
          sheet.getCell('U29').value = bFullAddr;
          sheet.getCell('AF29').value = toUp(formData.bCountry);
          sheet.getCell('U34').value = bFullAddr;
          sheet.getCell('AF34').value = toUp(formData.bCountry);

          if(needsGiver(formData.bAge)) {
            sheet.getCell('U30').value = toUp(formData.bGiverF);
            sheet.getCell('Y30').value = toUp(formData.bGiverM);
            sheet.getCell('AD30').value = toUp(formData.bGiverL);
            sheet.getCell('U31').value = toUp(formData.bGiverRelation);
            sheet.getCell('U32').value = toUp(formData.bCitizen);
          }

          // --- DATE AND LOCATION ---
          sheet.getCell('B37').value = dayNow;
          sheet.getCell('U37').value = dayNow;
          sheet.getCell('E37').value = monthNow;
          sheet.getCell('W37').value = monthNow;
          sheet.getCell('L37').value = yearNow;
          sheet.getCell('AD37').value = yearNow;
          sheet.getCell('B38').value = "SOLANO, NUEVA VIZCAYA";
          sheet.getCell('U38').value = "SOLANO, NUEVA VIZCAYA";
        }

        // --- NOTICE TAB LOGIC ---
        if (sName.includes("NOTICE")) {
            // F20 and F26 are usually where town/prov are mapped in Notice templates
            // Your request: If both are Solano, leave E44-46 empty. 
            // If both are not, print addresses on E44, E45.
            // If one is not, print on E44.

            if (isGroomExternal && isBrideExternal) {
                sheet.getCell('E44').value = gFullAddr;
                sheet.getCell('E45').value = bFullAddr;
            } else if (isGroomExternal) {
                sheet.getCell('E44').value = gFullAddr;
                sheet.getCell('E45').value = "";
            } else if (isBrideExternal) {
                sheet.getCell('E44').value = bFullAddr;
                sheet.getCell('E45').value = "";
            } else {
                sheet.getCell('E44').value = "";
                sheet.getCell('E45').value = "";
                sheet.getCell('E46').value = "";
            }
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `MARRIAGE_APP_${applicationCode}.xlsx`);
    } catch (e) { alert("Error generating excel."); console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-200 p-4 md:p-8 text-slate-900">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl border border-slate-300">
        <header className="bg-slate-900 p-6 text-white text-center rounded-t-2xl">
          <h1 className="text-2xl font-black italic">LGU SOLANO MARRIAGE PORTAL</h1>
        </header>

        {!isSubmitted ? (
          <form onSubmit={(e) => { e.preventDefault(); setApplicationCode(`${Math.floor(1000 + Math.random() * 9000)}`); setIsSubmitted(true); }} className="p-10 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Section title="GROOM" color="blue">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="First"><Input value={formData.gFirst} onChange={e => setFormData({...formData, gFirst: e.target.value})} /></Field>
                  <Field label="Middle"><Input value={formData.gMiddle} onChange={e => setFormData({...formData, gMiddle: e.target.value})} /></Field>
                  <Field label="Last"><Input value={formData.gLast} onChange={e => setFormData({...formData, gLast: e.target.value})} /></Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Birthday"><Input type="date" value={formData.gBday} onChange={e => { const b = e.target.value; setFormData({...formData, gBday: b, gAge: calculateAge(b)}); }} /></Field>
                  <Field label="Age"><Input type="number" readOnly value={formData.gAge || ""} className="bg-slate-50" /></Field>
                  <Field label="Religion"><Input value={formData.gReligion} onChange={e => setFormData({...formData, gReligion: e.target.value})} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Barangay"><Input value={formData.gBrgy} onChange={e => setFormData({...formData, gBrgy: e.target.value})} /></Field>
                  <Field label="Town"><Input value={formData.gTown} onChange={e => setFormData({...formData, gTown: e.target.value})} /></Field>
                </div>
                <ParentSubSection person="Groom" data={formData} setData={setFormData} prefix="g" />
                <GiverSection person="Groom" age={formData.gAge} data={formData} setData={setFormData} prefix="g" />
              </Section>

              <Section title="BRIDE" color="pink">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="First"><Input value={formData.bFirst} onChange={e => setFormData({...formData, bFirst: e.target.value})} /></Field>
                  <Field label="Middle"><Input value={formData.bMiddle} onChange={e => setFormData({...formData, bMiddle: e.target.value})} /></Field>
                  <Field label="Last"><Input value={formData.bLast} onChange={e => setFormData({...formData, bLast: e.target.value})} /></Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Birthday"><Input type="date" value={formData.bBday} onChange={e => { const b = e.target.value; setFormData({...formData, bBday: b, bAge: calculateAge(b)}); }} /></Field>
                  <Field label="Age"><Input type="number" readOnly value={formData.bAge || ""} className="bg-slate-50" /></Field>
                  <Field label="Religion"><Input value={formData.bReligion} onChange={e => setFormData({...formData, bReligion: e.target.value})} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Barangay"><Input value={formData.bBrgy} onChange={e => setFormData({...formData, bBrgy: e.target.value})} /></Field>
                  <Field label="Town"><Input value={formData.bTown} onChange={e => setFormData({...formData, bTown: e.target.value})} /></Field>
                </div>
                <ParentSubSection person="Bride" data={formData} setData={setFormData} prefix="b" />
                <GiverSection person="Bride" age={formData.bAge} data={formData} setData={setFormData} prefix="b" />
              </Section>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-xl font-bold text-xl uppercase tracking-widest hover:bg-black">Generate Marriage Pack</button>
          </form>
        ) : (
          <div className="p-20 text-center space-y-8">
            <h2 className="text-8xl font-black text-blue-600">{applicationCode}</h2>
            <button onClick={generateExcel} disabled={loading} className="w-full max-w-md bg-green-600 text-white py-6 rounded-2xl font-bold text-2xl shadow-xl hover:bg-green-700">
              {loading ? "GENERATING..." : "DOWNLOAD EXCEL"}
            </button>
            <button onClick={() => setIsSubmitted(false)} className="block mx-auto text-slate-500 underline font-bold">Back to Edit</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, color, children }: any) {
  const textColor = color === 'blue' ? 'text-blue-800' : 'text-pink-800';
  const border = color === 'blue' ? 'border-blue-200' : 'border-pink-200';
  return (
    <div className="space-y-6">
      <h2 className={`${textColor} font-black text-xl border-b-4 ${border} pb-1`}>{title}</h2>
      {children}
    </div>
  );
}

function GiverSection({ person, age, data, setData, prefix }: any) {
  if (!age || age < 18 || age > 24) return null;
  const isG = prefix === 'g';
  const label = age <= 20 ? "CONSENT" : "ADVICE";
  return (
    <div className={`p-5 rounded-2xl border-2 border-dashed ${isG ? 'border-blue-300 bg-blue-50/50' : 'border-pink-300 bg-pink-50/50'} space-y-4`}>
      <p className="text-xs font-black uppercase tracking-widest text-slate-600">Person Giving {label} ({person})</p>
      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="First Name" value={data[`${prefix}GiverF`]} onChange={e => setData({...data, [`${prefix}GiverF`]: e.target.value})} />
        <Input placeholder="Middle Name" value={data[`${prefix}GiverM`]} onChange={e => setData({...data, [`${prefix}GiverM`]: e.target.value})} />
        <Input placeholder="Last Name" value={data[`${prefix}GiverL`]} onChange={e => setData({...data, [`${prefix}GiverL`]: e.target.value})} />
      </div>
      <Field label="Relationship (e.g. Father)"><Input value={data[`${prefix}GiverRelation`]} onChange={e => setData({...data, [`${prefix}GiverRelation`]: e.target.value})} /></Field>
    </div>
  );
}

function ParentSubSection({ person, data, setData, prefix }: any) {
  const isG = prefix === 'g';
  return (
    <div className={`p-5 rounded-2xl border ${isG ? 'bg-blue-50 border-blue-100' : 'bg-pink-50 border-pink-100'} space-y-4`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{person}'s Parents</p>
      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="Father First" value={data[`${prefix}FathF`]} onChange={e => setData({...data, [`${prefix}FathF`]: e.target.value})} />
        <Input placeholder="Father Mid" value={data[`${prefix}FathM`]} onChange={e => setData({...data, [`${prefix}FathM`]: e.target.value})} />
        <Input placeholder="Father Last" value={data[`${prefix}FathL`]} onChange={e => setData({...data, [`${prefix}FathL`]: e.target.value})} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="Mother First" value={data[`${prefix}MothF`]} onChange={e => setData({...data, [`${prefix}MothF`]: e.target.value})} />
        <Input placeholder="Mother Mid" value={data[`${prefix}MothM`]} onChange={e => setData({...data, [`${prefix}MothM`]: e.target.value})} />
        <Input placeholder="Mother Last" value={data[`${prefix}MothL`]} onChange={e => setData({...data, [`${prefix}MothL`]: e.target.value})} />
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{label}</label>{children}</div>;
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full border-2 border-slate-300 bg-white p-3 rounded-xl text-sm font-bold focus:border-slate-900 outline-none transition-all ${className ?? ""}`} />;
}