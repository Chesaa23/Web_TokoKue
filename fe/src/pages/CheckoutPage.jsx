import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await api.post("/orders/checkout", {
        user_id: user.id,
      });
      alert("Checkout berhasil! ID order: " + res.data.order_id);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Checkout gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-sm">
      <h1 className="text-lg font-bold mb-3">Konfirmasi Checkout</h1>
      <p className="mb-4">
        Setelah melakukan checkout, stok produk akan berkurang dan keranjang
        akan dikosongkan.
      </p>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-2 rounded text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-pink-500 hover:bg-pink-600"
        }`}
      >
        {loading ? "Memproses..." : "Checkout Sekarang"}
      </button>
    </div>
  );
}
