import { ChangeEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';

type DocType = 'DNI' | 'NIE' | 'Pasaporte' | 'Otro';
type Preset = 'Alquiler' | 'Hotel' | 'RRHH' | 'Compra/Venta' | 'Verificación cuenta' | 'Otros';
type RedactionType = 'Negro' | 'Blur';

type Redaction = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: RedactionType;
};

const presets: Preset[] = ['Alquiler', 'Hotel', 'RRHH', 'Compra/Venta', 'Verificación cuenta', 'Otros'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [docType, setDocType] = useState<DocType>('DNI');
  const [preset, setPreset] = useState<Preset>('Alquiler');
  const [motivo, setMotivo] = useState('Alquiler');
  const [fecha, setFecha] = useState(todayIso());
  const [watermarkRepeated, setWatermarkRepeated] = useState(true);
  const [watermarkDiagonal, setWatermarkDiagonal] = useState(true);
  const [opacity, setOpacity] = useState(0.22);
  const [fontSize, setFontSize] = useState(28);
  const [redactionType, setRedactionType] = useState<RedactionType>('Negro');
  const [redactions, setRedactions] = useState<Redaction[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [draftRect, setDraftRect] = useState<Redaction | null>(null);
  const [shareMessage, setShareMessage] = useState('');

  const watermarkText = useMemo(() => {
    const cleanMotivo = motivo.trim() || preset;
    return `SOLO ${cleanMotivo.toUpperCase()} ${fecha}`;
  }, [fecha, motivo, preset]);

  useEffect(() => {
    drawCanvas();
  }, [imageEl, redactions, draftRect, watermarkText, watermarkRepeated, watermarkDiagonal, opacity, fontSize]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!imageEl) {
      canvas.width = 800;
      canvas.height = 500;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Carga una imagen para empezar', canvas.width / 2, canvas.height / 2);
      return;
    }

    const maxWidth = 1400;
    const ratio = imageEl.naturalWidth / imageEl.naturalHeight;
    canvas.width = Math.min(imageEl.naturalWidth, maxWidth);
    canvas.height = Math.round(canvas.width / ratio);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageEl, 0, 0, canvas.width, canvas.height);

    const allRects = draftRect ? [...redactions, draftRect] : redactions;

    allRects
      .filter((rect) => rect.type === 'Blur')
      .forEach((rect) => {
        const temp = document.createElement('canvas');
        temp.width = rect.width;
        temp.height = rect.height;
        const tctx = temp.getContext('2d');
        if (!tctx) return;
        tctx.filter = 'blur(8px)';
        tctx.drawImage(
          canvas,
          rect.x,
          rect.y,
          rect.width,
          rect.height,
          0,
          0,
          rect.width,
          rect.height
        );
        ctx.drawImage(temp, rect.x, rect.y);
      });

    allRects
      .filter((rect) => rect.type === 'Negro')
      .forEach((rect) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      });

    ctx.save();
    ctx.fillStyle = `rgba(220, 38, 38, ${opacity})`;
    ctx.strokeStyle = `rgba(220, 38, 38, ${opacity})`;
    ctx.font = `${fontSize}px system-ui`;
    ctx.textAlign = 'center';

    if (watermarkRepeated) {
      const spacing = fontSize * 5;
      for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
        for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((-20 * Math.PI) / 180);
          ctx.fillText(watermarkText, 0, 0);
          ctx.restore();
        }
      }
    }

    if (watermarkDiagonal) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((-30 * Math.PI) / 180);
      ctx.font = `${Math.max(fontSize * 1.8, 42)}px system-ui`;
      ctx.fillText(watermarkText, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  };

  const loadImage = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImageEl(img);
        setRedactions([]);
        setDraftRect(null);
        setShareMessage('');
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onLoadFile = (event: ChangeEvent<HTMLInputElement>) => {
    loadImage(event.target.files?.[0]);
    event.target.value = '';
  };

  const getCanvasPoint = (ev: PointerEvent<HTMLCanvasElement>) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const x = ((ev.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((ev.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const onPointerDown = (ev: PointerEvent<HTMLCanvasElement>) => {
    if (!imageEl) return;
    const point = getCanvasPoint(ev);
    if (!point) return;
    setIsDrawing(true);
    setDraftRect({
      id: crypto.randomUUID(),
      x: point.x,
      y: point.y,
      width: 1,
      height: 1,
      type: redactionType
    });
  };

  const onPointerMove = (ev: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !draftRect) return;
    const point = getCanvasPoint(ev);
    const canvas = canvasRef.current;
    if (!point || !canvas) return;

    const endX = clamp(point.x, 0, canvas.width);
    const endY = clamp(point.y, 0, canvas.height);
    const startX = draftRect.x;
    const startY = draftRect.y;
    setDraftRect({
      ...draftRect,
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY)
    });
  };

  const onPointerUp = () => {
    if (!draftRect || draftRect.width < 6 || draftRect.height < 6) {
      setDraftRect(null);
      setIsDrawing(false);
      return;
    }
    setRedactions((prev) => [...prev, draftRect]);
    setDraftRect(null);
    setIsDrawing(false);
  };

  const exportBlob = (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return Promise.resolve(null);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob));
    });
  };

  const handleDownload = async () => {
    const blob = await exportBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dni-blindado-${Date.now()}.imagen`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const blob = await exportBlob();
    if (!blob) return;

    const file = new File([blob], `dni-blindado-${Date.now()}.imagen`);
    const canShare = navigator.canShare?.({ files: [file] });

    if (!navigator.share || !canShare) {
      setShareMessage('Tu navegador no soporta compartir archivos. Usa "Descargar imagen".');
      return;
    }

    try {
      await navigator.share({
        files: [file],
        title: 'Documento blindado',
        text: watermarkText
      });
      setShareMessage('Imagen compartida correctamente.');
    } catch {
      setShareMessage('No se pudo compartir. Puedes descargar la imagen.');
    }
  };

  const resetAll = () => {
    setImageEl(null);
    setDocType('DNI');
    setPreset('Alquiler');
    setMotivo('Alquiler');
    setFecha(todayIso());
    setWatermarkRepeated(true);
    setWatermarkDiagonal(true);
    setOpacity(0.22);
    setFontSize(28);
    setRedactionType('Negro');
    setRedactions([]);
    setDraftRect(null);
    setShareMessage('');
  };

  return (
    <main className="app">
      <h1>DNI Blindado</h1>
      <p className="subtitle">Blindaje local para DNI/NIE/Pasaporte antes de compartir.</p>

      <section className="panel controls">
        <div className="button-row">
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            Cargar foto
          </button>
          <button type="button" onClick={() => cameraInputRef.current?.click()}>
            Usar cámara
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onLoadFile} hidden />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onLoadFile}
            hidden
          />
        </div>

        <label>
          Tipo de documento
          <select value={docType} onChange={(e) => setDocType(e.target.value as DocType)}>
            <option>DNI</option>
            <option>NIE</option>
            <option>Pasaporte</option>
            <option>Otro</option>
          </select>
        </label>

        <label>
          Motivo (preset)
          <select
            value={preset}
            onChange={(e) => {
              const value = e.target.value as Preset;
              setPreset(value);
              setMotivo(value);
            }}
          >
            {presets.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label>
          Válido solo para...
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Alquiler" />
        </label>

        <label>
          Fecha
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>

        <fieldset>
          <legend>Marca de agua</legend>
          <label className="inline">
            <input
              type="checkbox"
              checked={watermarkRepeated}
              onChange={(e) => setWatermarkRepeated(e.target.checked)}
            />
            Marca de agua repetida
          </label>
          <label className="inline">
            <input
              type="checkbox"
              checked={watermarkDiagonal}
              onChange={(e) => setWatermarkDiagonal(e.target.checked)}
            />
            Marca diagonal grande
          </label>
          <label>
            Intensidad ({opacity.toFixed(2)})
            <input
              type="range"
              min="0.08"
              max="0.6"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </label>
          <label>
            Tamaño texto ({fontSize}px)
            <input
              type="range"
              min="14"
              max="72"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Redacciones</legend>
          <label>
            Tipo de redacción
            <select value={redactionType} onChange={(e) => setRedactionType(e.target.value as RedactionType)}>
              <option>Negro</option>
              <option>Blur</option>
            </select>
          </label>
          <p className="hint">Tap y arrastra sobre la imagen para añadir redacción.</p>
          <ul className="redaction-list">
            {redactions.map((item, index) => (
              <li key={item.id}>
                #{index + 1} {item.type} ({Math.round(item.width)}x{Math.round(item.height)})
                <button type="button" onClick={() => setRedactions((prev) => prev.filter((r) => r.id !== item.id))}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className="button-row">
          <button type="button" onClick={handleDownload} disabled={!imageEl}>
            Descargar imagen
          </button>
          <button type="button" onClick={handleShare} disabled={!imageEl}>
            Compartir
          </button>
          <button type="button" className="ghost" onClick={resetAll}>
            Reset
          </button>
        </div>
        {shareMessage && <p className="hint">{shareMessage}</p>}
      </section>

      <section className="panel preview">
        <h2>Vista previa</h2>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </section>

      <p className="legal">Esta herramienta no garantiza prevención total de fraude. Úsala bajo tu responsabilidad.</p>
    </main>
  );
}
