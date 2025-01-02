
// client/src/components/UserList.js
import React from 'react';

const UserList = ({ users, currentUsername, onUserSelect, selectedUser }) => {
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-bold mb-4">Active Users</h2>
      <ul className="space-y-2">
        {users.map((user, index) => (
          user.username !== currentUsername && (
            <li 
              key={index}
              className={`p-2 cursor-pointer rounded ${
                selectedUser?.username === user.username 
                  ? 'bg-blue-100' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onUserSelect(user)}
            >
              {user.username}
              {user.location && (
                <span className="text-green-500 ml-2">●</span>
              )}
            </li>
          )
        ))}
      </ul>
    </div>
  );
};

export default UserList;