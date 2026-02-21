import { useEffect } from "react";

function base64ToUint8Array(b64: string) {
  const bin = atob(b64.split(",").pop() || b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function packICO(pngs: Uint8Array[]): Blob {
  const count = pngs.length;
  const dirSize = 6 + count * 16;
  const dataSize = pngs.reduce((acc, p) => acc + p.length, 0);
  const buf = new ArrayBuffer(dirSize + dataSize);
  const dv = new DataView(buf);
  let offset = 0;
  dv.setUint16(offset, 0, true); offset += 2; // reserved
  dv.setUint16(offset, 1, true); offset += 2; // ICO type
  dv.setUint16(offset, count, true); offset += 2; // count
  let dataOffset = dirSize;
  const sizes = [16, 32, 48].slice(0, count);
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const bytes = pngs[i];
    dv.setUint8(offset + 0, size === 256 ? 0 : size); // width
    dv.setUint8(offset + 1, size === 256 ? 0 : size); // height
    dv.setUint8(offset + 2, 0); // color count
    dv.setUint8(offset + 3, 0); // reserved
    dv.setUint16(offset + 4, 1, true); // planes
    dv.setUint16(offset + 6, 32, true); // bitcount
    dv.setUint32(offset + 8, bytes.length, true); // bytes in res
    dv.setUint32(offset + 12, dataOffset, true); // image offset
    offset += 16;
    new Uint8Array(buf, dataOffset, bytes.length).set(bytes);
    dataOffset += bytes.length;
  }
  return new Blob([buf], { type: "image/x-icon" });
}

async function loadImageBlob(url: string): Promise<ImageBitmap | null> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    const b = await r.blob();
    return await createImageBitmap(b);
  } catch {
    return null;
  }
}

function drawCenterCropSquare(img: ImageBitmap): HTMLCanvasElement {
  const size = Math.min(img.width, img.height);
  const sx = Math.floor((img.width - size) / 2);
  const sy = Math.floor((img.height - size) / 2);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
  return c;
}

function resizeTo(canvas: HTMLCanvasElement, size: number): Uint8Array {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, size, size);
  const pngB64 = c.toDataURL("image/png");
  return base64ToUint8Array(pngB64);
}

function setIconLink(rel: string, type: string, href: string, sizes?: string) {
  const head = document.head;
  let link = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][type="${type}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    link.type = type;
    head.appendChild(link);
  }
  link.href = href;
  if (sizes) link.sizes = sizes;
}

export function useDynamicFavicon() {
  useEffect(() => {
    (async () => {
      const img = await loadImageBlob("/assets/favicon-source.jpg") || await loadImageBlob("/assets/favicon-source.png");
      if (!img) return;
      const square = drawCenterCropSquare(img);
      const s16 = resizeTo(square, 16);
      const s32 = resizeTo(square, 32);
      const s48 = resizeTo(square, 48);
      const icoBlob = packICO([s16, s32, s48]);
      const icoUrl = URL.createObjectURL(icoBlob);
      const png32Url = URL.createObjectURL(new Blob([s32], { type: "image/png" }));
      const png48Url = URL.createObjectURL(new Blob([s48], { type: "image/png" }));
      setIconLink("icon", "image/x-icon", icoUrl, "16x16 32x32 48x48");
      setIconLink("icon", "image/png", png32Url, "32x32");
      setIconLink("apple-touch-icon", "image/png", png48Url, "48x48");
    })();
  }, []);
}
