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

    // BRIDE
    bFirst: "", bMiddle: "", bLast: "", bBday: "", bAge: 0,
    bBrgy: "", bTown: "", bProv: "NUEVA VIZCAYA", bCountry: "PHILIPPINES",
    bCitizen: "FILIPINO", bStatus: "SINGLE", bReligion: "",
    bFathF: "", bFathM: "", bFathL: "",
    bMothF: "", bMothM: "", bMothL: " ",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationCode, setApplicationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const generateExcel = async () => {
    setLoading(true);
    try {
      const { gAge: m, bAge: f, gTown: mTown, bTown: fTown } = formData;
      
      let templateName = "application_only.xlsx";
      // Template selection logic based on age (Consent/Advice)
      if (f >= 18 && f <= 20 && m >= 25) templateName = "consent_f.xlsx";
      else if (m >= 18 && m <= 20 && f >= 25) templateName = "consent_m.xlsx";
      else if (m >= 18 && m <= 20 && f >= 18 && f <= 20) templateName = "consent_m_f.xlsx";
      else if (f >= 21 && f <= 24 && m >= 25) templateName = "advice_f.xlsx";
      else if (m >= 21 && m <= 24 && f >= 25) templateName = "advice_m.xlsx";
      else if (m >= 21 && m <= 24 && f >= 21 && f <= 24) templateName = "advice_m_f.xlsx";
      else if (m >= 21 && m <= 24 && f >= 18 && f <= 20) templateName = "advice_m_consent_f.xlsx";
      else if (f >= 21 && f <= 24 && m >= 18 && m <= 20) templateName = "consent_m_advice_f.xlsx";

      const response = await fetch(`/${templateName}`);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const isExternal = mTown.toLowerCase().trim() !== "solano" || fTown.toLowerCase().trim() !== "solano";

      workbook.worksheets.forEach(sheet => {
        const sName = sheet.name.toUpperCase();
        
        // Tab Visibility
        if (sName.includes("ADDRESSBACKNOTICE") || sName.includes("ENVELOPEADDRESS")) {
          sheet.state = isExternal ? 'visible' : 'hidden';
        } else {
          sheet.state = 'visible';
        }

        const toUp = (val: any) => (val ? val.toString().toUpperCase() : "");
        const gFullAddr = toUp(`${formData.gBrgy}, ${formData.gTown}, ${formData.gProv}`);
        const bFullAddr = toUp(`${formData.bBrgy}, ${formData.bTown}, ${formData.bProv}`);

        // --- MALE (GROOM) MAPPING ---
        sheet.getCell('B8').value = toUp(formData.gFirst);
        sheet.getCell('B9').value = toUp(formData.gMiddle);
        sheet.getCell('B10').value = toUp(formData.gLast);
        sheet.getCell('B11').value = toUp(formData.gBday);
        sheet.getCell('N11').value = formData.gAge;
        sheet.getCell('B12').value = toUp(`${formData.gBrgy}, ${formData.gTown}`);
        sheet.getCell('B16').value = toUp(formData.gReligion);
        sheet.getCell('B17').value = toUp(formData.gStatus);

        // --- FEMALE (BRIDE) MAPPING ---
        sheet.getCell('U8').value = toUp(formData.bFirst);
        sheet.getCell('U9').value = toUp(formData.bMiddle);
        sheet.getCell('U10').value = toUp(formData.bLast);
        sheet.getCell('U11').value = toUp(formData.bBday);
        sheet.getCell('AF11').value = formData.bAge;
        sheet.getCell('U12').value = toUp(`${formData.bBrgy}, ${formData.bTown}`);
        sheet.getCell('U16').value = toUp(formData.bReligion);
        sheet.getCell('U17').value = toUp(formData.bStatus);

        // --- PARENTAL & GUARDIAN LOGIC ---
        // This applies to Consent/Advice sheets OR the Application sheet if it shares these cells
        const isGroomTarget = sName.includes("APPLICATION") || sName.includes(" M") || sName.endsWith("M");
        
        // If sheet is Male-focused or General Application
        if (isGroomTarget) {
          sheet.getCell('B22').value = toUp(formData.gFathF);
          sheet.getCell('H22').value = toUp(formData.gFathM);
          sheet.getCell('L22').value = toUp(formData.gFathL);
          sheet.getCell('B26').value = toUp(formData.gMothF);
          sheet.getCell('G26').value = toUp(formData.gMothM);
          sheet.getCell('K26').value = toUp(formData.gMothL);
          sheet.getCell('N25').value = gFullAddr; // Father Addr
          sheet.getCell('B29').value = gFullAddr; // Mother Addr
          sheet.getCell('M24').value = toUp(formData.gCountry); // Father Country
          sheet.getCell('M29').value = toUp(formData.gCountry); // Mother Country
          sheet.getCell('B23').value = toUp(formData.gCitizen); // Guardian Cit
          sheet.getCell('B27').value = toUp(formData.gCitizen); // Guardian Cit
          sheet.getCell('B32').value = toUp(formData.gCitizen); // Guardian Cit
        }

        // If sheet is Female-focused or General Application (using different offsets)
        const isBrideTarget = sName.includes("APPLICATION") || sName.includes(" F") || sName.endsWith("F");
        if (isBrideTarget) {
          // Note: If Application tab has separate Bride Parent cells, update these coordinates
          // For now, mapping as requested for the specific person's document
          if (!sName.includes("APPLICATION")) {
             sheet.getCell('B22').value = toUp(formData.bFathF);
             sheet.getCell('H22').value = toUp(formData.bFathM);
             sheet.getCell('L22').value = toUp(formData.bFathL);
             sheet.getCell('B26').value = toUp(formData.bMothF);
             sheet.getCell('G26').value = toUp(formData.bMothM);
             sheet.getCell('K26').value = toUp(formData.bMothL);
             sheet.getCell('N25').value = bFullAddr;
             sheet.getCell('B29').value = bFullAddr;
             sheet.getCell('AF25').value = toUp(formData.bCountry);
             sheet.getCell('AF29').value = toUp(formData.bCountry);
             sheet.getCell('U23').value = toUp(formData.bCitizen);
             sheet.getCell('U27').value = toUp(formData.bCitizen);
             sheet.getCell('U32').value = toUp(formData.bCitizen);
          }
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `MARRIAGE_APPLICATION_${applicationCode}.xlsx`);
    } catch (e) { alert("Error generating excel."); } finally { setLoading(false); }
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
                  <Field label="Birthday"><Input type="date" value={formData.gBday} onChange={e => setFormData({...formData, gBday: e.target.value})} /></Field>
                  <Field label="Age"><Input type="number" value={formData.gAge || ""} onChange={e => setFormData({...formData, gAge: parseInt(e.target.value) || 0})} /></Field>
                  <Field label="Religion"><Input value={formData.gReligion} onChange={e => setFormData({...formData, gReligion: e.target.value})} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Barangay"><Input value={formData.gBrgy} onChange={e => setFormData({...formData, gBrgy: e.target.value})} /></Field>
                  <Field label="Town"><Input value={formData.gTown} onChange={e => setFormData({...formData, gTown: e.target.value})} /></Field>
                </div>
                <ParentSubSection person="Groom" data={formData} setData={setFormData} prefix="g" />
              </Section>

              <Section title="BRIDE" color="pink">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="First"><Input value={formData.bFirst} onChange={e => setFormData({...formData, bFirst: e.target.value})} /></Field>
                  <Field label="Middle"><Input value={formData.bMiddle} onChange={e => setFormData({...formData, bMiddle: e.target.value})} /></Field>
                  <Field label="Last"><Input value={formData.bLast} onChange={e => setFormData({...formData, bLast: e.target.value})} /></Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Birthday"><Input type="date" value={formData.bBday} onChange={e => setFormData({...formData, bBday: e.target.value})} /></Field>
                  <Field label="Age"><Input type="number" value={formData.bAge || ""} onChange={e => setFormData({...formData, bAge: parseInt(e.target.value) || 0})} /></Field>
                  <Field label="Religion"><Input value={formData.bReligion} onChange={e => setFormData({...formData, bReligion: e.target.value})} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Barangay"><Input value={formData.bBrgy} onChange={e => setFormData({...formData, bBrgy: e.target.value})} /></Field>
                  <Field label="Town"><Input value={formData.bTown} onChange={e => setFormData({...formData, bTown: e.target.value})} /></Field>
                </div>
                <ParentSubSection person="Bride" data={formData} setData={setFormData} prefix="b" />
              </Section>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-xl font-bold text-xl uppercase tracking-widest hover:bg-black transition-all">Generate Marriage Pack</button>
          </form>
        ) : (
          <div className="p-20 text-center space-y-8">
            <h2 className="text-8xl font-black text-blue-600">{applicationCode}</h2>
            <button onClick={generateExcel} className="w-full max-w-md bg-green-600 text-white py-6 rounded-2xl font-bold text-2xl shadow-xl hover:bg-green-700">DOWNLOAD EXCEL</button>
            <button onClick={() => setIsSubmitted(false)} className="block mx-auto text-slate-500 underline font-bold">Back to Edit</button>
          </div>
        )}
      </div>
    </div>
  );
}

// STYLING COMPONENTS
function Section({ title, color, children }: { title: string, color: 'blue' | 'pink', children: React.ReactNode }) {
  const borderColor = color === 'blue' ? 'border-blue-200' : 'border-pink-200';
  const textColor = color === 'blue' ? 'text-blue-800' : 'text-pink-800';
  return (
    <div className="space-y-6">
      <h2 className={`${textColor} font-black text-xl border-b-4 ${borderColor} pb-1`}>{title}</h2>
      {children}
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

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{label}</label>{children}</div>;
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} 
      className={`w-full border-2 border-slate-300 bg-white p-3 rounded-xl text-sm text-slate-900 font-bold placeholder:text-slate-300 focus:border-slate-900 outline-none transition-all ${className ?? ""}`} 
    />
  );
}