'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { Loader2, AlertTriangle, User as UserIcon, Edit, X } from 'lucide-react';

type UserType = {
    id: number;
    firstName: string;
    lastName?: string;
    email?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
};

export default function ManageUserPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<keyof UserType>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const dataFromApi: UserType[] = await apiClient.get('/admin/users');

            setUsers(dataFromApi);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal memuat data user.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users
            .filter(u =>
            (`${u.firstName} ${u.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .sort((a, b) => {
                let valA: any = a[sortField];
                let valB: any = b[sortField];

                // Handle undefined/null
                if (valA === undefined || valA === null) valA = '';
                if (valB === undefined || valB === null) valB = '';

                // Convert boolean to number supaya bisa compare
                if (typeof valA === 'boolean') valA = valA ? 1 : 0;
                if (typeof valB === 'boolean') valB = valB ? 1 : 0;

                // Convert to string untuk text compare
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();

                if (valA === valB) return 0;
                if (sortOrder === 'asc') return valA > valB ? 1 : -1;
                return valA > valB ? -1 : 1;
            });
    }, [users, searchQuery, sortField, sortOrder]);


    const handleEditUser = (user: UserType) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (updatedUser: UserType) => {
        try {
            await apiClient.post(`/admin/users/${updatedUser.id}/update`, updatedUser);
            setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan perubahan user.');
        }
    };

    const toggleSort = (field: keyof UserType) => {
        if (sortField === field) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="space-y-6 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-sky-400">Kelola User</h1>
                    <p className="text-slate-400 mt-1">Daftar user yang terdaftar di sistem.</p>
                </div>
                <input
                    type="text"
                    placeholder="Search name/email..."
                    className="px-3 py-2 rounded-lg text-black"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="animate-spin text-sky-500 mr-2" />
                    <span>Memuat daftar user...</span>
                </div>
            )}

            {/* Error */}
            {error && !isLoading && (
                <div className="bg-red-800/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg flex items-center">
                    <AlertTriangle size={24} className="mr-3 text-red-400" />
                    <div>
                        <p className="font-semibold">Gagal memuat data</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {!isLoading && !error && filteredUsers.length === 0 && (
                <div className="text-center py-16 bg-slate-800/50 rounded-lg">
                    <UserIcon size={48} className="mx-auto text-slate-500 mb-4" />
                    <p className="text-xl text-slate-400">Tidak ada user.</p>
                    <p className="text-slate-500 mt-1">Silakan tambahkan user baru.</p>
                </div>
            )}

            {!isLoading && !error && filteredUsers.length > 0 && (
                <div className="overflow-x-auto bg-slate-800 rounded-lg shadow-lg">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-900">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium text-slate-300 uppercase cursor-pointer"
                                    onClick={() => toggleSort('id')}
                                >
                                    ID {sortField === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium text-slate-300 uppercase cursor-pointer"
                                    onClick={() => toggleSort('firstName')}
                                >
                                    Nama {sortField === 'firstName' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300 uppercase">Email</th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium text-slate-300 uppercase cursor-pointer"
                                    onClick={() => toggleSort('role')}
                                >
                                    Role {sortField === 'role' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium text-slate-300 uppercase cursor-pointer"
                                    onClick={() => toggleSort('isActive')}
                                >
                                    Aktif {sortField === 'isActive' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300 uppercase">Dibuat</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-700">
                                    <td className="px-6 py-3 text-sm text-slate-300">{user.id}</td>
                                    <td className="px-6 py-3 text-sm text-slate-300">{`${user.firstName} ${user.lastName || ''}`.trim()}</td>
                                    <td className="px-6 py-3 text-sm text-slate-300">{user.email || '-'}</td>
                                    <td className="px-6 py-3 text-sm text-slate-300">{user.role}</td>
                                    <td className="px-6 py-3 text-sm text-slate-300">{user.isActive ? 'Ya' : 'Tidak'}</td>
                                    <td className="px-6 py-3 text-sm text-slate-400">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-3 text-sm text-slate-300">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 rounded-md text-white text-sm transition-colors"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-slate-800 p-6 rounded-lg w-96 relative">
                        <button
                            className="absolute top-3 right-3"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-sky-400 mb-4">Edit User</h2>

                        <label className="block text-sm text-slate-300 mb-1">First Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 rounded mb-3 text-black"
                            value={editingUser.firstName}
                            onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })}
                        />

                        <label className="block text-sm text-slate-300 mb-1">Last Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 rounded mb-3 text-black"
                            value={editingUser.lastName || ''}
                            onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })}
                        />

                        <label className="block text-sm text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 rounded mb-3 text-black"
                            value={editingUser.email || ''}
                            onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                        />

                        <label className="block text-sm text-slate-300 mb-1">Role</label>
                        <select
                            className="w-full px-3 py-2 rounded mb-3 text-black"
                            value={editingUser.role}
                            onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="USER">User</option>
                        </select>

                        <label className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={editingUser.isActive}
                                onChange={e => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                            />
                            <span className="text-slate-300">Aktif</span>
                        </label>

                        <button
                            onClick={() => editingUser && handleSaveUser(editingUser)}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded transition-colors"
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
