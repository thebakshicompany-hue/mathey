import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Character } from '../types/game';
import { characters } from '../data/characters';
import { Sparkles, Zap, ChevronLeft, ChevronRight, Target, Shield, Activity } from 'lucide-react';

interface CharacterSelectionProps {
  selectedCharacter: Character | null;
  onCharacterSelect: (character: Character) => void;
  onNext: (playerName: string) => void;
  onBack: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
}

const HUDCorner = () => (
  <>
    <div className="hud-corner hud-corner-tl" />
    <div className="hud-corner hud-corner-tr" />
    <div className="hud-corner hud-corner-bl" />
    <div className="hud-corner hud-corner-br" />
  </>
);

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  selectedCharacter,
  onCharacterSelect,
  onNext,
  onBack,
  playerName,
  setPlayerName
}) => {
  useEffect(() => {
    if (selectedCharacter) {
      setPlayerName(selectedCharacter.name);
    }
  }, [selectedCharacter, setPlayerName]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 relative overflow-hidden font-mono">
      <div className="scanline" />

      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header HUD */}
        <div className="flex justify-between items-end mb-12">
          <div className="tactical-panel px-8 py-4 border-l-orange-500">
            <HUDCorner />
            <h1 className="text-4xl font-black uppercase italic italic tracking-tighter glitch-text leading-none italic">Select Operator</h1>
            <p className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.5em] mt-2">Bio-Metric Verification Required</p>
          </div>

          <div className="hidden lg:flex items-center space-x-12 opacity-40">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase">Sync_Status</span>
              <span className="text-lg font-black italic">OPTIMAL</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase">Encryption</span>
              <span className="text-lg font-black italic">AES-256</span>
            </div>
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {characters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCharacterSelect(character)}
              className={`tactical-panel p-6 cursor-pointer group transition-all duration-300 border-l-2 ${selectedCharacter?.id === character.id
                  ? 'bg-orange-600/10 border-l-orange-500 shadow-tactical-glow-lg scale-[1.02]'
                  : 'bg-white/5 border-l-gray-800 hover:border-l-orange-500/50 hover:bg-white/10'
                }`}
            >
              <HUDCorner />
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black text-gray-600 tracking-widest">UNIT 00{index + 1}</span>
                <div className={`w-10 h-10 rounded-sm bg-gradient-to-r ${character.color} flex items-center justify-center text-xl`}>
                  {character.avatar}
                </div>
              </div>

              <h3 className="text-xl font-black uppercase italic italic mb-2 group-hover:translate-x-1 transition-transform">{character.name}</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-6 leading-relaxed">{character.description}</p>

              <div className="p-3 bg-black/40 border border-white/5 rounded-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-3 h-3 text-orange-500" />
                  <span className="text-[9px] font-black text-orange-500 uppercase">Primary Ability</span>
                </div>
                <p className="text-[10px] font-black text-white leading-tight uppercase tracking-tighter opacity-80">{character.specialAbility}</p>
              </div>

              {selectedCharacter?.id === character.id && (
                <motion.div
                  layoutId="outline"
                  className="absolute inset-0 border-2 border-orange-500/30 pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Selected Summary & Action Footer */}
        <div className="grid grid-cols-12 gap-8">
          <div className={`col-span-12 lg:col-span-8 tactical-panel p-8 flex items-center bg-gradient-to-r from-orange-600/10 to-transparent border-t-2 ${selectedCharacter ? 'border-t-orange-500' : 'border-t-gray-800 opacity-60'}`}>
            <HUDCorner />
            {selectedCharacter ? (
              <div className="flex items-center w-full">
                <div className={`w-24 h-24 rounded-sm bg-gradient-to-r ${selectedCharacter.color} flex items-center justify-center text-5xl mr-10 shadow-tactical-glow-lg border border-white/20`}>
                  {selectedCharacter.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] mb-2">Confirmed Operator</p>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-transparent text-5xl font-black italic italic italic text-white outline-none border-b-2 border-orange-500/20 focus:border-orange-500 transition-colors uppercase italic"
                  />
                </div>
                <div className="text-right ml-10">
                  <Activity className="w-8 h-8 text-orange-500 ml-auto mb-2 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-500 uppercase">Sync Level 1.0</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full py-4">
                <Shield className="w-8 h-8 text-gray-700 mr-4" />
                <span className="text-xl font-black text-gray-600 uppercase italic">Awaiting Bio-Metric Selection</span>
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4 flex space-x-4">
            <button
              onClick={onBack}
              className="flex-1 tactical-btn border-2 border-gray-800 text-gray-500 hover:text-white hover:border-white/20 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              ABORT
            </button>
            <button
              onClick={() => onNext(playerName)}
              disabled={!selectedCharacter}
              className={`flex-[2] tactical-btn-primary text-xl flex items-center justify-center ${!selectedCharacter ? 'opacity-20 cursor-not-allowed' : ''}`}
            >
              INITIATE SYNC
              <ChevronRight className="w-6 h-6 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};