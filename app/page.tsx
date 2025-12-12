'use client';

import { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import KPICards from './components/dashboard/KPICards';
import PerformanceChart from './components/charts/PerformanceChart';
import SecondaryCharts from './components/charts/SecondaryCharts';
import AdsTable from './components/dashboard/AdsTable';
import InsightsSection from './components/dashboard/InsightsSection';
import ConversionFunnel from './components/dashboard/ConversionFunnel';
import AudienceInsights from './components/dashboard/AudienceInsights';
import CampaignComparison from './components/dashboard/CampaignComparison';
import Recommendations from './components/dashboard/Recommendations';
import FooterActions from './components/dashboard/FooterActions';
import AdDetailsModal from './components/modal/AdDetailsModal';
import LoadingOverlay from './components/dashboard/LoadingOverlay';
import { MetricsProvider } from './lib/contexts';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdClick = (adId: string) => {
    console.log('Opening ad details for:', adId);
    setIsModalOpen(true);
  };

  return (
    <MetricsProvider>
      <LoadingOverlay />
      <Header />
      
      <main className="max-w-[1920px] mx-auto px-8 py-8">
        <KPICards />
        <PerformanceChart />
        <SecondaryCharts />
        <AdsTable onAdClick={handleAdClick} />
        <InsightsSection />
        <ConversionFunnel />
        <AudienceInsights />
        <CampaignComparison />
        <Recommendations />
        <FooterActions />
      </main>

      <Footer />

      <AdDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </MetricsProvider>
  );
}
