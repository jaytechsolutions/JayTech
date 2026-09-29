import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Printer, X, Award, CheckCircle2, Edit3, Image, ShieldCheck, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId?: string;
  defaultStudentName: string;
  completionDate?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  courseTitle,
  courseId = 'tech-course',
  defaultStudentName,
  completionDate,
}: CertificateModalProps) {
  const [studentName, setStudentName] = useState(defaultStudentName || 'Student Name');
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [savingPNG, setSavingPNG] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Sync default name when opened
  useEffect(() => {
    if (defaultStudentName) {
      setStudentName(defaultStudentName);
    }
  }, [defaultStudentName]);

  // Trigger celebration confetti when opened
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // fallback if canvas-confetti is unavailable
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const certNumber = useRef(`KJ-CERT-${courseId.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`).current;
  const formattedDate = completionDate || new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getCleanFilename = (extension: string) => {
    const cleanStudent = (studentName || 'Student').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanCourse = (courseTitle || 'Course').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    return `Certificate_${cleanCourse}_${cleanStudent}.${extension}`;
  };

  const captureCertificateDataUrl = async (): Promise<string | null> => {
    if (!certificateRef.current) return null;
    const element = certificateRef.current;
    
    try {
      // html-to-image renders modern CSS color functions (like Tailwind v4 oklch) natively
      return await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#fcfbf7',
        cacheBust: true,
      });
    } catch (err) {
      console.warn('Primary toPng capture failed, retrying without cacheBust:', err);
      return await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#fcfbf7',
      });
    }
  };

  // 1. ACTIVATE DOWNLOAD CERTIFICATE BUTTON (PDF)
  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    setFeedback(null);
    try {
      const imgData = await captureCertificateDataUrl();
      if (!imgData) throw new Error('Certificate image capture failed');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(getCleanFilename('pdf'));
      setFeedback('PDF certificate downloaded successfully!');
    } catch (err) {
      console.error('Failed to generate PDF certificate:', err);
      setFeedback('Failed to generate PDF certificate. Please try saving as image.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  // 2. ACTIVATE SAVE IMAGE BUTTON (PNG)
  const handleDownloadPNG = async () => {
    setSavingPNG(true);
    setFeedback(null);
    try {
      const imgData = await captureCertificateDataUrl();
      if (!imgData) throw new Error('Certificate image capture failed');

      const link = document.createElement('a');
      link.href = imgData;
      link.download = getCleanFilename('png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setFeedback('Certificate image saved successfully!');
    } catch (err) {
      console.error('Failed to export PNG certificate:', err);
      setFeedback('Failed to save image. Please try again.');
    } finally {
      setSavingPNG(false);
    }
  };

  // 3. ACTIVATE PRINT CERTIFICATE BUTTON
  const handlePrint = async () => {
    setPrinting(true);
    setFeedback(null);
    try {
      const imgData = await captureCertificateDataUrl();
      if (!imgData) throw new Error('Certificate image capture failed');

      // Create dedicated hidden print frame for smooth printing inside iFrame
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Certificate - ${studentName || 'Student'}</title>
              <style>
                @page { size: landscape; margin: 0; }
                body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
                img { max-width: 100vw; max-height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${imgData}" onload="setTimeout(() => { try { window.focus(); window.print(); } catch(e) {} }, 300);" />
            </body>
          </html>
        `);
        frameDoc.close();
        setFeedback('Print dialog prepared!');
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 10000);
      }
    } catch (err) {
      console.error('Print generation failed, falling back to window.print():', err);
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-auto z-10 overflow-hidden flex flex-col max-h-[95vh] border border-gray-100"
        >
          {/* Header Controls Bar */}
          <div className="p-4 md:px-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Official Course Certificate</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </h3>
                <p className="text-xs text-blue-200">
                  Type your name below to customize, then download as PDF, save image, or print.
                </p>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                title="Download high-resolution PDF certificate"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={savingPNG}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                title="Save high-resolution PNG image"
              >
                <Image className="w-4 h-4 text-amber-200" />
                <span>{savingPNG ? 'Saving Image...' : 'Save Image'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={printing}
                className="flex items-center space-x-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                title="Print official certificate"
              >
                <Printer className="w-4 h-4 text-gray-300" />
                <span>{printing ? 'Printing...' : 'Print'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer ml-1"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feedback Toast */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-600 text-white text-xs font-bold px-6 py-2 flex items-center justify-between shadow-inner"
              >
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>{feedback}</span>
                </div>
                <button onClick={() => setFeedback(null)} className="text-white/80 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Customization Input Ribbon */}
          <div className="bg-amber-50/90 border-b border-amber-200 px-4 md:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-2 text-amber-950 font-bold text-xs md:text-sm">
              <Edit3 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Type your name to appear on the certificate:</span>
            </div>
            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter Full Name (e.g. John Doe)"
                className="w-full pl-3 pr-24 py-2 bg-white border border-amber-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm font-bold text-gray-900 outline-none transition-all shadow-inner"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-amber-800 bg-amber-100 font-extrabold px-2 py-0.5 rounded-md">
                Live Typing
              </span>
            </div>
          </div>

          {/* Certificate Scrollable Canvas Container */}
          <div className="p-4 md:p-8 overflow-auto flex-grow bg-slate-200/70 flex items-center justify-center">
            {/* The Actual Rendered Certificate Element */}
            <div
              ref={certificateRef}
              className="bg-[#fcfbf7] text-slate-900 w-[950px] min-w-[950px] h-[670px] relative p-8 shadow-2xl flex flex-col justify-between selection:bg-amber-200 overflow-hidden"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}
            >
              {/* Outer Decorative Multi-Layer Borders */}
              <div className="absolute inset-4 border-[6px] border-[#1e3a8a] pointer-events-none" />
              <div className="absolute inset-[22px] border-[2px] border-[#d97706] pointer-events-none" />
              <div className="absolute inset-[26px] border border-[#f59e0b]/40 pointer-events-none" />

              {/* Corner Ornaments */}
              <div className="absolute top-5 left-5 w-8 h-8 border-t-4 border-l-4 border-amber-600 pointer-events-none" />
              <div className="absolute top-5 right-5 w-8 h-8 border-t-4 border-r-4 border-amber-600 pointer-events-none" />
              <div className="absolute bottom-5 left-5 w-8 h-8 border-b-4 border-l-4 border-amber-600 pointer-events-none" />
              <div className="absolute bottom-5 right-5 w-8 h-8 border-b-4 border-r-4 border-amber-600 pointer-events-none" />

              {/* Watermark Crest Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award className="w-[450px] h-[450px] text-[#1e3a8a]" />
              </div>

              {/* Top Certificate Header */}
              <div className="relative z-10 text-center pt-2">
                <div className="inline-flex items-center space-x-2 text-[#1e3a8a] mb-1">
                  <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#d97706]" />
                  <span className="text-[14px] font-sans font-black tracking-[0.3em] uppercase text-amber-700">
                    JAYTECH SOLUTIONS
                  </span>
                  <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#d97706]" />
                </div>

                {/* Location and Software and Digital Solutions */}
                <p className="text-[11px] font-sans text-slate-800 uppercase tracking-widest font-black mb-0.5">
                  Koforidua, Ghana
                </p>
                <p className="text-[10px] font-sans text-blue-900 uppercase tracking-wider font-extrabold mb-3">
                  Software and Digital Solutions
                </p>

                <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-wide uppercase leading-tight font-serif">
                  Certificate of Completion
                </h1>
                <p className="text-xs font-sans tracking-[0.25em] text-amber-800 uppercase font-bold mt-1">
                  and technical excellence
                </p>
              </div>

              {/* Recipient Conferred Section */}
              <div className="relative z-10 text-center my-auto py-2">
                <p className="text-xs text-slate-500 italic tracking-wider font-serif mb-2">
                  This official certificate is proudly presented and conferred upon
                </p>

                {/* Dynamically Typed Student Name */}
                <div className="inline-block relative px-8 py-1 my-1">
                  <h2 className="text-3xl md:text-4xl font-black text-[#1e3a8a] tracking-tight font-serif uppercase pb-2">
                    {studentName.trim() || 'Student Name'}
                  </h2>
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#d97706] to-transparent mx-auto rounded-full" />
                </div>

                <p className="text-xs text-slate-600 font-sans max-w-xl mx-auto mt-3 leading-relaxed">
                  For having successfully and with distinction fulfilled all curriculum coursework, practical exercises, and technical requirements in the professional training program of:
                </p>

                {/* Course Title Badge */}
                <div className="mt-3">
                  <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-amber-300 font-serif font-black text-xl tracking-wide rounded-xl shadow-md border border-amber-400/40">
                    {courseTitle}
                  </span>
                </div>
              </div>

              {/* Bottom Credentials & Official Signatures Section */}
              <div className="relative z-10 grid grid-cols-3 items-end pt-4 pb-2 border-t border-slate-200/80 mx-4">
                {/* Left: Issue Date and Verification ID */}
                <div className="text-left font-sans">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                    Date of Issue & Verification
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {formattedDate}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    ID: {certNumber}
                  </p>
                  <p className="text-[9px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Official Authenticated Record</span>
                  </p>
                </div>

                {/* Center: Gold Foil Embossed Seal Medallion */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {/* Ribbon Tails */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
                      <div className="w-3.5 h-6 bg-amber-600 rotate-12 origin-top rounded-b" />
                      <div className="w-3.5 h-6 bg-amber-700 -rotate-12 origin-top rounded-b" />
                    </div>

                    {/* Circular Medallion */}
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-600 p-1 shadow-lg border-2 border-amber-200 flex items-center justify-center">
                      <div className="w-full h-full rounded-full border border-dashed border-amber-900/40 bg-gradient-to-br from-amber-500 via-yellow-300 to-amber-600 flex flex-col items-center justify-center text-center p-1 text-slate-900 shadow-inner">
                        <Award className="w-6 h-6 text-amber-950 mb-0.5" />
                        <span className="text-[7px] font-black uppercase tracking-tighter leading-none text-slate-950 font-sans">
                          OFFICIAL SEAL
                        </span>
                        <span className="text-[6px] font-bold uppercase tracking-tighter text-amber-950 font-sans">
                          EXCELLENCE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Instructor Signature Section */}
                <div className="text-right font-sans">
                  {/* Signature */}
                  <div className="inline-block pb-1 border-b-2 border-slate-700 pr-2 pl-4">
                    <span
                      className="text-2xl text-blue-950 select-none block"
                      style={{
                        fontFamily: "cursive",
                        letterSpacing: '1px'
                      }}
                    >
                      Joseph Amponsah
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-wide">
                    Joseph Amponsah
                  </p>
                  <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                    Lead Instructor & Founder
                  </p>
                  <p className="text-[9px] text-slate-500">
                    JayTech Solutions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls with ALL 3 ACTIVATED BUTTONS */}
          <div className="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-gray-500 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Official certificate issued by JayTech Solutions • Instructor: <strong>Joseph Amponsah</strong>
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* PRINT BUTTON */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={printing}
                className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                <span>{printing ? 'Printing...' : 'Print Certificate'}</span>
              </button>

              {/* SAVE IMAGE BUTTON */}
              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={savingPNG}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Image className="w-4 h-4 text-amber-200" />
                <span>{savingPNG ? 'Saving Image...' : 'Save Image (PNG)'}</span>
              </button>

              {/* DOWNLOAD CERTIFICATE BUTTON */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingPDF ? 'Preparing PDF...' : 'Download Certificate (PDF)'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
