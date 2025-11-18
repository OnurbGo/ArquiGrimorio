import React from "react";
import type { Item } from "../interface/types";

interface Props {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

const ItemsTable: React.FC<Props> = ({ items, onEdit, onDelete }) => {
  return (
    <div className="table-wrap">
      <table className="items-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Raridade</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.id}</td>
              <td className="bold">{it.name}</td>
              <td>{it.type}</td>
              <td>
                <span className={`pill rarity-${it.rarity?.toLowerCase()}`}>
                  {it.rarity}
                </span>
              </td>
              <td>{it.description}</td>
              <td>
                <button className="btn-outline" onClick={() => onEdit(it)}>
                  Editar
                </button>
                <button className="btn-danger" onClick={() => onDelete(it.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;
