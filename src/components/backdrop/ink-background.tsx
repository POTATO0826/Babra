"use client";

import { useEffect, useRef } from "react";

/**
 * A slow, flowing WebGL "ink on paper" wash that sits behind the whole app
 * shell. It's a subtle domain-warped fbm field blended heavily toward cream,
 * so panels read crisply on top while the gaps between them breathe.
 */
export function InkBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", {
        antialias: false,
        alpha: false,
        premultipliedAlpha: false,
      }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    const vsrc = "attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }";
    const fsrc = [
      "precision highp float;",
      "uniform vec2 u_res; uniform float u_time;",
      "float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }",
      "float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);",
      "  float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));",
      "  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }",
      "float fbm(vec2 p){ float v=0.0, a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);",
      "  for(int i=0;i<6;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }",
      "void main(){",
      "  vec2 uv = gl_FragCoord.xy/u_res.xy;",
      "  float asp = u_res.x/u_res.y;",
      "  vec2 p = vec2(uv.x*asp, uv.y)*2.4;",
      "  float t = u_time*0.03;",
      "  vec2 q = vec2(fbm(p + vec2(0.0,0.0) + 0.10*t), fbm(p + vec2(5.2,1.3)));",
      "  vec2 r = vec2(fbm(p + 3.5*q + vec2(1.7,9.2) + 0.12*t), fbm(p + 3.5*q + vec2(8.3,2.8) - 0.10*t));",
      "  float f = fbm(p + 3.5*r);",
      "  float fl = length(r);",
      "  vec3 cream = vec3(0.937,0.918,0.872);",
      "  vec3 paper = vec3(0.885,0.860,0.804);",
      "  vec3 blue  = vec3(0.13,0.235,0.46);",
      "  vec3 ink   = vec3(0.05,0.06,0.085);",
      "  vec3 red   = vec3(0.58,0.205,0.165);",
      "  vec3 gold  = vec3(0.72,0.52,0.26);",
      "  vec3 col = mix(cream, paper, smoothstep(0.2,0.9,f));",
      "  col = mix(col, blue, smoothstep(0.40,0.98,fl)*0.60);",
      "  col = mix(col, red, smoothstep(0.45,0.85,f)*smoothstep(0.62,0.12,r.y)*0.50);",
      "  col = mix(col, gold, smoothstep(0.52,0.82,q.x)*smoothstep(0.34,0.02,fl)*0.30);",
      "  col = mix(col, ink, smoothstep(0.86,1.30,fl)*0.50);",
      "  float veins = abs(sin(6.2831*(f*3.0 + r.x*1.5)));",
      "  veins = smoothstep(0.0,0.09,veins);",
      "  col = mix(ink, col, mix(1.0, veins, 0.16));",
      "  col = mix(cream, col, 0.62);",
      "  gl_FragColor = vec4(col,1.0);",
      "}",
    ].join("\n");

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");

    const scale = 0.5; // render at half-res; it's a soft wash
    const resize = () => {
      const w = Math.max(2, Math.floor(window.innerWidth * scale));
      const h = Math.max(2, Math.floor(window.innerHeight * scale));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const start = performance.now();
    const loop = () => {
      const tm = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, tm);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
