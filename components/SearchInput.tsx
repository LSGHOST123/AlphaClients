import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onSearch, isLoading }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault(); // Prevent new line on Enter, submit instead
      onSearch();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      <div className="absolute top-5 left-4 pointer-events-none">
        <svg aria-hidden="true" className="w-6 h-6 text-neon transition-all group-focus-within:drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <textarea
        className="block w-full h-32 p-4 pl-14 text-base md:text-lg text-white border-2 border-dark-border rounded-xl bg-dark-surface focus:ring-2 focus:ring-neon focus:border-neon placeholder-gray-500 outline-none transition-all shadow-lg font-mono tracking-wide resize-none custom-scrollbar leading-relaxed"
        placeholder="Descreva detalhadamente o que procura...&#10;Ex: Salões de beleza com nota acima de 4.0, que abrem de segunda-feira e ficam no centro..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <button
        onClick={onSearch}
        disabled={isLoading}
        className={`absolute right-4 bottom-4 bg-neon hover:bg-green-400 focus:ring-4 focus:outline-none focus:ring-neon-dim font-bold rounded-lg text-sm px-6 py-2 text-black transition-all transform active:scale-95 uppercase tracking-wider shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Buscando...
          </div>
        ) : (
          'PESQUISAR'
        )}
      </button>
    </div>
  );
};