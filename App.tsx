import React, { useState, useRef, useEffect } from 'react';
import type { UserProfile, School } from './types';
import { getSchoolRecommendations } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import SchoolCard from './components/SchoolCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Welcome from './components/Welcome';

function App() {
  const [recommendations, setRecommendations] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [formKey, setFormKey] = useState(0); // Key to reset the form
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (profile: UserProfile) => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    setHasSearched(true);

    try {
      const schools = await getSchoolRecommendations(profile);
      setRecommendations(schools);
    } catch (err) {
      setError('Lo sentimos, no pudimos obtener las recomendaciones. Por favor, revisa tus datos e intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isLoading && hasSearched) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoading, hasSearched, recommendations, error]);

  const handleReset = () => {
    setRecommendations([]);
    setIsLoading(false);
    setError(null);
    setHasSearched(false);
    setFormKey(prevKey => prevKey + 1); // Change key to force remount of InputForm
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-100 font-sans text-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        <main>
          <div className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200/50">
            <InputForm key={formKey} onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          <div className="mt-10" ref={resultsRef} aria-live="polite">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            
            {!isLoading && !error && recommendations.length > 0 && (
              <div className="animate-fade-in">
                 <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-700">Aquí están tus recomendaciones personalizadas:</h2>
                 <div className="grid grid-cols-1 gap-6">
                    {recommendations.map((school, index) => (
                      <SchoolCard key={index} school={school} />
                    ))}
                 </div>
                 <p className="text-center text-xs text-gray-500 mt-8">
                    *Por favor, ten en cuenta: Las escuelas listadas son cargadas manualmente y pueden faltar algunas.
                 </p>
              </div>
            )}
            
            {!isLoading && !error && recommendations.length === 0 && hasSearched && (
                 <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md animate-fade-in">
                     <h3 className="text-xl font-semibold text-gray-700">No se encontraron escuelas</h3>
                     <p className="mt-2 text-gray-500">No pudimos encontrar ninguna escuela que coincida con todos tus criterios. Por favor, intenta ajustar tus preferencias.</p>
                 </div>
            )}

            {!hasSearched && <Welcome />}

            {hasSearched && !isLoading && (
              <div className="mt-8 text-center animate-fade-in">
                <button
                  onClick={handleReset}
                  className="py-2 px-6 border border-indigo-600 rounded-lg shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Iniciar Nueva Búsqueda
                </button>
              </div>
            )}
          </div>
        </main>
        <footer className="text-center py-6 mt-12">
          <p className="text-sm text-gray-500">
            Desarrollado con{' '}
            <a 
              href="https://ai.google.dev/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Google Gemini
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;