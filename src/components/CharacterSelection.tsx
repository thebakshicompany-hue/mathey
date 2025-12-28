import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Character } from '../types/game';
import { characters } from '../data/characters';
import { Sparkles, Zap } from 'lucide-react';

interface CharacterSelectionProps {
  selectedCharacter: Character | null;
  onCharacterSelect: (character: Character) => void;
  onNext: (playerName: string) => void; // Modified to accept player name
  onBack: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
}

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
            Choose Your Math Hero
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Each character has unique abilities to help you in battle!
          </p>
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-lg font-semibold">Special Powers Included</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {characters.map((character, index) => (
            <motion.div
              key={character.id}
              className={`relative cursor-pointer transform transition-all duration-300 ${
                selectedCharacter?.id === character.id
                  ? 'scale-105 z-10'
                  : 'hover:scale-102'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => onCharacterSelect(character)}
            >
              <div className={`
                relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 transition-all duration-300
                ${selectedCharacter?.id === character.id 
                  ? 'border-yellow-400 shadow-2xl shadow-yellow-400/25' 
                  : 'border-white/20 hover:border-white/40'
                }
              `}>
                {/* Selection Indicator */}
                {selectedCharacter?.id === character.id && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                {/* Character Avatar */}
                <div className="text-center mb-4">
                  <div className={`
                    w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-r ${character.color} 
                    flex items-center justify-center text-4xl transform transition-transform duration-300
                    ${selectedCharacter?.id === character.id ? 'rotate-12' : 'hover:rotate-6'}
                  `}>
                    {character.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{character.name}</h3>
                  <p className="text-sm text-gray-300 mb-3">{character.description}</p>
                </div>

                {/* Special Ability */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">Special Ability</span>
                  </div>
                  <p className="text-xs text-gray-300">{character.specialAbility}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Character Preview */}
        {selectedCharacter && (
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-yellow-400/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center space-x-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${selectedCharacter.color} flex items-center justify-center text-3xl`}>
                {selectedCharacter.avatar}
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-1">
                  You selected: {selectedCharacter.name}
                </h3>
                <input 
                  type="text" 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-center bg-transparent border-b-2 border-yellow-400 text-white text-lg w-full focus:outline-none"
                />
                <p className="text-yellow-400 font-semibold">
                  ⚡ {selectedCharacter.specialAbility}
                </p>
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
            onClick={() => onNext(playerName)} // Pass player name on click
            disabled={!selectedCharacter}
            className={`px-8 py-3 font-bold rounded-xl transition-all duration-200 ${
              selectedCharacter
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg'
                : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={selectedCharacter ? { scale: 1.05 } : {}}
            whileTap={selectedCharacter ? { scale: 0.95 } : {}}
          >
            Continue Adventure →
          </motion.button>
        </div>
      </div>
    </div>
  );
};