const m = 0x5F375A86,
  // Creating the buffer and view outside the function
  // for performance, but this is not thread safe.
  buffer = new ArrayBuffer(4),
  view = new DataView(buffer);

export default function qSqrt(n: number) {
  var f, n2 = n * 0.5, th = 1.5;
  view.setFloat32(0, n);
  view.setUint32(0, m - (view.getUint32(0) >> 1));
  f = view.getFloat32(0);
  f *= (th - (n2 * f * f));
  f *= (th - (n2 * f * f));
  return f;
}