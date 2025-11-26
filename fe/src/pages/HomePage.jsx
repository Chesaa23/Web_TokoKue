import { useEffect, useState } from "react";
import api from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        alert("Gagal memuat produk");
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
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

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Daftar Kue</h1>
      {products.length === 0 ? (
        <p className="text-sm text-gray-500">Belum ada produk.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
