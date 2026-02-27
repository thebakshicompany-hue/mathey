import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Users, Trophy, Zap, Layout, Clock, ChevronRight } from 'lucide-react';

interface GameAppProps {
  playerName: string;
  setGameState: (state: string) => void;
  setSinglePlayerFlow: (isSingle: boolean) => void;
}

const HUDCorner = () => (
  <>
    <div className="hud-corner hud-corner-tl" />
    <div className="hud-corner hud-corner-tr" />
    <div className="hud-corner hud-corner-bl" />
    <div className="hud-corner hud-corner-br" />
  </>
);

const App: React.FC<GameAppProps> = ({ playerName, setGameState, setSinglePlayerFlow }) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-mono">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 bg-black">
        {/* Animated Grid lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)',
            backgroundSize: '100px 100px'
          }}
        />
        <div className="scanline" />
      </div>

      {/* Top HUD Bar */}
      <nav className="relative z-20 flex items-center justify-between px-10 py-6 border-b border-orange-500/20 bg-black/80 backdrop-blur-md">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-600/20 border border-orange-500/50 flex items-center justify-center font-black text-2xl italic shadow-tactical-glow-logo relative">
              <HUDCorner />
              M
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter uppercase italic leading-none glitch-text">Mathey Ops</span>
              <span className="text-[10px] font-bold text-orange-500/60 uppercase tracking-[0.5em]">Command Hub v2.4</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-8 text-xs font-black uppercase tracking-[0.3em]">
            <a href="#" className="text-orange-500 border-b border-orange-500 pb-1">Barracks</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Armory</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Intelligence</a>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-500 uppercase">System Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-black text-green-500">CONNECTED</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Tactical Interface */}
      <main className="relative z-10 grid grid-cols-12 gap-6 p-8 h-[calc(100vh-100px)]">

        {/* Left: Mission Select */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col space-y-4">
          <div className="p-2">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-orange-500/80 mb-1 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Mission Selection
            </h2>
            <div className="h-[1px] w-full bg-gradient-to-r from-orange-500/50 to-transparent" />
          </div>

          {[
            { id: '01', title: 'Solo Training', desc: 'AI Combat Simulation', icon: Shield, color: 'orange', flow: true },
            { id: '02', title: 'Multiplayer Ops', desc: 'Live Squad Engagement', icon: Users, color: 'cyan', flow: false },
            { id: '03', title: 'Ranked Circuit', desc: 'Elite Ladder League', icon: Trophy, color: 'yellow', disabled: true },
          ].map((mission) => (
            <button
              key={mission.id}
              disabled={mission.disabled}
              onClick={() => { if (!mission.disabled) { setSinglePlayerFlow(mission.flow); setGameState('character-selection'); } }}
              className={`tactical-panel p-5 text-left group transition-all duration-300 border-l-2 ${mission.disabled ? 'opacity-40 grayscale cursor-not-allowed' :
                  mission.color === 'cyan' ? 'hover:bg-cyan-500/10 border-l-cyan-500' : 'hover:bg-orange-500/10 border-l-orange-500'
                }`}
            >
              <HUDCorner />
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-gray-600 tracking-widest">PHASE {mission.id}</span>
                <mission.icon className={`w-5 h-5 ${mission.color === 'cyan' ? 'text-cyan-500' : mission.color === 'yellow' ? 'text-yellow-500' : 'text-orange-500'}`} />
              </div>
              <h3 className="text-xl font-black uppercase italic italic mb-1 group-hover:translate-x-1 transition-transform">{mission.title}</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{mission.desc}</p>

              {!mission.disabled && (
                <div className="mt-6 flex items-center justify-between">
                  <span className={`text-[9px] font-black tracking-widest ${mission.color === 'cyan' ? 'text-cyan-500/80' : 'text-orange-500/80'}`}>UPLINK READY</span>
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${mission.color === 'cyan' ? 'text-cyan-500' : 'text-orange-500'}`} />
                </div>
              )}
            </button>
          ))}
        </aside>

        {/* Center: Hero Display */}
        <div className="col-span-12 lg:col-span-6 relative flex flex-col group">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Pulsating background ring */}
            <div className="w-[80%] h-[80%] border border-orange-500/10 rounded-full pulse-glow" />
            <div className="w-[60%] h-[60%] border border-orange-500/5 rounded-full pulse-glow" style={{ animationDelay: '1s' }} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full flex items-center justify-center p-12"
          >
            <img
              src="/images/character-tactical.png"
              alt="Operator"
              className="h-full object-contain relative z-10 drop-shadow-tactical-operator"
            />

            {/* HUD Callouts */}
            <div className="absolute top-[10%] left-[10%] tactical-panel p-3 min-w-[140px] border border-orange-500/30">
              <p className="text-[9px] font-black text-orange-500/60 uppercase">operator_id</p>
              <p className="text-base font-black italic uppercase italic tracking-tighter">MATHEY_ALPHA</p>
              <div className="h-1 bg-orange-500/20 mt-2 w-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  className="h-full bg-orange-500"
                />
              </div>
            </div>

            <div className="absolute top-[25%] right-[5%] tactical-panel p-3 min-w-[140px] border border-cyan-500/30 tactical-panel-cyan">
              <p className="text-[9px] font-black text-cyan-500/60 uppercase">calc_sync_rate</p>
              <p className="text-xl font-black italic italic">94.2 <span className="text-[10px] text-cyan-500/80 italic">%</span></p>
            </div>

            <div className="absolute bottom-[20%] left-[5%] tactical-panel p-3 min-w-[140px] border border-gray-500/30">
              <p className="text-[9px] font-black text-gray-500 uppercase">current_loadout</p>
              <p className="text-sm font-black italic">GEOMETRIC_V2</p>
            </div>
          </motion.div>
        </div>

        {/* Right: Operator Dossier */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col space-y-6">
          <div className="tactical-panel p-6 bg-gradient-to-br from-black/80 to-orange-950/30 border-t-orange-500 border-t-2">
            <HUDCorner />
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-sm">
                  <Layout className="w-10 h-10 text-orange-500/50" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm">LC</div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Elite Operator</span>
                <span className="text-2xl font-black uppercase italic italic tracking-tight glitch-text leading-none">{playerName}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-500 uppercase">Progression LVL 5</span>
                <span className="text-xs font-black text-gray-300 italic">2.5k to Lvl 6</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                <div className="h-full bg-orange-500 shadow-tactical-glow-xp w-[83%]" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 p-2 border border-white/5">
                  <p className="text-[8px] font-black text-gray-600 uppercase">Total Score</p>
                  <p className="text-lg font-black italic italic">124.5k</p>
                </div>
                <div className="bg-white/5 p-2 border border-white/5">
                  <p className="text-[8px] font-black text-gray-600 uppercase">Win Rate</p>
                  <p className="text-lg font-black italic italic">76%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 mb-4 ml-2">Active Objectives</h2>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { label: 'Calculation Core', task: 'Solve 100 Mult. Tasks', progress: '60/100', color: 'orange' },
                { label: 'Rapid Response', task: 'Average < 2s Answer', progress: '1.4s', color: 'cyan' },
              ].map((obj, i) => (
                <div key={i} className={`tactical-panel p-4 border-l-2 ${obj.color === 'cyan' ? 'border-l-cyan-500' : 'border-l-orange-500'}`}>
                  <p className={`text-[9px] font-black uppercase mb-1 ${obj.color === 'cyan' ? 'text-cyan-500' : 'text-orange-500'}`}>{obj.label}</p>
                  <p className="text-sm font-black italic uppercase italic tracking-tight">{obj.task}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-1 bg-white/5 flex-1 mr-4 overflow-hidden">
                      <div className={`h-full ${obj.color === 'cyan' ? 'bg-cyan-500' : 'bg-orange-500'} w-[60%]`} />
                    </div>
                    <span className="text-[10px] font-black text-gray-300 italic">{obj.progress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="tactical-btn py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-base shadow-tactical-glow-ready transition-all mt-4">
            ENGAGE MISSION
          </button>
        </aside>
      </main>

      {/* Static HUD Text */}
      <div className="fixed bottom-6 left-10 pointer-events-none opacity-40 flex items-center space-x-8 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
        <div className="flex items-center space-x-2">
          <Zap className="w-3 h-3" />
          <span>Server: ASIA_NORTH_04</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3" />
          <span>Up-Time: 124:45:09</span>
        </div>
      </div>
    </div>
  );
}

export default App;