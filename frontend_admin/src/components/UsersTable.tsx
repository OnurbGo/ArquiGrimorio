import React from "react";
import type { User } from "../interface/types";

interface Props {
  users: User[];
  onDelete: (id: number) => void;
}

const UsersTable: React.FC<Props> = ({ users, onDelete }) => {
  return (
    <div className="table-wrap">
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Função</th>
            <th>Cadastro</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td className="bold">{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span className="pill">{u.admin ? "Admin" : "Jogador"}</span>
              </td>
              <td>{new Date(u.createdAt).toISOString().slice(0, 10)}</td>
              <td>
                {!u.admin && (
                  <button className="btn-danger" onClick={() => onDelete(u.id)}>
                    Excluir
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
