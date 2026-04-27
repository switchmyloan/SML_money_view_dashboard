import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../custom-hooks/useAuth';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

// Available roles for the dropdown
const AVAILABLE_ROLES = [
    "super-admin",
    "admin",
    "mv-admin",
    "mv-page",
    "mv-page-admin",
    "kb-admin",
    "kb-mumbai",
    "kb-banglore",
    "short-page-admin",
];

// Main User Management Component
function UserManagementPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // State for the user being edited or deleted
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token, fetchUsers]);

    // Handlers for opening modals
    const handleAddUser = () => setIsAddModalOpen(true);
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };
    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    // Handlers for closing modals
    const closeModal = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button className="btn btn-primary" onClick={handleAddUser}>
                    <PlusCircle size={18} />
                    Add New User
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div className="bg-base-100 p-4 rounded-lg shadow-xl">
                    <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
                </div>
            )}

            {isAddModalOpen && <AddUserModal onClose={closeModal} onUserAdded={fetchUsers} token={token} />}
            {isEditModalOpen && selectedUser && <EditUserModal user={selectedUser} onClose={closeModal} onUserUpdated={fetchUsers} token={token} />}
            {isDeleteModalOpen && selectedUser && <DeleteConfirmationModal user={selectedUser} onClose={closeModal} onUserDeleted={fetchUsers} token={token} />}
        </div>
    );
}

// User Table Component
const UserTable = ({ users, onEdit, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="table w-full">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} className="hover">
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className="badge badge-ghost badge-sm">{user.role}</span></td>
                        <td className="text-center">
                            <button onClick={() => onEdit(user)} className="btn btn-ghost btn-sm" title="Edit">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => onDelete(user)} className="btn btn-ghost btn-sm text-error" title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// Add User Modal
const AddUserModal = ({ onClose, onUserAdded, token }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create user');
            
            toast.success('User created successfully!');
            onUserAdded();
            onClose();
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Add New User</h3>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <input type="text" name="name" placeholder="Full Name" className="input input-bordered w-full" required onChange={handleChange} />
                    <input type="email" name="email" placeholder="Email Address" className="input input-bordered w-full" required onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password" className="input input-bordered w-full" required onChange={handleChange} />
                    <select name="role" className="select select-bordered w-full" required onChange={handleChange} value={formData.role}>
                        {AVAILABLE_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <div className="modal-action">
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting && <span className="loading loading-spinner"></span>}
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit User Modal
const EditUserModal = ({ user, onClose, onUserUpdated, token }) => {
    const [formData, setFormData] = useState({ name: user.name, role: user.role });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update user');

            toast.success('User updated successfully!');
            onUserUpdated();
            onClose();
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Edit User: {user.email}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <input type="text" name="name" placeholder="Full Name" className="input input-bordered w-full" required onChange={handleChange} value={formData.name} />
                    <select name="role" className="select select-bordered w-full" required onChange={handleChange} value={formData.role}>
                        {AVAILABLE_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <div className="modal-action">
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting && <span className="loading loading-spinner"></span>}
                            Update User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ user, onClose, onUserDeleted, token }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.status !== 204) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete user');
            }
            toast.success('User deleted successfully!');
            onUserDeleted();
            onClose();
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Confirm Deletion</h3>
                <p className="py-4">Are you sure you want to delete the user <strong>{user.name} ({user.email})</strong>? This action cannot be undone.</p>
                <div className="modal-action">
                    <button className="btn" onClick={onClose}>Cancel</button>
                    <button className="btn btn-error" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting && <span className="loading loading-spinner"></span>}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;