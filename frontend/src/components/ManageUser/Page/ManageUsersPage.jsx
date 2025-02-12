import React, { useEffect, useState } from "react";
import { Button, IconButton } from "@mui/material";
import { userService } from "../../../services/authService";
import EditUserModal from "../editUser/EditUserModal";
import DeleteUserModal from "../deleteUser/DeleteUserModal";
import AddUserModal from "../addUser/AddUserModal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import './ManageUsersPage.css';

const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [isAddingUser, setIsAddingUser] = useState(false);

    const fetchUsers = async () => {
        try {
            const usersData = await userService.getUsers();
            setUsers(usersData);
        } catch (error) {
            setError("Error al cargar los usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) {
        return <div>Cargando usuarios...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2 className="GU">Gestión de Usuarios</h2>
            <div className="contentManageUsers">
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsAddingUser(true)}
                        className="add-user-button"
                    >
                        Añadir Usuario
                    </Button>
                </div>

                <div className="table">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Editar</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.nombre}</td>
                                    <td>{user.correo}</td>
                                    <td>{user.rol}</td>
                                    <td>
                                        <IconButton
                                            sx={{ color: 'rgb(3, 155, 229)' }}
                                            onClick={() => setEditingUser(user)}
                                            className="editIcon"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </td>
                                    <td>
                                        <IconButton
                                            sx={{ color: 'rgb(244, 67, 54)'}}
                                            onClick={() => setDeletingUser(user)}
                                            className="deleteIcon"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onUpdate={fetchUsers}
                />
            )}
            {deletingUser && (
                <DeleteUserModal
                    user={deletingUser}
                    onClose={() => setDeletingUser(null)}
                    onDelete={fetchUsers}
                />
            )}
            {isAddingUser && (
                <AddUserModal
                    onClose={() => setIsAddingUser(false)}
                    onAdd={fetchUsers}
                />
            )}
        </div>
    );
};

export default ManageUsersPage;