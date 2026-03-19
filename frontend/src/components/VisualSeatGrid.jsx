import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'SEAT';

const SeatElement = ({ seat, isOwn, onSwap, canDrag }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { seat },
    canDrag: () => canDrag && !!seat.student_id,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    canDrop: () => canDrag,
    drop: (item) => onSwap(item.seat, seat),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const variants = {
    own: "bg-yellow-400 dark:bg-yellow-500 border-yellow-500 text-black shadow-lg scale-105 z-10 animate-pulse",
    occupied: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md",
    empty: "bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 opacity-60",
    dragging: "opacity-30",
    isOver: "ring-4 ring-primary-300 dark:ring-primary-600 ring-offset-2 z-20"
  };

  const getStyle = () => {
    if (isDragging) return variants.dragging;
    if (isOver) return variants.isOver;
    if (isOwn) return variants.own;
    if (seat.student_id) return variants.occupied;
    return variants.empty;
  };

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`relative w-full aspect-square border-2 rounded-xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer select-none text-center ${getStyle()}`}
    >
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 absolute top-1 left-2 uppercase tracking-tighter">
        {seat.seat_number}
      </span>
      {seat.student_name ? (
        <>
          <span className="text-xs font-black truncate w-full px-1 text-gray-900 dark:text-gray-100">{seat.student_name.split(' ')[0]}</span>
          <span className="text-[9px] font-bold opacity-60 mt-0.5 text-gray-500 dark:text-gray-400">{seat.roll_number}</span>
        </>
      ) : (
        <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase italic">Empty</span>
      )}
    </div>
  );
};

const VisualSeatGrid = ({ seatPlan, rows, cols, currentStudentId, onSwap, adminMode = false }) => {
  // Create a grid map
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
  
  seatPlan.forEach(seat => {
    const r = seat.row - 1;
    const c = seat.col - 1;
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = seat;
    }
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Front / Board Indicator */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 py-3 rounded-lg text-center mb-10 border border-gray-200 dark:border-gray-700">
           <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Professor's Desk / Screen</p>
        </div>

        <div 
          className="grid gap-4 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {grid.flat().map((seat, idx) => (
            seat ? (
              <SeatElement 
                key={seat.seat_number}
                seat={seat}
                isOwn={seat.student_id === currentStudentId}
                canDrag={adminMode}
                onSwap={onSwap}
              />
            ) : (
              <div key={idx} className="w-full aspect-square border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl opacity-20"></div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisualSeatGrid;
