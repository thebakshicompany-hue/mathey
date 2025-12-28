import React from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Trophy, Lightbulb, MessageCircle, Zap, Target, Clock } from 'lucide-react';

interface GameExplainerProps {
  onStart: () => void;
  onBack: () => void;
}

export const GameExplainer: React.FC<GameExplainerProps> = ({ onStart, onBack }) => {
  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Answer Questions",
      description: "Solve math problems quickly and accurately to earn points",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Beat the Timer",
      description: "Each question has a time limit - faster answers earn bonus points",
      color: "from-red-400 to-pink-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Compete Live",
      description: "Play against up to 7 other players in real-time battles",
      color: "from-purple-400 to-indigo-500"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Get Smart Hints",
      description: "Stuck? Request AI-powered hints to guide you to the answer",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Chat & Celebrate",
      description: "Communicate with other players and celebrate victories together",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Climb Leaderboards",
      description: "Earn achievements and compete for the top spot on global rankings",
      color: "from-amber-400 to-yellow-500"
    }
  ];

  const gameFlow = [
    { step: 1, title: "Join Lobby", description: "Wait for other players to join your game room" },
    { step: 2, title: "Get Ready", description: "All players must click 'Ready' to start the game" },
    { step: 3, title: "Answer Questions", description: "Solve math problems as fast as you can" },
    { step: 4, title: "See Results", description: "Check your score and ranking after each round" },
    { step: 5, title: "Win & Celebrate", description: "The highest scorer wins the game!" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            How to Play Mathey
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Master the art of mathematical combat in this epic multiplayer adventure!
          </p>
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <Zap className="w-6 h-6" />
            <span className="text-lg font-semibold">Fast • Fun • Competitive</span>
            <Zap className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Game Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Game Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Game Flow */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">How a Game Works</h2>
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {gameFlow.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Step Number */}
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl relative z-10">
                    {item.step}
                  </div>
                  
                  {/* Step Content */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                  
                  {/* Arrow for mobile */}
                  {index < gameFlow.length - 1 && (
                    <div className="flex justify-center mt-4 lg:hidden">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-transparent"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-yellow-400/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white text-center mb-6">Pro Tips for Victory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Speed vs Accuracy</h4>
                  <p className="text-gray-300 text-sm">Balance quick thinking with correct answers for maximum points</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Use Hints Wisely</h4>
                  <p className="text-gray-300 text-sm">Don't be afraid to ask for hints on difficult problems</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Stay Focused</h4>
                  <p className="text-gray-300 text-sm">Keep your eyes on your own game and don't get distracted</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Practice Makes Perfect</h4>
                  <p className="text-gray-300 text-sm">The more you play, the faster you'll become at mental math</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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
            onClick={onStart}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-xl hover:from-green-500 hover:to-emerald-600 shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5 mr-2" />
            Let's Play!
          </motion.button>
        </div>
      </div>
    </div>
  );
};