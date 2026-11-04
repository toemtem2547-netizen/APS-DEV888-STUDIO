import React, { useState, useEffect } from 'react';
import { Shield, Plus, Lock, Mail, User } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { AdminUser } from '../../types';

export const AdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleId, setRoleId] = useState(2); // default admin

  const fetchAdmins = async () => {
    try {
      const res = await adminApi.getAdmins();
      if (res.data?.success) {
        setAdmins(res.data.data.admins);
        setRoles(res.data.data.roles);
      }
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createAdmin({ username, email, password, fullName, roleId: Number(roleId) });
      setIsModalOpen(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setFullName('');
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating admin');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">ผู้ดูแลระบบและสิทธิ์ (Admins & Roles)</h1>
          <p className="text-xs text-zinc-400">จัดการบัญชีผู้ดูแลระบบ กำหนดบทบาท Super Admin, Admin, Staff</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มผู้ดูแลระบบ</span>
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-[#10141E] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#151A28] text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6">ชื่อ-นามสกุล</th>
                <th className="py-4 px-6">Username</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">บทบาท (Role)</th>
                <th className="py-4 px-6">สถานะ</th>
                <th className="py-4 px-6">วันที่สร้าง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {admins.map((adm) => (
                <tr key={adm.id} className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-bold text-white text-sm">{adm.fullName}</td>
                  <td className="py-4 px-6 font-mono font-bold text-indigo-400">{adm.username}</td>
                  <td className="py-4 px-6 text-zinc-300">{adm.email}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {adm.roleName}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">
                    {new Date(adm.createdAt).toLocaleDateString('th-TH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">สร้างผู้ดูแลระบบใหม่</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">บทบาท (Role)</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} - {r.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  สร้างผู้ดูแลระบบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
