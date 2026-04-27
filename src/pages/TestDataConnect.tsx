import { useEffect, useState } from 'react';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import {
  connectorConfig,
  listCategories,
  listFoods,
  listShops,
  createCategory,
  createShop,
  createFoodItem,
} from '@dataconnect/generated';
import type {
  ListCategoriesData,
  ListFoodsData,
  ListShopsData,
} from '@dataconnect/generated';
import firebaseApp from '../modules/auth/services/firebase';

/**
 * Trang Test Firebase Data Connect - Schema mới
 * Route: /test
 *
 * Test 3 bảng: Category, Shop, FoodItem
 * Có nút seed data mẫu để kiểm tra quan hệ giữa các bảng
 */

// Khởi tạo DataConnect instance 1 lần duy nhất
const dc = getDataConnect(firebaseApp, connectorConfig);
connectDataConnectEmulator(dc, '127.0.0.1', 9399);

export function TestDataConnect() {
  const [categories, setCategories] = useState<ListCategoriesData['categories']>([]);
  const [foods, setFoods] = useState<ListFoodsData['foodItems']>([]);
  const [shops, setShops] = useState<ListShopsData['shops']>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnected(true);

      const [catResult, foodResult, shopResult] = await Promise.all([
        listCategories(dc),
        listFoods(dc, { limit: 10 }),
        listShops(dc, { limit: 10 }),
      ]);

      setCategories(catResult.data.categories);
      setFoods(foodResult.data.foodItems);
      setShops(shopResult.data.shops);
    } catch (err) {
      console.error('Lỗi kết nối Data Connect:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Seed data mẫu: 1 Category + 1 Shop + 1 FoodItem
  const handleSeedData = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      // 1. Tạo Category
      const catResult = await createCategory(dc, {
        name: 'Phở',
        slug: 'pho',
      });
      const categoryId = catResult.data.category_insert.id;

      // 2. Tạo Shop
      const shopResult = await createShop(dc, {
        externalId: '182271',
        name: 'Phú Gia - Phở - Phan Văn Hớn',
        address: '285/39 Phan Văn Hớn, P. Tân Thới Nhất, Quận 12, TP. HCM',
        city: 'ho-chi-minh',
        rating: 4.8,
        coverImage: 'https://down-zl-vn.img.susercontent.com/vn-11134513-7r98o-lsve6aq72jyx92',
        url: 'https://shopeefood.vn/ho-chi-minh/phu-gia-pho-phan-van-hon.srepav',
        openTime: '05:00',
        closeTime: '12:00',
        priceMin: 15000,
        priceMax: 100000,
        priceDisplay: '15.000đ - 100.000đ',
      });
      const shopId = shopResult.data.shop_insert.id;

      // 3. Tạo FoodItem (liên kết với Shop + Category)
      await createFoodItem(dc, {
        name: 'Phở Tái Nạm',
        description: 'Phở tái nạm truyền thống',
        price: 70000,
        priceDisplay: '70.000đ',
        imageUrl: 'https://down-zl-vn.img.susercontent.com/vn-11134517-7r98o-lr3ns0p3wg49ef',
        thumbnailUrl: 'https://mms.img.susercontent.com/vn-11134517-7r98o-lr3ns0p3wg49ef@resize_ss120x120!@crop_w120_h120_cT',
        groupName: 'Phở (Mì/Miến) 2 món',
        isPopular: true,
        totalLike: 5,
        shopId: shopId,
        categoryId: categoryId,
      });

      setSeedResult('✅ Đã tạo thành công: 1 Category + 1 Shop + 1 FoodItem');
      // Reload data
      await fetchAll();
    } catch (err) {
      console.error('Lỗi seed data:', err);
      setSeedResult(`❌ Lỗi: ${err instanceof Error ? err.message : 'Không rõ'}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        🧪 Test Firebase Data Connect - Schema Mới
      </h1>
      <p style={{ color: '#888', marginBottom: 24 }}>
        Test 3 bảng: Category, Shop, FoodItem + quan hệ FK
      </p>

      {/* Trạng thái kết nối */}
      <div style={{
        padding: '12px 16px', borderRadius: 8, marginBottom: 20,
        background: connected ? '#0d3320' : error ? '#3d1519' : '#2a2a2a',
        border: `1px solid ${connected ? '#1a6b3c' : error ? '#6b1a1a' : '#444'}`,
      }}>
        <span style={{ marginRight: 8 }}>{connected ? '🟢' : error ? '🔴' : '🟡'}</span>
        <span style={{ fontSize: 14 }}>
          {loading ? 'Đang kết nối...' : connected ? 'Đã kết nối Emulator (127.0.0.1:9399)' : `Lỗi: ${error}`}
        </span>
      </div>

      {/* Nút Seed Data */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={handleSeedData}
          disabled={seeding || loading}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: seeding ? '#555' : '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600,
          }}
        >
          {seeding ? '⏳ Đang tạo...' : '🌱 Seed Data Mẫu (1 Category + 1 Shop + 1 Food)'}
        </button>
        {seedResult && (
          <p style={{ marginTop: 8, fontSize: 13, color: seedResult.startsWith('✅') ? '#4ade80' : '#f87171' }}>
            {seedResult}
          </p>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>⏳ Đang tải...</div>
      ) : error ? (
        <div style={{ padding: 20, background: '#3d1519', borderRadius: 8, border: '1px solid #6b1a1a' }}>
          <h3 style={{ color: '#ff6b6b' }}>❌ {error}</h3>
          <p style={{ color: '#999', fontSize: 13 }}>Hãy chắc chắn Emulator đang chạy</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>

          {/* === Categories === */}
          <section>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>🏷️ Categories ({categories.length})</h2>
            {categories.length === 0 ? (
              <p style={{ color: '#666', fontSize: 13 }}>Chưa có category. Bấm "Seed Data" ở trên.</p>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <span key={cat.id} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                    background: '#1e293b', border: '1px solid #334155', color: '#94a3b8',
                  }}>
                    {cat.name} <span style={{ color: '#475569' }}>/{cat.slug}</span>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* === Shops === */}
          <section>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>🏪 Shops ({shops.length})</h2>
            {shops.length === 0 ? (
              <p style={{ color: '#666', fontSize: 13 }}>Chưa có shop.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {shops.map(shop => (
                  <div key={shop.id} style={{
                    padding: 14, background: '#1e1e2e', borderRadius: 8, border: '1px solid #333',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <strong>{shop.name}</strong>
                      <p style={{ color: '#888', fontSize: 12, margin: '4px 0 0' }}>{shop.address}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#fbbf24' }}>⭐ {shop.rating ?? 'N/A'}</span>
                      <p style={{ color: '#666', fontSize: 11, margin: '2px 0 0' }}>
                        {shop.openTime} - {shop.closeTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* === Foods === */}
          <section>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>🍜 Foods ({foods.length})</h2>
            {foods.length === 0 ? (
              <p style={{ color: '#666', fontSize: 13 }}>Chưa có món ăn.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {foods.map(food => (
                  <div key={food.id} style={{
                    padding: 14, background: '#1e1e2e', borderRadius: 8, border: '1px solid #333',
                    display: 'flex', gap: 12, alignItems: 'center',
                  }}>
                    {food.thumbnailUrl && (
                      <img src={food.thumbnailUrl} alt={food.name}
                        style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <strong>{food.name}</strong>
                      <p style={{ color: '#888', fontSize: 12, margin: '2px 0' }}>
                        🏪 {food.shop.name} • ⭐ {food.shop.rating ?? 'N/A'}
                      </p>
                      <p style={{ color: '#666', fontSize: 11, margin: 0 }}>
                        🏷️ {food.category.name} • ❤️ {food.totalLike} likes
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#4ade80', fontWeight: 600 }}>{food.priceDisplay}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      {/* Debug info */}
      <details style={{ marginTop: 30 }}>
        <summary style={{ cursor: 'pointer', color: '#888', fontSize: 13 }}>🔧 Debug Info</summary>
        <pre style={{ background: '#111', padding: 12, borderRadius: 6, fontSize: 11, overflow: 'auto', marginTop: 8 }}>
          {JSON.stringify({ categories: categories.length, shops: shops.length, foods: foods.length,
            rawCategories: categories, rawShops: shops, rawFoods: foods }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
