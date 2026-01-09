import React, { useState, useEffect } from 'react';
import { FormattedClient } from '../types';

interface ResultsDisplayProps {
  rawText: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ rawText }) => {
  const [parsedLines, setParsedLines] = useState<FormattedClient[]>([]);
  const [copied, setCopied] = useState(false);

  // Helper to copy all text
  const handleCopyAll = () => {
    // Reconstruct the text with standard slashes for the user to copy
    // We use the 'rawLine' which we pre-formatted with slashes in the effect below
    const cleanText = parsedLines.map(l => l.rawLine).join('\n');
    navigator.clipboard.writeText(cleanText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Effect to parse the raw text from Gemini
  useEffect(() => {
    if (!rawText) return;

    const lines = rawText.split('\n');
    const parsed: FormattedClient[] = [];

    lines.forEach(line => {
      if (!line.trim()) return;

      // Logic for Link first: Link || Name || Phone || Infos
      // We use '||' now to safely capture URLs containing '/'
      const parts = line.split('||').map(s => s.trim());
      
      // If the model messed up and used single slashes, try to fallback (basic heuristic)
      // But ideally the prompt enforces ||
      
      if (parts.length >= 3) {
        const link = parts[0] || '#';
        const name = parts[1] || 'Desconhecido';
        const phone = parts[2] || 'S/ Tel';
        const infos = parts.slice(3).join(' ').trim() || '';

        // Create a display-friendly raw line using single slashes as requested by user originally
        const displayRawLine = `${link} / ${name} / ${phone} / ${infos}`;

        parsed.push({
          link,
          name,
          phone,
          infos,
          rawLine: displayRawLine
        });
      }
    });

    setParsedLines(parsed);
  }, [rawText]);

  if (!rawText) return null;

  return (
    <div className="w-full max-w-7xl mx-auto mt-8">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 gap-4 border-b border-dark-border pb-4">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-neon animate-pulse">⚡</span> 
            Resultados Encontrados
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Total: {parsedLines.length} leads localizados
          </p>
        </div>
        
        <button
          onClick={handleCopyAll}
          className={`px-6 py-3 rounded-lg text-base font-bold transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-1 ${
            copied 
              ? 'bg-white text-black ring-2 ring-neon' 
              : 'bg-dark-surface border border-neon text-neon hover:bg-neon hover:text-black'
          }`}
        >
          {copied ? (
            <>✓ LEADS COPIADOS!</>
          ) : (
            <>📋 COPIAR LISTA COMPLETA</>
          )}
        </button>
      </div>
      
      {/* Main List Area - Full Width */}
      <div className="bg-dark-surface rounded-xl shadow-2xl border border-dark-border overflow-hidden ring-1 ring-white/5">
        
        <div className="p-4 bg-black/40 border-b border-dark-border flex gap-4 text-xs uppercase tracking-widest font-semibold text-gray-500">
           <div className="w-16 shrink-0 text-center">Abrir</div>
           <div className="flex-1">Dados Detalhados (Link / Nome / Tel / Info)</div>
        </div>

        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          {parsedLines.length > 0 ? (
            parsedLines.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-4 border-b border-dark-border flex gap-4 items-start group transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/5'} hover:bg-white/10`}
              >
                {/* Clickable Icon Section */}
                <div className="w-16 shrink-0 pt-2 flex justify-center">
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noreferrer"
                      title="Abrir no Google Maps"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-dark-bg border border-neon/30 text-neon hover:bg-neon hover:text-black transition-all shadow-lg hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                </div>

                {/* Text Data Section */}
                <div className="flex-1 font-mono text-sm md:text-base break-words leading-relaxed pt-1">
                    
                    {/* The Full Link (Corrected) */}
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-neon font-bold text-base block mb-2 hover:underline truncate max-w-full"
                    >
                      {item.link}
                    </a>
                    
                    {/* The Data Row */}
                    <div className="text-white/90 space-y-2">
                       <div className="flex flex-wrap items-baseline gap-x-3">
                         <span className="font-extrabold text-white text-lg">{item.name}</span>
                         <span className="text-gray-600">/</span>
                         <span className="text-yellow-400 font-bold">{item.phone}</span>
                       </div>
                       
                       <div className="flex items-start gap-2 text-gray-400 text-sm border-l-2 border-neon/30 pl-3 py-1 mt-1 bg-white/5 rounded-r-lg">
                          <span className="mt-0.5">ℹ️</span>
                          <span>{item.infos}</span>
                       </div>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-600 italic">
              {rawText}
            </div>
          )}
        </div>
      </div>
      
      <p className="text-center text-xs text-gray-500 mt-4 font-mono">
        Formato de Cópia: &#123;Link&#125; / &#123;Nome&#125; / &#123;Telefone&#125; / &#123;Infos&#125;
      </p>

    </div>
  );
};