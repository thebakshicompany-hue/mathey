import React from 'react';
import { motion } from 'framer-motion';
import { GameMode, DifficultyLevel } from '../types/game';
import { gameModes, difficultyLevels } from '../data/gameModes';
import { Star, Clock, Trophy, Zap } from 'lucide-react';

interface GameModeSelectionProps {
  selectedMode: GameMode | null;
  selectedDifficulty: DifficultyLevel | null;
  onModeSelect: (mode: GameMode) => void;
  onDifficultySelect: (difficulty: DifficultyLevel) => void;
  onNext: () => void;
  onBack: () => void;
}

export const GameModeSelection: React.FC<GameModeSelectionProps> = ({
  selectedMode,
  selectedDifficulty,
  onModeSelect,
  onDifficultySelect,
  onNext,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Adventure
          </h1>
          <p className="text-xl text-gray-300">
            Select a game mode and difficulty level to begin your math quest!
          </p>
        </motion.div>

        {/* Game Modes */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Game Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                className={`
                  relative cursor-pointer transform transition-all duration-300
                  ${selectedMode?.id === mode.id ? 'scale-105 z-10' : 'hover:scale-102'}
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => onModeSelect(mode)}
              >
                <div className={`
                  relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 transition-all duration-300
                  ${selectedMode?.id === mode.id 
                    ? 'border-yellow-400 shadow-2xl shadow-yellow-400/25' 
                    : 'border-white/20 hover:border-white/40'
                  }
                `}>
                  {/* Selection Indicator */}
                  {selectedMode?.id === mode.id && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Star className="w-4 h-4 text-white" />
                    </motion.div>
                  )}

                  {/* Mode Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${mode.color} flex items-center justify-center text-3xl`}>
                    {mode.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-3">{mode.name}</h3>
                  <p className="text-gray-300 text-center mb-4">{mode.description}</p>

                  {/* Features */}
                  <div className="space-y-2">
                    {mode.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Difficulty Levels */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Difficulty Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {difficultyLevels.map((difficulty, index) => (
              <motion.div
                key={difficulty.id}
                className={`
                  cursor-pointer transform transition-all duration-300
                  ${selectedDifficulty?.id === difficulty.id ? 'scale-105' : 'hover:scale-102'}
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => onDifficultySelect(difficulty)}
              >
                <div className={`
                  relative bg-white/10 backdrop-blur-lg rounded-xl p-4 border-2 transition-all duration-300
                  ${selectedDifficulty?.id === difficulty.id 
                    ? 'border-yellow-400 shadow-xl shadow-yellow-400/25' 
                    : 'border-white/20 hover:border-white/40'
                  }
                `}>
                  {/* Selection Indicator */}
                  {selectedDifficulty?.id === difficulty.id && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Star className="w-3 h-3 text-white" />
                    </motion.div>
                  )}

                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${difficulty.color} flex items-center justify-center`}>
                    <Trophy className="w-6 h-6 text-white" />
                  </div>

                  <h4 className="font-bold text-white text-center mb-2">{difficulty.name}</h4>
                  <p className="text-xs text-gray-300 text-center mb-2">{difficulty.gradeRange}</p>
                  
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{difficulty.timeLimit}s</span>
                  </div>
                  
                  <div className="text-center mt-2">
                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full">
                      {difficulty.pointMultiplier}x points
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Selection Summary */}
        {(selectedMode || selectedDifficulty) && (
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-yellow-400/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Your Selection</h3>
              <div className="flex items-center justify-center space-x-8">
                {selectedMode && (
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedMode.color} flex items-center justify-center text-xl`}>
                      {selectedMode.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{selectedMode.name}</p>
                      <p className="text-gray-300 text-sm">Game Mode</p>
                    </div>
                  </div>
                )}
                
                {selectedDifficulty && (
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedDifficulty.color} flex items-center justify-center`}>
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{selectedDifficulty.name}</p>
                      <p className="text-gray-300 text-sm">{selectedDifficulty.gradeRange}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <motion.button
            onClick={onBack}
            className="px-6 py-3 bg-gray-500/20 border border-gray-400 text-gray-300 font-semibold rounded-xl hover:bg-gray-500/30 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back
          </motion.button>
          
          <motion.button
            onClick={onNext}
            disabled={!selectedMode || !selectedDifficulty}
            className={`px-8 py-3 font-bold rounded-xl transition-all duration-200 ${
              selectedMode && selectedDifficulty
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-lg'
                : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={selectedMode && selectedDifficulty ? { scale: 1.05 } : {}}
            whileTap={selectedMode && selectedDifficulty ? { scale: 0.95 } : {}}
          >
            Start Adventure →
          </motion.button>
        </div>
      </div>
    </div>
  );
};