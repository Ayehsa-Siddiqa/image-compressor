/** Triggers a browser download for an in-memory file. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser time to start reading the blob before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Bundles files into an uncompressed ZIP (images are already compressed, so deflating again only costs time). */
export async function zipFiles(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const { zip } = await import("fflate");
  const entries: Record<string, Uint8Array> = {};
  const used = new Set<string>();

  for (const { name, blob } of files) {
    entries[uniqueName(name, used)] = new Uint8Array(await blob.arrayBuffer());
  }

  const data = await new Promise<Uint8Array>((resolve, reject) =>
    zip(entries, { level: 0 }, (error, result) => (error ? reject(error) : resolve(result))),
  );
  return new Blob([data as Uint8Array<ArrayBuffer>], { type: "application/zip" });
}

function uniqueName(name: string, used: Set<string>) {
  let candidate = name;
  const dot = name.lastIndexOf(".");
  const [base, ext] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ""];
  for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${base} (${n})${ext}`;
  used.add(candidate.toLowerCase());
  return candidate;
}
