/**
 * Google Drive API client for screenshot access.
 * Edge-compatible — uses fetch directly against Drive v3 REST API.
 * Folder IDs are configurable via env vars.
 */

const DRIVE_BASE = "https://www.googleapis.com/drive/v3/files";

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  date: string | null;     // extracted YYYY-MM-DD
  symbol: string | null;   // extracted ticker
  type: "entry" | "eod";
}

export interface ScreenshotIndex {
  /** key: "YYYY-MM-DD|SYMBOL" */
  [key: string]: { entry: DriveFileInfo[]; eod: DriveFileInfo[] };
}

/**
 * Parse a screenshot filename to extract date, symbol, and type.
 *
 * Expected formats:
 *   Entry: "YYYY-MM-DD SYMBOL <more details>.png"
 *   EOD:   "YYYY-MM-DD SYMBOL EOD <more details>.png"
 *
 * Files not matching the date pattern go into "unmatched".
 */
export function parseScreenshotFilename(
  name: string,
  folderType: "entry" | "eod"
): { date: string | null; symbol: string | null; type: "entry" | "eod" } {
  const tokens = name.split(/\s+/);
  const dateMatch = tokens[0]?.match(/^\d{4}-\d{2}-\d{2}$/);

  if (!dateMatch || tokens.length < 2) {
    return { date: null, symbol: null, type: folderType };
  }

  const date = tokens[0];
  const symbol = tokens[1].toUpperCase();

  // If the file is in the EOD folder OR token[2] says "EOD", mark as eod
  const isEod = folderType === "eod" || tokens[2]?.toUpperCase() === "EOD";

  return { date, symbol, type: isEod ? "eod" : "entry" };
}

function getEntryFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_ENTRY_FOLDER_ID;
  if (!id) throw new Error("GOOGLE_DRIVE_ENTRY_FOLDER_ID environment variable is not set.");
  return id;
}

function getEodFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_EOD_FOLDER_ID;
  if (!id) throw new Error("GOOGLE_DRIVE_EOD_FOLDER_ID environment variable is not set.");
  return id;
}

/**
 * List all image files in a Google Drive folder.
 * Uses pagination to get all files (not just first 100).
 */
async function listFolderImages(
  token: string,
  folderId: string
): Promise<{ id: string; name: string; mimeType: string }[]> {
  const files: { id: string; name: string; mimeType: string }[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType)",
      orderBy: "name",
      pageSize: "200",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(`${DRIVE_BASE}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Drive list failed: ${err}`);
    }

    const data = (await res.json()) as {
      files?: { id: string; name: string; mimeType: string }[];
      nextPageToken?: string;
    };
    files.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

/**
 * Build a complete screenshot index from both entry and EOD folders.
 * Returns a map keyed by "YYYY-MM-DD|SYMBOL" with entry and eod arrays.
 */
export async function buildScreenshotIndex(token: string): Promise<{
  index: ScreenshotIndex;
  unmatched: DriveFileInfo[];
}> {
  const entryFolderId = getEntryFolderId();
  const eodFolderId = getEodFolderId();

  // Fetch both folders in parallel
  const [entryFiles, eodFiles] = await Promise.all([
    listFolderImages(token, entryFolderId),
    listFolderImages(token, eodFolderId),
  ]);

  const index: ScreenshotIndex = {};
  const unmatched: DriveFileInfo[] = [];

  function addToIndex(
    files: { id: string; name: string; mimeType: string }[],
    folderType: "entry" | "eod"
  ) {
    for (const f of files) {
      const parsed = parseScreenshotFilename(f.name, folderType);
      const info: DriveFileInfo = {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        date: parsed.date,
        symbol: parsed.symbol,
        type: parsed.type,
      };

      if (!parsed.date || !parsed.symbol) {
        unmatched.push(info);
        continue;
      }

      const key = `${parsed.date}|${parsed.symbol}`;
      if (!index[key]) {
        index[key] = { entry: [], eod: [] };
      }
      index[key][parsed.type].push(info);
    }
  }

  addToIndex(entryFiles, "entry");
  addToIndex(eodFiles, "eod");

  return { index, unmatched };
}

/**
 * Fetch raw image bytes from Google Drive for a specific file.
 * Returns the Response object so the caller can stream it.
 */
export async function getFileContent(
  token: string,
  fileId: string
): Promise<Response> {
  const res = await fetch(`${DRIVE_BASE}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive file download failed: ${err}`);
  }
  return res;
}
