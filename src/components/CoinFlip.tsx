import { motion, AnimatePresence } from 'framer-motion';

interface CoinFlipProps {
  isFlipping: boolean;
  result: 'heads' | 'tails' | null;
}

export default function CoinFlip({ isFlipping, result }: CoinFlipProps) {
  return (
    <div className="flex items-center justify-center" style={{ perspective: '1000px' }}>
      <div className="relative" style={{ width: 160, height: 160 }}>
        {isFlipping ? (
          <motion.div
            className="absolute inset-0"
            animate={{
              rotateY: [0, 360, 720, 1080, 1440, 1800],
              rotateX: [0, 15, -15, 10, -10, 0],
              y: [0, -40, 0, -20, 0, -10, 0],
            }}
            transition={{ duration: 2.0, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <CoinFace side="heads" />
          </motion.div>
        ) : result ? (
          <motion.div
            className="absolute inset-0"
            initial={{ rotateY: 1800, scale: 0.5 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <CoinFace side={result} />
          </motion.div>
        ) : (
          <motion.div
            className="absolute inset-0"
            animate={{ rotateY: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CoinFace side="heads" idle />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CoinFace({ side, idle }: { side: 'heads' | 'tails'; idle?: boolean }) {
  const isHeads = side === 'heads';
  return (
    <div
      className="w-40 h-40 rounded-full flex items-center justify-center relative"
      style={{
        background: isHeads
          ? 'radial-gradient(circle at 35% 35%, #ffd700, #b8860b, #8b6914)'
          : 'radial-gradient(circle at 35% 35%, #e8e8e8, #a0a0a0, #606060)',
        boxShadow: isHeads
          ? '0 0 30px rgba(255,215,0,0.6), inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.3)'
          : '0 0 30px rgba(180,180,180,0.5), inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.3)',
        border: isHeads ? '3px solid #d4af37' : '3px solid #999',
      }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-2 rounded-full"
        style={{
          border: isHeads ? '2px solid rgba(255,215,0,0.5)' : '2px solid rgba(255,255,255,0.3)',
        }}
      />
      {/* Inner content */}
      <div className="flex flex-col items-center justify-center z-10">
        <span className="text-4xl">{isHeads ? '👑' : '⚡'}</span>
        <span
          className="text-xs font-black tracking-widest mt-1"
          style={{ color: isHeads ? '#8b6914' : '#444', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
        >
          {isHeads ? 'HEAD' : 'TAIL'}
        </span>
      </div>
      {/* Shine effect */}
      <div
        className="absolute top-3 left-5 w-8 h-4 rounded-full opacity-40"
        style={{ background: 'white', filter: 'blur(4px)' }}
      />
      {idle && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }}
        />
      )}
    </div>
  );
}
