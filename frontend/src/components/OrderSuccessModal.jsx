const rupiah = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v) || 0)

export default function OrderSuccessModal({ order, onClose }) {
  if (!order) return null

  const isCod = order.paymentMethod === 'cod'

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo BibitUnggul! Saya ingin konfirmasi pesanan:\n` +
      `No. Pesanan: ${order.id}\n` +
      `Nama: ${order.customer?.name}\n` +
      `Produk: ${order.product?.name} (${order.quantity} polybag)\n` +
      `Metode: ${isCod ? 'COD (Bayar di Tempat)' : 'Transfer Bank ' + (order.bankDetails?.bank || '')}\n` +
      `Total: ${rupiah(order.grandTotal)}\n` +
      `Alamat: ${order.customer?.address}, ${order.customer?.city}\n\n` +
      `Mohon segera diproses ya. Terima kasih! 🌱`
    )
    window.open(`https://wa.me/6285171189558?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#d6e5cd] overflow-hidden my-auto max-h-[95vh] flex flex-col print:shadow-none print:border-none print:max-w-none">
        {/* Header Bukti Transaksi */}
        <div className="bg-[#183d29] text-white p-6 text-center relative">
          <div className="w-14 h-14 bg-[#79a94b] text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
            ✓
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Pesanan Berhasil Dibuat!</h2>
          <p className="text-xs text-[#a9c9b1] mt-1">Terima kasih telah berbelanja di BibitUnggul</p>

          <div className="mt-4 inline-flex items-center gap-2 bg-[#224b33] px-3.5 py-1.5 rounded-full border border-[#316345] text-xs font-mono">
            <span>No. Order:</span>
            <span className="font-bold text-[#b4e6a0]">{order.id}</span>
          </div>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#2c4e33] flex-1">
          {/* Status Instruksi Pembayaran */}
          <div className={`p-4 rounded-2xl border ${isCod ? 'bg-[#f0f8ec] border-[#cbe3c3]' : 'bg-[#fdf9eb] border-[#fae8b2]'}`}>
            <div className="flex items-start gap-2.5">
              <span className="text-xl">{isCod ? '📦' : '💳'}</span>
              <div>
                <span className="font-extrabold text-[#1d3b29] text-sm block">
                  {isCod ? 'Sistem COD (Bayar di Tempat)' : `Transfer Bank ${order.bankDetails?.bank || ''}`}
                </span>
                <p className="text-[11px] text-[#556d58] mt-1 leading-relaxed">
                  {isCod
                    ? 'Pesanan Anda sedang dipersiapkan di kebun. Harap siapkan uang tunai pas saat kurir tiba di alamat Anda.'
                    : `Silakan transfer ke nomor rekening ${order.bankDetails?.bank}: ${order.bankDetails?.no} a.n ${order.bankDetails?.name}. Pesanan akan diproses setelah transfer diverifikasi.`}
                </p>
              </div>
            </div>
          </div>

          {/* Rincian Produk */}
          <div className="border border-[#e4eedb] rounded-2xl p-4 bg-[#fcfdfa]">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Item Pembelian</span>
            <div className="flex justify-between items-center py-1">
              <div>
                <div className="font-bold text-[#1d3b29]">{order.product?.name}</div>
                <div className="text-[11px] text-gray-500">
                  {order.quantity} polybag × {rupiah(order.product?.price)}
                </div>
              </div>
              <span className="font-extrabold text-[#1d3b29]">{rupiah(order.itemsSubtotal)}</span>
            </div>

            <div className="border-t border-[#edf4e6] mt-2 pt-2 space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Ongkir:</span>
                <span>{order.shippingFee === 0 ? <span className="text-emerald-600 font-bold">GRATIS</span> : rupiah(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#1d3b29] pt-1 border-t border-[#edf4e6]">
                <span>Total Pembayaran:</span>
                <span className="text-[#2a6833] text-base">{rupiah(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Alamat Pengiriman */}
          <div className="border border-[#e4eedb] rounded-2xl p-4 bg-[#fcfdfa]">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Alamat Pengiriman</span>
            <div className="font-bold text-[#1d3b29]">{order.customer?.name} ({order.customer?.phone})</div>
            <div className="text-[11px] text-[#556d58] mt-1">{order.customer?.address}</div>
            <div className="text-[11px] text-[#556d58]">{order.customer?.city}</div>
            {order.customer?.notes && (
              <div className="mt-1 text-[10px] text-gray-400 italic">Catatan: "{order.customer.notes}"</div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#fbfdf9] border-t border-[#e8eee4] flex flex-col sm:flex-row gap-2 print:hidden">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>📱</span> Konfirmasi via WhatsApp
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-4 bg-[#eff5e9] hover:bg-[#dfeccd] text-[#315f38] font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            🖨️ Cetak Bukti
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}
