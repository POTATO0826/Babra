"use client";

import { useEffect, useRef } from "react";

type Contact = { label: string; type: "client" | "lead" | "meeting" };

const CONTACTS: Contact[] = [
  { label: "Eleanor Whitfield", type: "client" },
  { label: "Marcus Chen", type: "client" },
  { label: "Robert & Linda Alvarez", type: "client" },
  { label: "Tom Bradley", type: "client" },
  { label: "Jasmine Okoye", type: "client" },
  { label: "David Kim", type: "client" },
  { label: "Priya Nair", type: "lead" },
  { label: "Sofia Reyes", type: "lead" },
  { label: "Margaret Chen", type: "lead" },
  { label: "Robert Hale", type: "lead" },
  { label: "Aisha Rahman", type: "lead" },
  { label: "James Whitfield", type: "lead" },
  { label: "Annual review", type: "meeting" },
  { label: "Portfolio review", type: "meeting" },
  { label: "Estate plan", type: "meeting" },
];

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  ph: number;
  label: string | null;
  rgb: string | null;
};

/**
 * The landing hero: an ink-drawn network of nodes that drift, link with
 * hand-wobbled connective lines, and surface contact labels toward the edges
 * and under the cursor — a "living network of relationships."
 */
export function NeuralNetwork() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    const NODES: Node[] = [];
    const TC: Record<string, string> = {
      lead: "34,84,140",
      meeting: "86,111,79",
      client: "156,59,51",
    };

    const count = () => Math.round(Math.min(120, Math.max(54, (W * H) / 15000)));
    const build = () => {
      NODES.length = 0;
      const n = Math.max(count(), CONTACTS.length + 18);
      for (let i = 0; i < n; i++) {
        const c = CONTACTS[i];
        NODES.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() * 2 - 1) * 0.15,
          vy: (Math.random() * 2 - 1) * 0.15,
          r: c ? 2.4 + Math.random() * 1.1 : 1.4 + Math.random() * 2.0,
          ph: Math.random() * 6.2832,
          label: c ? c.label : null,
          rgb: c ? TC[c.type] : null,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    resize();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("resize", resize);

    const LINK = 188;
    const t0 = performance.now();
    let raf = 0;

    const draw = () => {
      const tm = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#EFEAE0";
      ctx.fillRect(0, 0, W, H);

      for (const nd of NODES) {
        nd.x += nd.vx;
        nd.y += nd.vy;
        if (nd.x < 2 || nd.x > W - 2) nd.vx *= -1;
        if (nd.y < 2 || nd.y > H - 2) nd.vy *= -1;
        nd.x = Math.max(0, Math.min(W, nd.x));
        nd.y = Math.max(0, Math.min(H, nd.y));
        if (mouse.active) {
          const dx = nd.x - mouse.x;
          const dy = nd.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < 130 && d > 0.1) {
            const f = ((130 - d) / 130) * 0.7;
            nd.x += (dx / d) * f;
            nd.y += (dy / d) * f;
          }
        }
      }

      for (let i = 0; i < NODES.length; i++) {
        const a = NODES[i];
        for (let j = i + 1; j < NODES.length; j++) {
          const b = NODES[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const al = 1 - d / LINK;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const nx = -dy / d;
            const ny = dx / d;
            const wob = Math.sin(tm * 0.6 + a.ph + b.ph) * Math.min(15, d * 0.13);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo(mx + nx * wob, my + ny * wob, b.x, b.y);
            ctx.strokeStyle = "rgba(26,24,20," + (al * 0.22).toFixed(3) + ")";
            ctx.lineWidth = 0.55 + al * 0.75;
            ctx.stroke();
          }
        }
        if (mouse.active) {
          const dx = mouse.x - a.x;
          const dy = mouse.y - a.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK * 1.25) {
            const al = 1 - d / (LINK * 1.25);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = "rgba(40,58,98," + (al * 0.38).toFixed(3) + ")";
            ctx.lineWidth = 0.55 + al * 0.85;
            ctx.stroke();
          }
        }
      }

      const cx = W / 2;
      const cy = H * 0.52;
      ctx.textBaseline = "middle";
      for (const nd of NODES) {
        const R = nd.r;
        const g = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, R * 5.2);
        g.addColorStop(0, "rgba(22,20,17,0.42)");
        g.addColorStop(0.4, "rgba(22,20,17,0.13)");
        g.addColorStop(1, "rgba(22,20,17,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, R * 5.2, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = "rgba(20,18,15,0.92)";
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, R, 0, 6.2832);
        ctx.fill();
        if (nd.label && nd.rgb) {
          const near =
            mouse.active && Math.hypot(nd.x - mouse.x, nd.y - mouse.y) < 150;
          const dc = Math.hypot(nd.x - cx, nd.y - cy);
          let vis = Math.min(1, Math.max(0, (dc - 175) / 190));
          if (near) vis = 1;
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, R + 3.2, 0, 6.2832);
          ctx.strokeStyle = "rgba(" + nd.rgb + "," + (near ? 0.9 : 0.42) + ")";
          ctx.lineWidth = 1.4;
          ctx.stroke();
          if (vis > 0.02) {
            ctx.textAlign = "left";
            ctx.font = "600 " + (near ? 12.5 : 11) + 'px "Hanken Grotesk", sans-serif';
            const tx = nd.x + R + 8;
            const ty = nd.y;
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(239,234,224," + (0.9 * vis).toFixed(3) + ")";
            ctx.strokeText(nd.label, tx, ty);
            ctx.fillStyle = near
              ? "rgba(" + nd.rgb + ",0.98)"
              : "rgba(46,42,33," + (0.66 * vis).toFixed(3) + ")";
            ctx.fillText(nd.label, tx, ty);
          }
        }
      }

      if (mouse.active) {
        const mg = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          16
        );
        mg.addColorStop(0, "rgba(40,58,98,0.5)");
        mg.addColorStop(1, "rgba(40,58,98,0)");
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 16, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = "rgba(40,58,98,0.85)";
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.6, 0, 6.2832);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
