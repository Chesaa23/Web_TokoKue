import { useEffect, useState } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const res = await api.get("/carts", {
        params: { user_id: user.id },
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat keranjang");
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty <= 0) return;
    try {
      await api.put(`/carts/${itemId}`, {
        user_id: user.id,
        quantity: newQty,
      });
      loadCart();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal mengubah jumlah");
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/carts/${itemId}`, {
        params: { user_id: user.id },
      });
      loadCart();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus item");
    }
  };

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Keranjang Belanja</h1>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">
          Keranjang kosong.{" "}
          <Link to="/" className="text-pink-500">
            Belanja dulu
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded shadow p-3 flex items-center gap-3"
              >
                {item.image_url && (
                  <img
                    src={`http://localhost:5000${item.image_url}`}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    Harga: Rp {Number(item.price).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Stok: {item.stock <= 0 ? "Stok Habis" : item.stock}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateQty(item.id, item.quantity - 1)
                      }
                      className="px-2 py-1 text-xs bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleUpdateQty(item.id, item.quantity + 1)
                      }
                      className="px-2 py-1 text-xs bg-gray-200 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="ml-4 text-xs text-red-500"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="text-sm font-bold text-pink-600">
                  Rp{" "}
                  {Number(item.price * item.quantity).toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded shadow p-4 flex items-center justify-between">
            <p className="text-sm">
              Total:{" "}
              <span className="font-bold text-pink-600">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </p>
            <button
              onClick={() => navigate("/checkout")}
              className="px-4 py-2 text-sm rounded bg-pink-500 text-white hover:bg-pink-600"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
