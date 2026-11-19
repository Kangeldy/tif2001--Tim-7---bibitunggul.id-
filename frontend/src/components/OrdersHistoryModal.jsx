import { getOrders } from '../services/api'

const rupiah = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v) || 0)

export default function OrdersHistoryModal({ onClose }) {
  const orders = getOrders()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#e1e9dc] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#fbfdf9] border-b border-[#e8eee4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <div>
              <h2 className="text-base font-extrabold text-[#183d29]">Riwayat Pesanan Saya</h2>
              <p className="text-[11px] text-[#637d68]">Daftar bibit yang sedang diproses atau dipesan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f7f0] hover:bg-[#e4ebd9] text-[#58705b] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* List Pesanan */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <span className="text-4xl block mb-2">🌿</span>
              <p className="font-bold text-[#1d3b29]">Belum ada pesanan</p>
              <p className="text-xs text-gray-400 mt-1">Pilih bibit favoritmu di katalog dan lakukan pemesanan sekarang!</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="p-4 rounded-2xl border border-[#e2ebd9] bg-[#fdfefc] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#2e5934] bg-[#eff6ea] px-2.5 py-1 rounded-lg">
                    {order.id}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    order.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.paymentMethod === 'cod' ? 'COD (Bayar di Tempat)' : 'Transfer Bank'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div>
                    <h4 className="font-bold text-[#1d3b29] text-sm">{order.product?.name}</h4>
                    <p className="text-xs text-[#637766]">
                      {order.quantity} polybag · Penerima: {order.customer?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Total</span>
                    <span className="font-black text-sm text-[#265d2c]">{rupiah(order.grandTotal)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#637766] pt-2 border-t border-[#f0f5ec]">
                  📍 {order.customer?.address}, {order.customer?.city}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-[#fbfdf9] border-t border-[#e8eee4] text-right">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-[#315f38] hover:bg-[#23482a] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
