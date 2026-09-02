import React from 'react';
import { useImperium } from './context/ImperiumContext';
import { BinaryBackground } from './components/BinaryBackground';
import { Header } from './components/Header';
import { NexusControl } from './components/NexusControl';
import { PrimaryTouchBar } from './components/PrimaryTouchBar';
import { NexusOperationsBar } from './components/NexusOperationsBar';
import { ActionRequiredSection } from './components/ActionRequiredSection';
import { SystemStatusGrid } from './components/SystemStatusGrid';
import { NexusActivityFeed } from './components/NexusActivityFeed';
import { GotOneSection } from './components/GotOneSection';
import { PositionsSection } from './components/PositionsSection';
import { WorkerNetworkSection } from './components/WorkerNetworkSection';
import { RiskCapitalSection } from './components/RiskCapitalSection';
import { NexusLearningSection } from './components/NexusLearningSection';
import { DecisionArchiveSection } from './components/DecisionArchiveSection';
import { LogsSection } from './components/LogsSection';
import { BottomNav } from './components/BottomNav';

// Modals
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { PositionDetailModal } from './components/PositionDetailModal';
import { WorkerDetailModal } from './components/WorkerDetailModal';
import { MarketsModal } from './components/MarketsModal';
import { PortfolioModal } from './components/PortfolioModal';
import { RiskModal } from './components/RiskModal';
import { NexusHubModal } from './components/NexusHubModal';
import { NexusNavigator } from './components/NexusNavigator';
import { WorkersHubModal } from './components/WorkersHubModal';
import { DecisionArchiveModal } from './components/DecisionArchiveModal';
import { LearningModal } from './components/LearningModal';
import { SettingsModal } from './components/SettingsModal';
import { StockWorkspaceModal } from './components/StockWorkspaceModal';
import { NexusFaceAssistant } from './components/NexusFaceAssistant';
import { MoneyModal } from './components/MoneyModal';
import { LiveOperationsModal } from './components/LiveOperationsModal';
import { DailyBriefModal } from './components/DailyBriefModal';
import { AuthModal } from './components/AuthModal';
import { FinancialExplanationsModal } from './components/FinancialExplanationsModal';

export default function App() {
  const { activeModal, setActiveModal } = useImperium();
  const [conceptExplanationKey, setConceptExplanationKey] = React.useState<string | null>(null);
  const [isConceptModalOpen, setIsConceptModalOpen] = React.useState(false);

  const openConceptGuide = (key: string) => {
    setConceptExplanationKey(key);
    setIsConceptModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0D0D0E] text-[#D1D1D1] selection:bg-[#C5A059]/30 selection:text-[#E5E5E5] font-sans pb-20">
      {/* Dynamic Matrix / Cyber Stream Canvas */}
      <BinaryBackground />

      {/* Main High-Density Cockpit Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Branding & Connection Bar */}
        <Header />

        {/* Primary Dimensional Octagonal Nexus Centerpiece */}
        <NexusControl />

        {/* Primary 5-Touch Controls Bar */}
        <PrimaryTouchBar />

        {/* Nested Operations Control Grid */}
        <NexusOperationsBar />

        {/* Critical Human Escalations (if any) */}
        <ActionRequiredSection />

        {/* 8-Panel System Telemetry Matrix */}
        <SystemStatusGrid />

        {/* Real-time Nexus Supervisory Feed */}
        <NexusActivityFeed />

        {/* Got One Opportunity Proposals Queue */}
        <GotOneSection />

        {/* Open Paper Positions & Portfolio Sentinel */}
        <PositionsSection />

        {/* 8 Specialist Research Desks */}
        <WorkerNetworkSection />

        {/* Risk Management & Capital Allocation */}
        <RiskCapitalSection />

        {/* Nexus Learning & Auditable Strategy Weights */}
        <NexusLearningSection />

        {/* Decision Archive (Approved & Rejected Records) */}
        <DecisionArchiveSection />

        {/* System Telemetry & Plain-English Audit Logs */}
        <LogsSection />

        {/* Mobile Bottom Quick-Access Bar */}
        <BottomNav />
      </div>

      {/* Persistent Separate Nexus Robot Face Assistant */}
      <NexusFaceAssistant />

      {/* Modal Overlays */}
      {activeModal === 'NEXUS' && (
        <NexusNavigator
          isOpen={true}
          currentScreenName="IMPERIUM_COMMAND_CENTER"
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'GOT_ONE_DETAIL' && <OpportunityDetailModal />}
      {activeModal === 'POSITION_DETAIL' && <PositionDetailModal />}
      {activeModal === 'WORKER_DETAIL' && <WorkerDetailModal />}
      {activeModal === 'MARKETS' && <MarketsModal />}
      {activeModal === 'PORTFOLIO' && <PortfolioModal />}
      {activeModal === 'STOCK_WORKSPACE' && <StockWorkspaceModal />}
      {activeModal === 'RISK' && <RiskModal />}
      {activeModal === 'NEXUS_HUB' && <NexusHubModal />}
      {activeModal === 'WORKERS' && <WorkersHubModal />}
      {activeModal === 'DECISION_DETAIL' && <DecisionArchiveModal />}
      {activeModal === 'LEARNING' && <LearningModal />}
      {activeModal === 'SETTINGS' && <SettingsModal />}
      {activeModal === 'LOGS' && <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-16 pb-24 px-3 sm:px-4"><LogsSection /></div>}

      {/* Full-Feature New Modals */}
      {(activeModal as any) === 'MONEY' && (
        <MoneyModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onOpenConceptExplanation={openConceptGuide}
        />
      )}
      {(activeModal as any) === 'LIVE_OPERATIONS' && (
        <LiveOperationsModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onOpenConceptExplanation={openConceptGuide}
        />
      )}
      {(activeModal as any) === 'DAILY_BRIEF' && (
        <DailyBriefModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onOpenConceptExplanation={openConceptGuide}
        />
      )}
      {(activeModal as any) === 'AUTH' && (
        <AuthModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Global Financial Explanations Plain-English Modal */}
      <FinancialExplanationsModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
        initialConceptKey={conceptExplanationKey}
      />
    </div>
  );
}


