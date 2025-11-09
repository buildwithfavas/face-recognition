export type StoredFace = {
  name: string;
  descriptorB64: string;
};

export type KnownFaceFloat = {
  name: string;
  descriptor: Float32Array;
};

const STORAGE_KEY = 'localFaceDB.v1';

function toFloat32Array(d: Float32Array | number[]): Float32Array {
  return d instanceof Float32Array ? d : new Float32Array(d);
}

function u8ToB64(u8: Uint8Array): string {
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  if (typeof btoa !== 'undefined') return btoa(s);
  // minimal fallback
  const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  const bytes = enc ? enc.encode(s) : u8;
  let out = '';
  const base64abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let i = 0;
  const l = bytes.length;
  for (; i + 2 < l; i += 3) {
    out += base64abc[bytes[i] >> 2];
    out += base64abc[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    out += base64abc[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    out += base64abc[bytes[i + 2] & 63];
  }
  if (i < l) {
    out += base64abc[bytes[i] >> 2];
    if (i === l - 1) {
      out += base64abc[(bytes[i] & 3) << 4];
      out += '==';
    } else {
      out += base64abc[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      out += base64abc[(bytes[i + 1] & 15) << 2];
      out += '=';
    }
  }
  return out;
}

function b64ToU8(b64: string): Uint8Array {
  if (typeof atob !== 'undefined') {
    const bin = atob(b64);
    const len = bin.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  // minimal fallback
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  const bytes: number[] = [];
  const base64codes: Record<string, number> = {};
  const base64abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (let i = 0; i < base64abc.length; i++) base64codes[base64abc[i]] = i;
  let j = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n1 = base64codes[clean[i]];
    const n2 = base64codes[clean[i + 1]];
    const n3 = clean[i + 2] === '=' ? -1 : base64codes[clean[i + 2]];
    const n4 = clean[i + 3] === '=' ? -1 : base64codes[clean[i + 3]];
    bytes[j++] = (n1 << 2) | (n2 >> 4);
    if (n3 >= 0) bytes[j++] = ((n2 & 15) << 4) | (n3 >> 2);
    if (n4 >= 0) bytes[j++] = ((n3 & 3) << 6) | n4;
  }
  return new Uint8Array(bytes);
}

export function encodeDescriptor(descriptor: Float32Array | number[]): string {
  const f32 = toFloat32Array(descriptor);
  const u8 = new Uint8Array(f32.buffer.slice(0));
  return u8ToB64(u8);
}

export function decodeDescriptor(b64: string): Float32Array {
  const u8 = b64ToU8(b64);
  const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  return new Float32Array(buf);
}

export function loadStoredFaces(): StoredFace[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.name === 'string' && typeof x.descriptorB64 === 'string');
  } catch {
    return [];
  }
}

export function saveStoredFaces(items: StoredFace[]): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function getAllKnownFaces(): KnownFaceFloat[] {
  const items = loadStoredFaces();
  return items.map((it) => ({ name: it.name, descriptor: decodeDescriptor(it.descriptorB64) }));
}

export function addKnownFaceToDB(name: string, descriptor: Float32Array | number[]): void {
  const list = loadStoredFaces();
  list.push({ name, descriptorB64: encodeDescriptor(descriptor) });
  saveStoredFaces(list);
}

export function clearDB(): void {
  saveStoredFaces([]);
}

export function exportAsJSON(pretty = true): string {
  const items = loadStoredFaces();
  return pretty ? JSON.stringify(items, null, 2) : JSON.stringify(items);
}

export function importFromJSON(json: string, merge = true): void {
  try {
    const parsed = JSON.parse(json) as StoredFace[];
    const cleaned = Array.isArray(parsed)
      ? parsed.filter((x) => x && typeof x.name === 'string' && typeof x.descriptorB64 === 'string')
      : [];
    if (merge) {
      const current = loadStoredFaces();
      const merged = [...current, ...cleaned];
      saveStoredFaces(merged);
    } else {
      saveStoredFaces(cleaned);
    }
  } catch {
    // ignore invalid JSON
  }
}
