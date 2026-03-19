import React from 'react';

const AttendanceHeatmap = ({ seatPlan, rows = 10, cols = 5 }) => {
  // Map seatPlan into a 2D array if possible, or just a grid of colored boxes
  // If seatPlan doesn't have row/col indices, we'll flow it into the grid
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-500 shadow-green-500/50 dark:shadow-green-900/20';
      case 'Absent':  return 'bg-red-500 shadow-red-500/50 dark:shadow-red-900/20';
      default:        return 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Attendance Heatmap</h3>
        <div className="flex gap-4 text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Present</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Absent</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></div> Pending</div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
        {seatPlan.map((seat, i) => (
          <div 
            key={i} 
            title={`${seat.student_name} (${seat.seat_number})`}
            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-black text-white transition-all hover:scale-110 shadow-lg cursor-help ${getStatusColor(seat.attendance)}`}
          >
            {seat.seat_number.split('-').pop()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceHeatmap;
