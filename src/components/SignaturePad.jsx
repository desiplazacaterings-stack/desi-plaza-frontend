import { useRef, useState, useEffect } from "react";

export default function SignaturePad({ onSign, disabled = false }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setContext(ctx);
    }
  }, []);

  const startDrawing = (e) => {
    if (disabled) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left || (e.touches && e.touches[0].clientX - rect.left);
    const y = e.clientY - rect.top || (e.touches && e.touches[0].clientY - rect.top);

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left || (e.touches && e.touches[0].clientX - rect.left);
    const y = e.clientY - rect.top || (e.touches && e.touches[0].clientY - rect.top);

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    context.closePath();
  };

  const clearSignature = () => {
    if (context) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const getSignatureData = () => {
    return canvasRef.current.toDataURL("image/png");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          border: "2px solid #ccc",
          borderRadius: "4px",
          backgroundColor: "#fff",
          cursor: disabled ? "not-allowed" : "crosshair",
          opacity: disabled ? 0.6 : 1
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            display: "block",
            width: "100%",
            height: "200px",
            touchAction: "none"
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          onClick={clearSignature}
          disabled={disabled}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f39c12",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "0.9em"
          }}
        >
          🧹 Clear
        </button>
        <button
          onClick={() => onSign(getSignatureData())}
          disabled={disabled}
          style={{
            padding: "8px 16px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "0.9em"
          }}
        >
          ✓ Sign
        </button>
      </div>
    </div>
  );
}
