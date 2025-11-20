import React, { useState } from "react";
import type { Item } from "../interface/types";

interface Props {
  item: Item;
  onClose: () => void;
  onSave: (it: Item) => void;
}

const RARITY_OPTIONS = [
  "Comum",
  "Incomum",
  "Raro",
  "Muito Raro",
  "Lendária",
  "Artefato",
];

const TYPE_OPTIONS = [
  "Arma",
  "Armadura",
  "Escudo",
  "Pergaminho",
  "Poção",
  "Anel",
  "Amuleto",
  "Varinha",
  "Cajado",
  "Outros",
];

const EditItemModal: React.FC<Props> = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState<Item>({ ...item });

  const setField = <K extends keyof Item>(key: K, value: Item[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      price: typeof form.price === "string" ? Number(form.price) : form.price,
    };
    onSave(payload);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar Item</h3>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <form
            className="edit-item-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="form-row">
              <label className="field-label" htmlFor="item-name">
                Nome
              </label>
              <input
                id="item-name"
                className="field-input input"
                type="text"
                value={form.name ?? ""}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>

            <div className="form-row two-col">
              <div className="col">
                <label className="field-label" htmlFor="item-type">
                  Tipo
                </label>
                <div className="select-wrapper">
                  <select
                    id="item-type"
                    className="field-input select"
                    value={form.type ?? ""}
                    onChange={(e) => setField("type", e.target.value)}
                  >
                    <option value="">-- selecione --</option>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col">
                <label className="field-label" htmlFor="item-rarity">
                  Raridade
                </label>
                <div className="select-wrapper">
                  <select
                    id="item-rarity"
                    className="field-input select"
                    value={form.rarity ?? ""}
                    onChange={(e) => setField("rarity", e.target.value)}
                  >
                    <option value="">-- selecione --</option>
                    {RARITY_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <label className="field-label" htmlFor="item-description">
                Descrição
              </label>
              <textarea
                id="item-description"
                className="field-input textarea"
                value={form.description ?? ""}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="field-label" htmlFor="item-price">
                Preço
              </label>
              <input
                id="item-price"
                className="field-input input"
                type="number"
                step="1"
                min="0"
                value={form.price ?? 0}
                onChange={(e) => setField("price", Number(e.target.value))}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
