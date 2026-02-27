import React from 'react';
import { motion } from 'framer-motion';
import { GameMode, DifficultyLevel } from '../types/game';
import { gameModes, difficultyLevels } from '../data/gameModes';
import { Star, Clock, Trophy, Zap, ChevronLeft, ChevronRight, Target, Activity, Settings } from 'lucide-react';

interface GameModeSelectionProps {
  selectedMode: GameMode | null;
  selectedDifficulty: DifficultyLevel | null;
  onModeSelect: (mode: GameMode) => void;
  onDifficultySelect: (difficulty: DifficultyLevel) => void;
  onNext: () => void;
  onBack: () => void;
}

const HUDCorner = () => (
  <>
    <div className="hud-corner hud-corner-tl" />
    <div className="hud-corner hud-corner-tr" />
    <div className="hud-corner hud-corner-bl" />
    <div className="hud-corner hud-corner-br" />
  </>
);

export const GameModeSelection: React.FC<GameModeSelectionProps> = ({
  selectedMode,
  selectedDifficulty,
  onModeSelect,
  onDifficultySelect,
  onNext,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 relative overflow-hidden font-mono">
      <div className="scanline" />
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header HUD */}
        <div className="flex justify-between items-end mb-12">
          <div className="tactical-panel px-8 py-4 border-l-cyan-500 tactical-panel-cyan">
            <HUDCorner />
            <h1 className="text-4xl font-black uppercase italic italic tracking-tighter glitch-text leading-none italic">Mission Parameters</h1>
            <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.5em] mt-2">Setting Engagement Protocols</p>
          </div>

          <div className="hidden lg:flex items-center space-x-12 opacity-40">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase">System_Load</span>
                <div className="flex space-x-1 mt-1">
                  {[1, 1, 1, 0, 0].map((v, i) => <div key={i} className={`w-2 h-1 ${v ? 'bg-cyan-500' : 'bg-white/10'}`} />)}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase">Operation</span>
              <span className="text-lg font-black italic">ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">

          {/* Left: Game Modes Selection */}
          <div className="col-span-12 lg:col-span-8 flex flex-col space-y-6">
            <div className="p-2 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">Tactical Modules</h2>
              <span className="text-[10px] font-black text-white/20">01 / 06</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameModes.map((mode, index) => (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onModeSelect(mode)}
                  className={`tactical-panel p-6 text-left group transition-all duration-300 border-l-2 relative ${selectedMode?.id === mode.id
                      ? 'bg-cyan-500/10 border-l-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-white/5 border-l-gray-800 hover:border-l-cyan-500/30'
                    }`}
                >
                  <HUDCorner />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[24px] group-hover:scale-110 transition-transform">{mode.icon}</span>
                    <div className={`px-2 py-0.5 border border-white/10 text-[8px] font-black uppercase tracking-widest ${selectedMode?.id === mode.id ? 'text-cyan-500 border-cyan-500/30' : 'text-gray-600'}`}>
                      {selectedMode?.id === mode.id ? 'Active' : 'Standby'}
                    </div>
                  </div>
                  <h3 className="text-xl font-black uppercase italic italic mb-1 italic">{mode.name}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight line-clamp-2 leading-tight">{mode.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {mode.features.slice(0, 2).map((f, i) => (
                      <span key={i} className="text-[8px] font-black text-white/30 border border-white/5 px-2 py-0.5 uppercase">{f}</span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right: Difficulty Selection */}
          <div className="col-span-12 lg:col-span-4 flex flex-col space-y-6">
            <div className="p-2 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">Intensity Grade</h2>
              <Target className="w-4 h-4 text-cyan-500/40" />
            </div>

            <div className="space-y-3">
              {difficultyLevels.map((diff, index) => (
                <button
                  key={diff.id}
                  onClick={() => onDifficultySelect(diff)}
                  className={`tactical-panel w-full p-4 text-left transition-all border-r-2 ${selectedDifficulty?.id === diff.id
                      ? 'bg-orange-500/10 border-r-orange-500'
                      : 'bg-white/5 border-r-transparent hover:bg-white/10'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black uppercase italic italic mb-0.5 italic">{diff.name}</h4>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{diff.gradeRange}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black italic italic text-orange-500">x{diff.pointMultiplier}</span>
                      <p className="text-[8px] font-black text-gray-700 uppercase">XP Multi</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-auto tactical-panel p-6 bg-black/60 border-t-2 border-t-cyan-500">
              <HUDCorner />
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Link Status</span>
                  <span className={selectedMode && selectedDifficulty ? 'text-green-500' : 'text-red-500'}>
                    {selectedMode && selectedDifficulty ? 'READY' : 'PENDING'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Processor</span>
                  <span className="text-white">QUANTUM_V4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex justify-between items-center">
          <button
            onClick={onBack}
            className="tactical-btn border-2 border-gray-800 text-gray-500 hover:text-white hover:border-white/20 flex items-center px-10"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            PREVIOUS PHASE
          </button>

          <button
            onClick={onNext}
            disabled={!selectedMode || !selectedDifficulty}
            className={`tactical-btn-primary px-16 py-6 text-2xl flex items-center ${!selectedMode || !selectedDifficulty ? 'opacity-20 cursor-not-allowed' : ''}`}
          >
            CONFIRM DEPLOYMENT
            <ChevronRight className="w-8 h-8 ml-4" />
          </button>
        </div>

      </div>
    </div>
  );
};