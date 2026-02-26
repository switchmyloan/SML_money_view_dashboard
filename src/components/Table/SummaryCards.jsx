// SummaryCards.jsx
import React from 'react';
import { Users, CheckCircle, XCircle, TriangleAlert } from 'lucide-react';

const SummaryCards = ({
  totalLeads,
  successCount,
  rejectCount,
  duplicateCount,
  loading,
  in_progress,
  showInProgress = false,
  duplicateCard = false,
  errorsCount = 0,
  errorCard = false,
}) => {
  const cards = [
    {
      show: typeof totalLeads === 'number',
      title: 'Total Logs',
      value: totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      show: typeof successCount === 'number',
      title: 'Successful',
      value: successCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      show: typeof rejectCount === 'number',
      title: 'Rejected',
      value: rejectCount,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      show: duplicateCard && typeof duplicateCount === 'number',
      title: 'Duplicate',
      value: duplicateCount,
      icon: TriangleAlert,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      show: errorCard && typeof errorsCount === 'number',
      title: 'Errors',
      value: errorsCount,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      show: showInProgress && typeof in_progress === 'number',
      title: 'In Progress',
      value: in_progress,
      icon: TriangleAlert,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
  ].filter(card => card.show);

  const SkeletonCard = () => (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-3/4"></div>
    </div>
  );

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-5 gap-4 mb-4`}>
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        cards.map((card) => (
          <div 
            key={card.title}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition duration-300 hover:shadow-md"
          >
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {typeof card.value === 'number' ? card.value.toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${card.bg}`}>
              <card.icon className={`${card.color}`} size={24} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SummaryCards;