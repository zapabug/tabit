import { useState, useRef, useCallback, useEffect } from 'react';
import { useTableSession } from '../context/TableSessionContext';
import PaymentModal from './PaymentModal';
import Navigation from './Navigation';

const TRANSLATIONS = {
  en: {
    'cerveja_draft': 'Fresh draft beer 20cl',
    'poncha_tangerina': 'Traditional Madeiran tangerine punch',
    'poncha_regional': 'Traditional Madeiran honey and lemon punch',
    'poncha_regional_1l': 'Traditional Madeiran punch with peanuts and lupini beans',
    'tabua_petiscos': 'Platter with alheira, chorizo, fresh mushrooms, olives, 2 bruschettas, cheese and cold cuts, bread and crackers',
    'camarao_salteado': 'Sautéed shrimp',
    'cogumelos_salteados': 'Sautéed fresh mushrooms, served with bread',
    'bolo_caco': 'Traditional Madeiran bread with garlic butter',
    'prego_simples': 'Simple steak sandwich in traditional Madeiran bread',
    'hamburguer_vegetariano': 'Vegetarian burger with spinach, oats, carrots, fresh cheese, lettuce, tomato, fried onions and egg',
    'cerveja_trigo': 'German wheat beer',
    'cerveja_corona': 'Mexican beer',
    'sumo_laranja': 'Fresh orange juice',
    'cerveja_sem_alcool': 'Non-alcoholic beer'
  },
  pt: {
    'cerveja_draft': 'Cerveja de pressão 20cl',
    'poncha_tangerina': 'Poncha tradicional da Madeira com tangerina',
    'poncha_regional': 'Poncha tradicional da Madeira com mel e limão',
    'poncha_regional_1l': 'Poncha tradicional da Madeira com amendoins e tremoços',
    'tabua_petiscos': 'Tábua com alheira, chouriço, cogumelos frescos, azeitonas, 2 bruschettas, queijo e charcutaria, pão e bolachas',
    'camarao_salteado': 'Camarão salteado',
    'cogumelos_salteados': 'Cogumelos frescos salteados, servidos com pão',
    'bolo_caco': 'Bolo do caco com manteiga de alho',
    'prego_simples': 'Prego simples no bolo do caco',
    'hamburguer_vegetariano': 'Hambúrguer vegetariano com espinafres, aveia, cenoura, queijo fresco, alface, tomate, cebola frita e ovo',
    'cerveja_trigo': 'Cerveja de trigo alemã',
    'cerveja_corona': 'Cerveja mexicana',
    'sumo_laranja': 'Sumo de laranja natural',
    'cerveja_sem_alcool': 'Cerveja sem álcool'
  },
  es: {
    'cerveja_draft': 'Cerveza de barril 20cl',
    'poncha_tangerina': 'Ponche tradicional de Madeira con mandarina',
    'poncha_regional': 'Ponche tradicional de Madeira con miel y limón',
    'poncha_regional_1l': 'Ponche tradicional de Madeira con cacahuetes y altramuces',
    'tabua_petiscos': 'Tabla con alheira, chorizo, champiñones frescos, aceitunas, 2 bruschettas, queso y embutidos, pan y galletas',
    'camarao_salteado': 'Camarones salteados',
    'cogumelos_salteados': 'Champiñones frescos salteados, servidos con pan',
    'bolo_caco': 'Pan tradicional de Madeira con mantequilla de ajo',
    'prego_simples': 'Sándwich de bistec en pan tradicional de Madeira',
    'hamburguer_vegetariano': 'Hamburguesa vegetariana con espinacas, avena, zanahorias, queso fresco, lechuga, tomate, cebolla frita y huevo',
    'cerveja_trigo': 'Cerveza de trigo alemana',
    'cerveja_corona': 'Cerveza mexicana',
    'sumo_laranja': 'Zumo de naranja natural',
    'cerveja_sem_alcool': 'Cerveza sin alcohol'
  },
  de: {
    'cerveja_draft': 'Frisches Fassbier 20cl',
    'poncha_tangerina': 'Traditioneller Madeira-Punsch mit Mandarine',
    'poncha_regional': 'Traditioneller Madeira-Punsch mit Honig und Zitrone',
    'poncha_regional_1l': 'Traditioneller Madeira-Punsch mit Erdnüssen und Lupinen',
    'tabua_petiscos': 'Platte mit Alheira, Chorizo, frischen Pilzen, Oliven, 2 Bruschettas, Käse und Aufschnitt, Brot und Cracker',
    'camarao_salteado': 'Gebratene Garnelen',
    'cogumelos_salteados': 'Gebratene frische Pilze, serviert mit Brot',
    'bolo_caco': 'Traditionelles Madeira-Brot mit Knoblauchbutter',
    'prego_simples': 'Einfaches Steaksandwich auf traditionellem Madeira-Brot',
    'hamburguer_vegetariano': 'Vegetarischer Burger mit Spinat, Haferflocken, Karotten, Frischkäse, Salat, Tomate, gebratenen Zwiebeln und Ei',
    'cerveja_trigo': 'Deutsches Weizenbier',
    'cerveja_corona': 'Mexikanisches Bier',
    'sumo_laranja': 'Frischer Orangensaft',
    'cerveja_sem_alcool': 'Alkoholfreies Bier'
  },
  fr: {
    'cerveja_draft': 'Bière pression fraîche 20cl',
    'poncha_tangerina': 'Punch traditionnel de Madère à la mandarine',
    'poncha_regional': 'Punch traditionnel de Madère au miel et citron',
    'poncha_regional_1l': 'Punch traditionnel de Madère avec cacahuètes et lupins',
    'tabua_petiscos': 'Plateau avec alheira, chorizo, champignons frais, olives, 2 bruschettas, fromage et charcuterie, pain et crackers',
    'camarao_salteado': 'Crevettes sautées',
    'cogumelos_salteados': 'Champignons frais sautés, servis avec du pain',
    'bolo_caco': 'Pain traditionnel de Madère au beurre d\'ail',
    'prego_simples': 'Sandwich au steak dans du pain traditionnel de Madère',
    'hamburguer_vegetariano': 'Burger végétarien avec épinards, avoine, carottes, fromage frais, laitue, tomate, oignons frits et œuf',
    'cerveja_trigo': 'Bière de blé allemande',
    'cerveja_corona': 'Bière mexicaine',
    'sumo_laranja': 'Jus d\'orange frais',
    'cerveja_sem_alcool': 'Bière sans alcool'
  }
};

