import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus } from 'lucide-react';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ room_number: '', capacity: '', rows: '', cols: '', building: '', floor: '' });

  const fetchRooms = async () => {
    try {
      const res = await api.get('/admin/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.capacity && payload.rows && payload.cols) {
        payload.capacity = parseInt(payload.rows) * parseInt(payload.cols);
      }
      await api.post('/admin/rooms', payload);
      setForm({ room_number: '', capacity: '', rows: '', cols: '', building: '', floor: '' });
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating room');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Manage Rooms</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleSubmit}>
            <input type="text" placeholder="Room Number (e.g. 101)" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400" value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} />
            <input type="number" placeholder="Total Capacity" className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} />
            <input type="number" placeholder="Rows" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400" value={form.rows} onChange={e => setForm({...form, rows: e.target.value})} />
            <input type="number" placeholder="Columns" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400" value={form.cols} onChange={e => setForm({...form, cols: e.target.value})} />
            <input type="text" placeholder="Building" className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 md:col-span-2" value={form.building} onChange={e => setForm({...form, building: e.target.value})} />
            <input type="text" placeholder="Floor" className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} />
            
            <button type="submit" className="bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700 flex items-center justify-center gap-2 font-medium md:col-span-1">
              <Plus className="w-4 h-4" /> Add Room
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grid</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {rooms.map(room => (
                <tr key={room._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">{room.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{room.building} {room.floor ? `(Flr ${room.floor})` : ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{room.capacity} seats</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{room.rows} rows × {room.cols} cols</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rooms.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400 font-medium">No rooms found. Add some above.</div>}
        </div>
      </div>
    </div>
  );
};

export default ManageRooms;
