const users = new Map();

export const getUsers = () => users;
export const getAllUsers = () => Array.from(users.values());
export const setUser = (id, userData) => users.set(id, userData);
export const removeUser = (id) => users.delete(id);