const MENU_ITEMS = [
  // Most Requested
  {
    id: 1,
    name: 'Super Bock',
    translationKey: 'cerveja_draft',
    price: 1.50,
    category: 'Most Requested'
  },
  {
    id: 2,
    name: 'Poncha de Tangerina',
    translationKey: 'poncha_tangerina',
    price: 4.00,
    category: 'Most Requested'
  },
  {
    id: 3,
    name: 'Poncha Regional',
    translationKey: 'poncha_regional',
    price: 4.00,
    category: 'Most Requested'
  },
  {
    id: 4,
    name: 'Poncha Regional 1L',
    translationKey: 'poncha_regional_1l',
    price: 30.00,
    category: 'Most Requested'
  },
  // Petiscos (Starters)
  {
    id: 5,
    name: 'Tábua de Petiscos',
    translationKey: 'tabua_petiscos',
    price: 30.00,
    category: 'Starters'
  },
  {
    id: 6,
    name: 'Camarão Salteado',
    translationKey: 'camarao_salteado',
    price: 12.00,
    category: 'Starters'
  },
  {
    id: 7,
    name: 'Cogumelos Frescos Salteados',
    translationKey: 'cogumelos_salteados',
    price: 8.00,
    category: 'Starters'
  },
  {
    id: 8,
    name: 'Bolo do Caco com Manteiga D\'alho',
    translationKey: 'bolo_caco',
    price: 2.50,
    category: 'Starters'
  },
  // Main Dishes
  {
    id: 9,
    name: 'Prego no Bolo do Caco',
    translationKey: 'prego_simples',
    price: 4.50,
    category: 'Main Dishes'
  },
  {
    id: 10,
    name: 'Hambúrguer Vegetariano',
    translationKey: 'hamburguer_vegetariano',
    price: 6.50,
    category: 'Main Dishes'
  },
  // Drinks
  {
    id: 11,
    name: 'Franziskaner',
    translationKey: 'cerveja_trigo',
    price: 6.00,
    category: 'Drinks'
  },
  {
    id: 12,
    name: 'Corona',
    translationKey: 'cerveja_corona',
    price: 4.50,
    category: 'Drinks'
  },
  {
    id: 13,
    name: 'Sumo de Laranja Natural',
    translationKey: 'sumo_laranja',
    price: 4.00,
    category: 'Drinks'
  },
  {
    id: 14,
    name: 'Super Bock sem Álcool',
    translationKey: 'cerveja_sem_alcool',
    price: 2.50,
    category: 'Drinks'
  }
];

