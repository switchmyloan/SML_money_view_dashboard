import { useState, useEffect } from 'react';
import { RoleApi } from '../../api-services/Modules/RoleApi';
import ToastNotification from '../../components/Notification/ToastNotification';

function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newRoleName, setNewRoleName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editingRole, setEditingRole] = useState(null); // { id, name }
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const fetchedRoles = await RoleApi.getRoles();
      setRoles(fetchedRoles);
    } catch (err) {
      setError(err.message);
      ToastNotification.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      ToastNotification.warn('Role name cannot be empty.');
      return;
    }
    setIsCreating(true);
    try {
      await RoleApi.createRole(newRoleName.trim());
      setNewRoleName('');
      ToastNotification.success('Role created successfully!');
      fetchRoles(); // Refresh the list
    } catch (err) {
      ToastNotification.error(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingRole || !editingRole.name.trim()) {
      ToastNotification.warn('Role name cannot be empty.');
      return;
    }
    setIsUpdating(true);
    try {
      await RoleApi.updateRole(editingRole.id, editingRole.name.trim());
      setEditingRole(null);
      ToastNotification.success('Role updated successfully!');
      fetchRoles(); // Refresh the list
    } catch (err) {
      ToastNotification.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await RoleApi.deleteRole(roleId);
        ToastNotification.success('Role deleted successfully!');
        fetchRoles(); // Refresh the list
      } catch (err) {
        ToastNotification.error(err.message);
      }
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading roles...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
      </div>

      {/* Create Role Form */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create New Role</h2>
        <form onSubmit={handleCreateRole} className="flex gap-4">
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Enter new role name"
            className="flex-grow p-2 border rounded-md"
            disabled={isCreating}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      {/* Roles Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Roles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingRole?.id === role.id ? (
                      <form onSubmit={handleUpdateRole}>
                        <input
                          type="text"
                          value={editingRole.name}
                          onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                          className="p-1 border rounded-md"
                          autoFocus
                        />
                      </form>
                    ) : (
                      role.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingRole?.id === role.id ? (
                      <div className="flex gap-4 justify-end">
                        <button
                          onClick={handleUpdateRole}
                          className="text-green-600 hover:text-green-900"
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditingRole(null)} className="text-gray-600 hover:text-gray-900">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-4 justify-end">
                        <button onClick={() => setEditingRole({ ...role })} className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </button>
                        {role.name !== 'super-admin' && (
                           <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:text-red-900">
                           Delete
                         </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RoleManagementPage;