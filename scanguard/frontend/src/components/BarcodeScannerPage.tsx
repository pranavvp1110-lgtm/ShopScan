import React, { useState, useEffect, useRef } from 'react';
import { 
  CameraOff, 
  ArrowLeft, 
  ScanLine, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Keyboard, 
  ShoppingCart,
  Check
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Product } from '../types';
import { fetchProductByBarcode } from '../api';

interface BarcodeScannerPageProps {
  onBackToCart: () => void;
  onAddToCart: (product: Product, quantity?: number) => Promise<void>;
  sampleProducts: Product[];
}

export const BarcodeScannerPage: React.FC<BarcodeScannerPageProps> = ({
  onBackToCart,
  onAddToCart,
  sampleProducts
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scannedQty, setScannedQty] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [scanDebounceLock, setScanDebounceLock] = useState<boolean>(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'html5-scanner-element';

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 180 }, aspectRatio: 1.0 },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {}
      );
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(
        err.message?.includes('Permission')
          ? 'Camera permission denied. Use manual barcode entry below.'
          : 'Camera unavailable. Please enter the barcode manually.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && cameraActive) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn('Camera stop error:', e);
      }
      setCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleBarcodeDetected = async (code: string) => {
    if (scanDebounceLock) return;
    setScanDebounceLock(true);
    setIsSearching(true);
    setCameraError(null);

    try {
      const prod = await fetchProductByBarcode(code.trim());
      setScannedProduct(prod);
      setScannedQty(1);
    } catch (err: any) {
      setCameraError(err.message || `No product found for barcode: ${code}`);
      setScannedProduct(null);
    } finally {
      setIsSearching(false);
      setTimeout(() => setScanDebounceLock(false), 2000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    handleBarcodeDetected(manualBarcode.trim());
  };

  const handleConfirmAdd = async () => {
    if (!scannedProduct) return;
    setAddedSuccess(true);
    await onAddToCart(scannedProduct, scannedQty);
    setTimeout(() => {
      setAddedSuccess(false);
      setScannedProduct(null);
      setManualBarcode('');
    }, 1000);
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={() => {
            stopCamera();
            onBackToCart();
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <div className="text-right">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ScanLine className="w-4 h-4 text-blue-600" />
            <span>Barcode Scanner</span>
          </h2>
          <p className="text-[11px] text-slate-500">Scan product packaging</p>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-sm min-h-[260px] flex items-center justify-center">
        <div id={scannerContainerId} className="w-full h-full object-cover" />

        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-60 h-40 rounded-xl border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center">
              <div className="w-full h-0.5 bg-blue-400 animate-pulse" />
              <span className="absolute -bottom-6 text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded">
                ALIGN BARCODE HERE
              </span>
            </div>
          </div>
        )}

        {!cameraActive && (
          <div className="p-6 text-center z-10 max-w-xs text-white">
            <CameraOff className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold">Camera Inactive</h4>
            <p className="text-xs text-slate-300 mt-1">
              {cameraError || 'Allow camera permission or enter barcode manually below.'}
            </p>
            <button
              onClick={startCamera}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition"
            >
              Retry Camera
            </button>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {cameraError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Matched Product Card */}
      {scannedProduct && (
        <div className="clean-card border-2 border-blue-500 p-4 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Item Matched
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {scannedProduct.barcode}
            </span>
          </div>

          <div className="mt-3 flex items-center space-x-3">
            <img
              src={scannedProduct.image_url}
              alt={scannedProduct.name}
              className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {scannedProduct.name}
              </h3>
              <p className="text-xs text-slate-500">{scannedProduct.category}</p>
              <p className="text-base font-extrabold text-blue-600 mt-0.5">
                ${scannedProduct.price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-slate-100 px-2 py-1 rounded-lg">
              <span className="text-xs text-slate-600">Qty:</span>
              <button
                onClick={() => setScannedQty(Math.max(1, scannedQty - 1))}
                className="w-6 h-6 rounded bg-white font-bold text-xs shadow-sm"
              >
                -
              </button>
              <span className="text-xs font-bold px-1">{scannedQty}</span>
              <button
                onClick={() => setScannedQty(scannedQty + 1)}
                className="w-6 h-6 rounded bg-white font-bold text-xs shadow-sm"
              >
                +
              </button>
            </div>

            <button
              onClick={handleConfirmAdd}
              disabled={addedSuccess}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart (${(scannedProduct.price * scannedQty).toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Manual Barcode Entry Fallback */}
      <div className="clean-card p-4 space-y-2">
        <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5 text-blue-600" />
          <span>Manual Barcode Lookup</span>
        </h4>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Type barcode (e.g. 8901030383120)"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isSearching || !manualBarcode.trim()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
          >
            {isSearching ? 'Checking...' : 'Lookup'}
          </button>
        </form>
      </div>

      {/* Tap-to-Scan Quick Barcodes */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-600 block">
          Quick Demo Barcodes (Tap to scan):
        </span>
        <div className="grid grid-cols-2 gap-2">
          {sampleProducts.slice(0, 4).map((p) => (
            <button
              key={p.id}
              onClick={() => handleBarcodeDetected(p.barcode)}
              className="p-2.5 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 text-left transition flex items-center space-x-2.5 group"
            >
              <img
                src={p.image_url}
                alt={p.name}
                className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600">
                  {p.name}
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  ${p.price.toFixed(2)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
