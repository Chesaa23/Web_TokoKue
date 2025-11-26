import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        alert("Produk tidak ditemukan");
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert("Silakan login sebagai user untuk belanja");
      return;
    }
    if (user.role !== "user") {
      alert("Akun admin tidak bisa belanja");
      return;
    }

    try {
      await api.post("/carts", {
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      });
      alert("Berhasil ditambahkan ke keranjang");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menambah ke keranjang");
    }
  };

  if (!product) return <p className="text-sm">Memuat...</p>;

  const outOfStock = product.stock <= 0;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      {product.image_url && (
        <img
          src={`http://localhost:5000${product.image_url}`}
          alt={product.name}
          className="w-full h-60 object-cover rounded mb-4"
        />
      )}
      <h1 className="text-xl font-bold mb-2">{product.name}</h1>
      <p className="text-sm text-gray-600 mb-3">{product.description}</p>
      <p className="text-lg font-bold text-pink-600 mb-1">
        Rp {Number(product.price).toLocaleString("id-ID")}
      </p>
      <p className="text-sm mb-4">
        Stok:{" "}
        <span className={outOfStock ? "text-red-500 font-semibold" : ""}>
          {outOfStock ? "Stok Habis" : product.stock}
        </span>
      </p>
      <button
        onClick={handleAddToCart}
        disabled={outOfStock}
        className={`w-full py-2 text-sm rounded text-white ${
          outOfStock
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-pink-500 hover:bg-pink-600"
        }`}
      >
        {outOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
      </button>
    </div>
  );
}