export default function Menu() {
  const {
    addOrder,
    paymentStatus,
    handleInteraction,
    needsAssistance,
    assistanceReason,
    toggleAssistance,
    selectedItems,
    addToOrder,
    removeFromOrder,
    clearSelectedItems
  } = useTableSession();
  const [activeTab, setActiveTab] = useState('Drinks');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userLanguage, setUserLanguage] = useState('en');
  const observerRef = useRef(null);

  useEffect(() => {
    // Detect user's language
    const browserLang = navigator.language.toLowerCase().split('-')[0];
    setUserLanguage(TRANSLATIONS[browserLang] ? browserLang : 'en');
  }, []);

  useEffect(() => {
    // Create intersection observer with optimized settings
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Sort entries by their position in the viewport
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => {
            const rectA = a.boundingClientRect;
            const rectB = b.boundingClientRect;
            return Math.abs(rectA.top) - Math.abs(rectB.top);
          });

        if (visibleEntries.length > 0) {
          const mostVisible = visibleEntries[0];
          const sectionId = mostVisible.target.getAttribute('data-section');
          if (sectionId && sectionId !== 'Most Requested') {
            setActiveTab(sectionId);
          }
        }
      },
      {
        root: null,
        // Adjust rootMargin to better handle different window sizes
        rootMargin: '-10% 0px -40% 0px',
        // Multiple thresholds for smoother detection
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
      }
    );

    // Observe all section elements
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => {
      observerRef.current.observe(section);
    });

    // Cleanup observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handlePayment = useCallback(async (paymentMethod) => {
    console.log('Payment initiated:', paymentMethod);

    if (!selectedItems || !selectedItems.length) {
      console.error('No items selected');
      return;
    }

    handleInteraction();

    try {
      console.log('Processing payment with items:', selectedItems);
      let success = false;

      if (paymentMethod === 'lightning') {
        console.log('Starting Lightning payment...');
        success = await addOrder(selectedItems, 'lightning');
        console.log('Lightning payment result:', success);

        if (success) {
          console.log('Lightning payment successful, clearing items');
          clearSelectedItems();
          setShowPaymentModal(false);
        }
      } else if (paymentMethod === 'later') {
        console.log('Starting Pay Later...');
        success = await addOrder(selectedItems, 'later');
        console.log('Pay Later result:', success);

        if (success) {
          console.log('Pay Later successful, keeping items');
          setShowPaymentModal(false);
        }
      }

      if (!success) {
        console.error('Payment failed for method:', paymentMethod);
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  }, [selectedItems, addOrder, handleInteraction, clearSelectedItems, setShowPaymentModal]);

  // Define the tabs (excluding Most Requested which will always be visible)
  const tabs = ['Drinks', 'Starters', 'Main Dishes'];

  const handleTabClick = useCallback((tab) => {
    handleInteraction();
    setActiveTab(tab);

    // Enhanced scroll handling
    const element = document.querySelector(`[data-section="${tab}"]`);
    if (element) {
      // Calculate dynamic header offset based on viewport height
      const viewportHeight = window.innerHeight;
      const headerOffset = Math.min(120, viewportHeight * 0.15);

      // Get the element's position relative to the viewport
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;

      // Calculate the target scroll position
      const targetPosition = absoluteElementTop - headerOffset;

      // Smooth scroll with fallback for older browsers
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } else {
        // Fallback for browsers that don't support smooth scrolling
        window.scrollTo(0, targetPosition);
      }
    }
  }, [handleInteraction]);

  // Add scroll restoration prevention
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const originalScrollRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';

      return () => {
        window.history.scrollRestoration = originalScrollRestoration;
      };
    }
  }, []);

  // Add resize handler for dynamic adjustments
  useEffect(() => {
    const handleResize = () => {
      // Disconnect and reconnect observer with updated rootMargin
      if (observerRef.current) {
        observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
          (entries) => {
            const visibleEntries = entries
              .filter(entry => entry.isIntersecting)
              .sort((a, b) => {
                const rectA = a.boundingClientRect;
                const rectB = b.boundingClientRect;
                return Math.abs(rectA.top) - Math.abs(rectB.top);
              });

            if (visibleEntries.length > 0) {
              const mostVisible = visibleEntries[0];
              const sectionId = mostVisible.target.getAttribute('data-section');
              if (sectionId && sectionId !== 'Most Requested') {
                setActiveTab(sectionId);
              }
            }
          },
          {
            root: null,
            rootMargin: `-${Math.min(10, window.innerHeight * 0.1)}% 0px -${Math.min(40, window.innerHeight * 0.4)}% 0px`,
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
          }
        );

        // Re-observe sections
        const sections = document.querySelectorAll('[data-section]');
        sections.forEach((section) => {
          observerRef.current.observe(section);
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderMenuItems = (category) => (
    <div
      data-section={category}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4
        ${category === 'Most Requested' ? 'bg-gray-800 p-4 sm:p-6 rounded-xl border-2 border-gray-700' : ''}`}
    >
      {MENU_ITEMS.filter(item => item.category === category).map((item) => (
        <div
          key={item.id}
          className={`border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow
            ${category === 'Most Requested' ? 'bg-gray-700 border-gray-600' : 'bg-gray-700'}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-base sm:text-lg font-medium text-gray-100 truncate">{item.name}</h4>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">
                {TRANSLATIONS[userLanguage][item.translationKey]}
              </p>
              <div className="text-sm sm:text-base font-medium text-gray-100 mt-1 sm:mt-2">
                €{item.price.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 sm:space-x-3">
              {selectedItems.find(i => i.id === item.id)?.quantity > 0 && (
                <>
                  <button
                    onClick={() => removeFromOrder(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full touch-manipulation"
                    aria-label="Remove item"
                  >
                    <span className="text-lg">-</span>
                  </button>
                  <span className="text-gray-400 min-w-[1.5rem] text-center">
                    {selectedItems.find(i => i.id === item.id)?.quantity || 0}
                  </span>
                </>
              )}
              <button
                onClick={() => addToOrder(item)}
                className={`p-2 text-white rounded-full touch-manipulation
                  ${category === 'Most Requested' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                aria-label="Add item"
              >
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Navigation />
      <div className="space-y-6 pb-24 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-800 text-gray-200" style={{ backgroundImage: 'url(/path/to/texture.png)', backgroundBlendMode: 'multiply' }}>
        {/* Welcome Banner */}
        <div className="bg-gray-700 p-4 sm:p-6 rounded-lg border border-gray-600 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-1 sm:mb-2">Tab-IT</h1>
              <p className="text-sm sm:text-base text-gray-300">Modern Table Service Solution</p>
            </div>
            <div className="flex items-center gap-2">
              {needsAssistance && (
                <div className="bg-blue-50 py-1 px-3 rounded-full flex items-center gap-2">
                  <span className="animate-pulse">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </span>
                  <span className="text-sm text-blue-700">
                    {assistanceReason === 'no_interaction' ? 'Server Notified' : 'Assistance Requested'}
                  </span>
                </div>
              )}
              <button
                onClick={() => toggleAssistance()}
                className={`rounded-full p-2 transition-colors ${
                  needsAssistance
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
                title="Request Assistance"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-600 sticky top-0 bg-gray-800 z-10">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors duration-200
                ${activeTab === tab
                  ? 'border-orange-400 text-orange-300'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Most Requested Section - Always Visible */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-100 border-b pb-2">
          Most Requested
        </h3>
        {renderMenuItems('Most Requested')}
      </div>

      {/* Tab Sections */}
      <div className="space-y-8">
        {tabs.map((tab) => (
          <div key={tab} className="scroll-mt-40">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-4">
              {tab}
            </h3>
            {renderMenuItems(tab)}
          </div>
        ))}
      </div>

      {/* Selected Items - Fixed Bottom Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-700 border-t shadow-lg z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center py-3 sm:py-4 gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-sm sm:text-base text-gray-300">
                  {selectedItems.reduce((total, item) => total + item.quantity, 0)} items
                </span>
                <span className="text-base sm:text-lg font-medium">
                  Total: €{selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={clearSelectedItems}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 text-sm font-medium transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-gray-900 rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        onPayment={handlePayment}
        onCancel={() => setShowPaymentModal(false)}
        selectedItems={selectedItems}
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
      />
      </div>
    </>
  );
}