import React, { useState, useEffect } from 'react';
import { SearchInput } from './components/SearchInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { searchPlaces, refineResults } from './services/geminiService';
import { Coordinates, SearchState } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>('home');
  const [query, setQuery] = useState('');
  const [refinementQuery, setRefinementQuery] = useState(''); // New state for refinement
  const [coords, setCoords] = useState<Coordinates | undefined>(undefined);
  const [locationStatus, setLocationStatus] = useState<string>('Detectando...');
  
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    data: null,
    groundingChunks: null,
    error: null
  });

  const [isRefining, setIsRefining] = useState(false);

  // Get User Location on Mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationStatus('Ativo');
        },
        (error) => {
          console.warn("Geolocation denied or failed", error);
          setLocationStatus('Inativo');
        }
      );
    } else {
      setLocationStatus('N/A');
    }
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearchState(prev => ({ ...prev, isLoading: true, error: null, data: null })); // Reset data on new search
    setRefinementQuery(''); // Reset refinement input

    try {
      const result = await searchPlaces(query, coords);
      setSearchState({
        isLoading: false,
        data: result.text,
        groundingChunks: result.chunks || [],
        error: null
      });
    } catch (err: any) {
      setSearchState({
        isLoading: false,
        data: null,
        groundingChunks: null,
        error: err.message || "Ocorreu um erro na busca."
      });
    }
  };

  const handleRefinement = async () => {
    if (!refinementQuery.trim() || !searchState.data) return;

    setIsRefining(true);
    try {
      const newData = await refineResults(searchState.data, refinementQuery);
      setSearchState(prev => ({
        ...prev,
        data: newData
      }));
      setRefinementQuery(''); // Clear after success
    } catch (err: any) {
      setSearchState(prev => ({ ...prev, error: "Erro ao modificar resultados." }));
    } finally {
      setIsRefining(false);
    }
  };

  const navigateToDashboard = () => setCurrentPage('dashboard');
  const navigateToHome = () => setCurrentPage('home');

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 font-sans selection:bg-neon selection:text-black">
      
      {/* Global Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-dark-border h-16 flex items-center px-6 justify-between">
         <div onClick={navigateToHome} className="cursor-pointer flex items-center gap-2 group">
             <div className="w-3 h-3 bg-neon rounded-full group-hover:animate-ping"></div>
             <span className="font-bold text-xl tracking-tight text-white">ALPHA<span className="text-neon">CLIENTS</span></span>
         </div>
         <div className="flex items-center gap-4 text-xs font-mono">
            <span className={`px-2 py-1 rounded border ${coords ? 'border-neon/50 text-neon' : 'border-red-500/50 text-red-500'}`}>
              GPS: {locationStatus}
            </span>
            {currentPage === 'dashboard' && (
                <button onClick={navigateToHome} className="text-gray-400 hover:text-white transition-colors">Voltar</button>
            )}
         </div>
      </nav>

      {/* Pages */}
      <div className="pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
        
        {/* --- HOME PAGE --- */}
        {currentPage === 'home' && (
          <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in space-y-12">
            
            <div className="space-y-6 max-w-4xl">
               <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-neon text-sm font-mono mb-4">
                 v2.1 • Powered by Gemini Flash 2.5
               </div>
               <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
                 Encontre Clientes Reais em <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-green-600">Segundos.</span>
               </h1>
               <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                 Uma ferramenta de prospecção B2B inteligente que utiliza Inteligência Artificial e Google Maps para criar listas de leads formatadas e prontas para usar.
               </p>
               <button 
                 onClick={navigateToDashboard}
                 className="mt-8 px-10 py-5 bg-neon text-black font-extrabold text-lg rounded-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(57,255,20,0.3)]"
               >
                 COMEÇAR AGORA ➔
               </button>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12 text-left">
               <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border hover:border-neon/50 transition-colors group">
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">🤖</div>
                  <h3 className="text-xl font-bold text-white mb-2">IA Inteligente</h3>
                  <p className="text-gray-400 text-sm">Analisa sua solicitação em linguagem natural e filtra os melhores resultados do mapa.</p>
               </div>
               <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border hover:border-neon/50 transition-colors group">
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">🗺️</div>
                  <h3 className="text-xl font-bold text-white mb-2">Google Maps</h3>
                  <p className="text-gray-400 text-sm">Dados atualizados em tempo real: telefones, endereços e avaliações reais.</p>
               </div>
               <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border hover:border-neon/50 transition-colors group">
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">⚡</div>
                  <h3 className="text-xl font-bold text-white mb-2">Copiar & Colar</h3>
                  <p className="text-gray-400 text-sm">Formatação automática em lista para fácil exportação para CRM ou Excel.</p>
               </div>
            </div>
          </div>
        )}

        {/* --- DASHBOARD PAGE --- */}
        {currentPage === 'dashboard' && (
          <div className="flex-1 flex flex-col w-full animate-fade-in">
             
             {/* Search Header */}
             <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-white mb-6">Painel de Busca</h2>
               <SearchInput 
                 value={query}
                 onChange={setQuery}
                 onSearch={handleSearch}
                 isLoading={searchState.isLoading}
               />
             </div>

             {/* Error Message */}
             {searchState.error && (
                <div className="w-full max-w-2xl mx-auto p-4 mb-4 text-red-400 bg-red-900/10 border border-red-900 rounded-lg text-center font-mono text-sm">
                  ⚠️ {searchState.error}
                </div>
             )}

             {/* Empty State */}
             {!searchState.data && !searchState.isLoading && !searchState.error && (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-30">
                  <div className="text-9xl mb-4">🔍</div>
                  <p className="text-2xl font-bold">Aguardando pesquisa...</p>
               </div>
             )}

             {/* Results & Refinement */}
             {searchState.data && (
               <>
                 {/* REFINEMENT BOX - NEW FEATURE */}
                 <div className="w-full max-w-4xl mx-auto mb-8 bg-dark-surface/50 border border-dark-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center animate-fade-in">
                    <div className="flex-1 w-full">
                       <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Modificar pesquisa com IA</label>
                       <input 
                         type="text" 
                         value={refinementQuery}
                         onChange={(e) => setRefinementQuery(e.target.value)}
                         placeholder="Ex: Filtrar apenas os que abrem de sábado, ou remover os sem telefone..."
                         className="w-full bg-black/50 border border-dark-border rounded-lg px-4 py-2 text-white focus:border-neon outline-none text-sm"
                         onKeyDown={(e) => e.key === 'Enter' && handleRefinement()}
                       />
                    </div>
                    <button 
                      onClick={handleRefinement}
                      disabled={isRefining || !refinementQuery.trim()}
                      className="px-6 py-2 bg-dark-border hover:bg-white/10 text-white rounded-lg text-sm font-bold border border-white/10 transition-all disabled:opacity-50 whitespace-nowrap w-full md:w-auto"
                    >
                      {isRefining ? 'Analisando...' : 'Aplicar Filtro'}
                    </button>
                 </div>

                 <ResultsDisplay rawText={searchState.data} />
               </>
             )}
          </div>
        )}

      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-black/90 border-t border-dark-border py-2 text-center text-[10px] text-gray-600 font-mono pointer-events-none">
         ALPHACLIENTS SYSTEM V2.1.0
      </footer>
    </div>
  );
};

export default App;