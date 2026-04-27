// src/api-services/Modules/RoleApi.jsx

// Mock data - in a real app, this would come from a database
let mockRoles = [
  { id: 1, name: 'super-admin' },
  { id: 2, name: 'mv-admin' },
  { id: 3, name: 'kb-admin' },
  { id: 4, name: 'mv-page' },
];

// Mock API functions
export const RoleApi = {
  getRoles: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockRoles];
  },

  createRole: async (roleName) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!roleName || mockRoles.some(r => r.name === roleName)) {
      throw new Error('Role name must be unique and not empty.');
    }
    const newRole = {
      id: Math.max(0, ...mockRoles.map(r => r.id)) + 1,
      name: roleName,
    };
    mockRoles.push(newRole);
    return newRole;
  },

  updateRole: async (roleId, newName) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const roleIndex = mockRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) {
      throw new Error('Role not found.');
    }
    if (!newName || mockRoles.some(r => r.name === newName && r.id !== roleId)) {
      throw new Error('Role name must be unique and not empty.');
    }
    mockRoles[roleIndex].name = newName;
    return { ...mockRoles[roleIndex] };
  },

  deleteRole: async (roleId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const roleIndex = mockRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) {
      throw new Error('Role not found.');
    }
    // Prevent deleting the super-admin role
    if (mockRoles[roleIndex].name === 'super-admin') {
      throw new Error('Cannot delete the super-admin role.');
    }
    mockRoles = mockRoles.filter(r => r.id !== roleId);
    return { message: 'Role deleted successfully.' };
  },
};