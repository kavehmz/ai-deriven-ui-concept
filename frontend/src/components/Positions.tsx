import { useState } from 'react';
import { ArrowUp, ArrowDown, X, Loader2, Briefcase } from 'lucide-react';
import { Position } from '../types';

interface PositionsProps {
  positions: Position[];
  authorized: boolean;
  onSell: (contractId: number) => Promise<void>;
}

export function Positions({ positions, authorized, onSell }: PositionsProps) {
  const [sellingId, setSellingId] = useState<number | null>(null);

  const openPositions = positions.filter((p) => !p.is_sold);
  
  const totalProfit = openPositions.reduce((sum, p) => sum + (p.profit || 0), 0);

  const handleSell = async (contractId: number) => {
    setSellingId(contractId);
    try {
      await onSell(contractId);
    } finally {
      setSellingId(null);
    }
  };

  const getContractTypeName = (type: string) => {
    if (type === 'CALL') return 'Rise';
    if (type === 'PUT') return 'Fall';
    return type;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Open Positions
          </h2>
          {openPositions.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded">
              {openPositions.length}
            </span>
          )}
        </div>
        
        {openPositions.length > 0 && (
          <div className={`text-sm font-medium ${totalProfit >= 0 ? 'profit' : 'loss'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} {openPositions[0]?.currency}
          </div>
        )}
      </div>

      {/* Positions List */}
      <div className="flex-1 overflow-y-auto">
        {!authorized ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connect your account to see positions
            </p>
          </div>
        ) : openPositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No open positions
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Place a trade to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {openPositions.map((position) => (
              <div
                key={position.contract_id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        position.contract_type === 'CALL'
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {position.contract_type === 'CALL' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getContractTypeName(position.contract_type)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {position.underlying || position.symbol}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSell(position.contract_id)}
                    disabled={sellingId === position.contract_id}
                    className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                  >
                    {sellingId === position.contract_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Buy</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {position.buy_price?.toFixed(2)} {position.currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Payout</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {position.payout?.toFixed(2)} {position.currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">P/L</div>
                    <div className={`font-medium ${(position.profit || 0) >= 0 ? 'profit' : 'loss'}`}>
                      {(position.profit || 0) >= 0 ? '+' : ''}
                      {(position.profit || 0).toFixed(2)} {position.currency}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

