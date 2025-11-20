import React, { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import ItemsTable from "../components/ItemsTable";
import UsersTable from "../components/UsersTable";
import EditItemModal from "../components/EditItemModal";
import type { Item, User } from "../interface/types";
import "../css/dashboard.css";
import api from "../services/api";
import { useAuth } from "../utils/auth";

const AdminDashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [resolvingIds, setResolvingIds] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<"items" | "users">("items");
  const [editing, setEditing] = useState<Item | null>(null);

  const { logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const processIncomingNotifications = (notifs: any[] = []) => {
    notifs.forEach((n: any) => {
      try {
        const rawType = (n.type ?? n.event ?? "").toString().toLowerCase();
        const isItemDelete =
          rawType.includes("item") &&
          (rawType.includes("delete") ||
            rawType.includes("deleted") ||
            rawType.includes("remove") ||
            rawType.includes("removed"));
        if (isItemDelete) {
          const payload = n.item ?? n.payload ?? n.data ?? null;
          const itemId =
            n.item_id ?? n.itemId ?? payload?.id ?? n.id ?? n._id ?? null;
          if (itemId != null) {
            setItems((s) => s.filter((x) => String(x.id) !== String(itemId)));
          }
        }
      } catch (e) {
        // ignore per-item errors
      }
    });
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [itemsResp, usersResp, notifsResp] = await Promise.all([
          api.get<Item[]>("/item").catch(() => ({ data: [] })),
          api.get<User[]>("/users").catch(() => ({ data: [] })),
          api.get<any[]>("/admin/notifications").catch(() => ({ data: [] })),
        ]);
        const itemsData = itemsResp?.data as any;
        const resolvedItems: Item[] = Array.isArray(itemsData)
          ? itemsData
          : (itemsData?.items as Item[]) ?? [];
        setItems(resolvedItems);
        setUsers(usersResp.data ?? []);

        const incoming = (notifsResp.data ?? []) as any[];
        processIncomingNotifications(incoming);

        // use server list directly (no local filtering)
        setNotifications(incoming);
      } catch (e) {
        console.error("fetchAll error", e);
      }
    };

    fetchAll();

    const id = setInterval(() => {
      api
        .get("/admin/notifications")
        .then((r: any) => {
          const incoming = r.data ?? [];
          processIncomingNotifications(incoming);
          setNotifications(incoming);
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, [logout]);

  const handleEdit = (it: Item) => setEditing(it);
  const handleDeleteItem = async (id: number) => {
    try {
      await api.delete(`/item/${id}`);
      setItems((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      console.error("delete item error", err);
      alert("Não foi possível excluir este item. Verifique permissões.");
    }
  };

  const [userDeleteModal, setUserDeleteModal] = useState<{
    userId: number | null;
    items: Item[];
    loading: boolean;
  }>({ userId: null, items: [], loading: false });

  const handleDeleteUser = async (id: number) => {
    try {
      const { data: userItems } = await api.get<Item[]>(`/users/${id}/item`);
      if (userItems && userItems.length > 0) {
        setUserDeleteModal({ userId: id, items: userItems, loading: false });
        return;
      }
      if (!confirm("Deseja realmente excluir este usuário?")) return;
      await api.delete(`/users/${id}`);
      setUsers((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      console.error("delete user error", err);
      alert(
        "Erro ao excluir usuário ou obter itens. Verifique servidor/permissões."
      );
    }
  };

  const handleSave = async (it: Item) => {
    try {
      const payload: any = {
        name: it.name,
        type: it.type,
        rarity: it.rarity,
        description: it.description,
        price: it.price,
      };

      if (typeof it.image_url === "string" && it.image_url.trim() !== "") {
        payload.image_url = it.image_url;
      }

      const { data } = await api.put(`/item/${it.id}`, payload);
      setItems((s) => s.map((x) => (x.id === it.id ? { ...x, ...data } : x)));
      setEditing(null);
    } catch (err: any) {
      if (err?.response?.data) {
        const msg =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data);
        alert("Erro ao atualizar: " + msg);
      } else {
        alert("Não foi possível salvar as alterações. Verifique permissões.");
      }
    }
  };
  const resolveNotification = async (notifOrId: any, fallbackIdx?: number) => {
    const id =
      typeof notifOrId === "object"
        ? notifOrId?.id ?? notifOrId?._id ?? fallbackIdx ?? null
        : notifOrId;
    if (id === null || id === undefined) {
      console.error(
        "Could not determine notification id to resolve",
        notifOrId
      );
      // remove from UI locally (cannot resolve on server without id)
      setNotifications((s) =>
        s.filter((n: any, idx: number) => n !== notifOrId)
      );
      alert(
        "Notificação removida localmente. Não foi possível resolver no servidor (sem id)."
      );
      return;
    }

    const key = String(id);
    setResolvingIds((s) => ({ ...s, [key]: true }));

    // optimistic remove from UI
    setNotifications((s) =>
      s.filter((n: any, idx: number) => {
        const nid = n?.id ?? n?._id ?? idx;
        return String(nid) !== String(id);
      })
    );

    try {
      // use server route DELETE /admin/notifications/:id
      await api.delete(`/admin/notifications/${id}`);
    } catch (err: any) {
      console.warn("Could not resolve notification on server:", err);
      // refetch from server to restore consistent state
      try {
        const res = await api.get("/admin/notifications");
        setNotifications(res.data ?? []);
      } catch (_e) {}
      alert("Não foi possível concluir a notificação no servidor.");
    } finally {
      setResolvingIds((s) => {
        const copy = { ...s };
        delete copy[key];
        return copy;
      });
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;
    if (!confirm("Deseja realmente limpar todas as notificações?")) return;
    setClearingAll(true);

    // optimistic clear UI
    setNotifications([]);

    try {
      // use server route DELETE /admin/notifications
      await api.delete("/admin/notifications");
    } catch (err) {
      console.warn("Não foi possível limpar notificações no servidor:", err);
      // try to refetch to restore state
      try {
        const res = await api.get("/admin/notifications");
        setNotifications(res.data ?? []);
      } catch (_e) {}
      alert("Não foi possível limpar as notificações no servidor.");
    } finally {
      setClearingAll(false);
    }
  };

  const formatNotification = (n: any) => {
    if (!n)
      return { id: null, title: "Notificação", body: "Conteúdo indisponível" };

    const id = n?.id ?? n?._id ?? null;

    if (typeof n === "string") return { id, title: n, body: "" };
    if (n.message || n.msg) return { id, title: n.message ?? n.msg, body: "" };

    const rawType = (n.type ?? n.event ?? "").toString();
    const type = rawType.toLowerCase();

    const payload = n.item ?? n.payload ?? n.data ?? null;
    const itemName =
      n.item_name ??
      payload?.name ??
      payload?.title ??
      payload?.item_name ??
      n.name ??
      "Item";
    const creatorRaw =
      n.creator_name ??
      payload?.creator?.name ??
      payload?.user?.name ??
      n.userName ??
      null;
    const creatorId =
      n.creator_user_id ??
      payload?.creator_user_id ??
      payload?.creator?.id ??
      payload?.user?.id ??
      null;
    const creator =
      creatorRaw ?? (creatorId ? `usuário #${creatorId}` : "um usuário");
    const ts = n.timestamp ?? payload?.timestamp ?? null;
    const when = ts ? ` em ${new Date(Number(ts)).toLocaleString()}` : "";

    if (
      type.includes("item") &&
      (type.includes("created") || type.includes("create"))
    ) {
      return {
        id,
        title: `O Item: ${itemName}, do autor: ${creator}, foi criado${when}`,
        body: "",
      };
    }

    if (
      type.includes("item") &&
      (type.includes("delete") ||
        type.includes("deleted") ||
        type.includes("remove") ||
        type.includes("removed"))
    ) {
      return {
        id,
        title: `O Item: ${itemName}, do autor: ${creator}, foi removido${when}`,
        body: "",
      };
    }

    try {
      const pretty = JSON.stringify(n, Object.keys(n).slice(0, 6), 2);
      return { id, title: "Notificação", body: pretty };
    } catch (_e) {
      return { id, title: "Notificação", body: String(n) };
    }
  };

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <h1>Painel de admin (Arquirrimorio)</h1>
        <div className="header-actions">
          <button
            className="notification-bell"
            onClick={() => setShowNotifs((s) => !s)}
            aria-label="Notificações"
          >
            {/*Sininho*/}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"
                fill="currentColor"
              />
              <path
                d="M18 16v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                fill="currentColor"
              />
            </svg>
            {notifications.length > 0 && (
              <div className="notification-badge">{notifications.length}</div>
            )}
          </button>

          <button
            className="btn-logout"
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="stats-row">
        <StatsCard
          title="Total de Usuários"
          value={users.length}
          icon={
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z"
                fill="currentColor"
              />
              <path
                d="M2 20c0-3.3 4.7-5 10-5s10 1.7 10 5v1H2v-1z"
                fill="currentColor"
              />
            </svg>
          }
        />
        <StatsCard
          title="Itens Cadastrados"
          value={items.length}
          icon={
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 3h18v6H3z" fill="currentColor" />
              <path
                d="M21 11v9H3v-9h18zm-9 7a2 2 0 100-4 2 2 0 000 4z"
                fill="currentColor"
              />
            </svg>
          }
        />
      </section>

      <section className="main-area">
        <div className="management">
          <div className="tabs">
            <button
              className={`tab ${tab === "items" ? "active" : ""}`}
              onClick={() => setTab("items")}
            >
              Itens
            </button>
            <button
              className={`tab ${tab === "users" ? "active" : ""}`}
              onClick={() => setTab("users")}
            >
              Usuários
            </button>
          </div>

          <h2>Gerenciar {tab === "items" ? "Itens" : "Usuários"}</h2>

          {tab === "items" ? (
            <ItemsTable
              items={items}
              onEdit={handleEdit}
              onDelete={handleDeleteItem}
            />
          ) : (
            <UsersTable users={users} onDelete={handleDeleteUser} />
          )}
        </div>
      </section>

      {showNotifs && (
        <div
          className="modal-backdrop notifications-modal"
          onClick={() => setShowNotifs(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Notificações</h3>
              <div>
                <button
                  className="btn-outline"
                  onClick={clearAllNotifications}
                  disabled={clearingAll || notifications.length === 0}
                  title="Limpar todas as notificações"
                >
                  {clearingAll ? "..." : "Limpar todas"}
                </button>
                <button
                  className="btn-outline"
                  onClick={() => setShowNotifs(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
            <div className="modal-body">
              {notifications.length === 0 && <div>Nenhuma notificação</div>}
              {notifications.map((n: any, idx) => {
                const formatted = formatNotification(n);
                const key = formatted.id ?? n?.id ?? n?._id ?? idx;
                const isResolving = resolvingIds[String(key)];
                return (
                  <div className="notif-item" key={key}>
                    <div className="notif-msg">
                      <div className="notif-title">{formatted.title}</div>
                      {formatted.body && (
                        <div className="notif-body">{formatted.body}</div>
                      )}
                    </div>
                    <div>
                      <button
                        className="notif-resolve"
                        onClick={() => resolveNotification(n, idx)}
                        disabled={!!isResolving}
                      >
                        {isResolving ? "..." : "V"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {editing && (
        <EditItemModal
          item={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {userDeleteModal.userId !== null && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setUserDeleteModal({ userId: null, items: [], loading: false })
          }
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Excluir usuário e itens</h3>
              <button
                className="close"
                onClick={() =>
                  setUserDeleteModal({
                    userId: null,
                    items: [],
                    loading: false,
                  })
                }
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Este usuário possui os itens abaixo. Se você continuar, todos os
                itens serão excluídos e, em seguida, o usuário será removido.
                Tem certeza?
              </p>
              <ul>
                {userDeleteModal.items.map((it) => (
                  <li key={it.id}>
                    #{it.id} - {it.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button
                className="btn-outline"
                onClick={() =>
                  setUserDeleteModal({
                    userId: null,
                    items: [],
                    loading: false,
                  })
                }
                disabled={userDeleteModal.loading}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={async () => {
                  if (!userDeleteModal.userId) return;
                  try {
                    setUserDeleteModal((s) => ({ ...s, loading: true }));
                    await Promise.allSettled(
                      userDeleteModal.items.map((it) =>
                        api.delete(`/item/${it.id}`)
                      )
                    );
                    await api.delete(`/users/${userDeleteModal.userId}`);
                    setUsers((s) =>
                      s.filter((x) => x.id !== userDeleteModal.userId)
                    );
                    setItems((s) =>
                      s.filter((x) => x.user_id !== userDeleteModal.userId)
                    );
                  } catch (err) {
                    console.error("confirm delete user error", err);
                    alert(
                      "Não foi possível excluir o usuário/itens. Verifique permissões."
                    );
                  } finally {
                    setUserDeleteModal({
                      userId: null,
                      items: [],
                      loading: false,
                    });
                  }
                }}
                disabled={userDeleteModal.loading}
              >
                {userDeleteModal.loading ? "Excluindo..." : "Sim, excluir tudo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
