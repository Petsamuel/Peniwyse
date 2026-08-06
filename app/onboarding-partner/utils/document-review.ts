import { format } from "date-fns";

/**
 * Reads the reviewer's verdict on an uploaded document.
 *
 * The registration payload is not uniform — a document's verdict can arrive
 * flattened onto the owner (`proofOfWealthStatus`), inside the owner's
 * `documents[]` array, or on a company document entry, and the field names
 * differ per source. Everything here probes the known aliases and gives up
 * quietly rather than assuming one shape.
 */

export type ReviewStatus = "Approved" | "Rejected" | "In Review" | "Pending";

export interface DocumentReview {
  status?: ReviewStatus;
  isRejected: boolean;
  comment?: string;
  reviewedAt?: string;
}

type Source = Record<string, unknown> | null | undefined;

const STATUS_KEYS = [
  "status",
  "docStatus",
  "documentStatus",
  "approvalStatus",
  "reviewStatus",
  "verificationStatus",
];

const COMMENT_KEYS = [
  "reviewComment",
  "reviewNote",
  "rejectionReason",
  "rejectReason",
  "responseMessage",
  "responseDescription",
  "reason",
  "comment",
  "note",
  "remarks",
];

const DATE_KEYS = [
  "reviewedAt",
  "reviewedOn",
  "reviewDate",
  "rejectedAt",
  "statusDate",
  "dateReviewed",
  "modifiedAt",
  "updatedAt",
  "lastModified",
];

const EMPTY: DocumentReview = { isRejected: false };

function withPrefix(prefix: string | undefined, key: string) {
  if (!prefix) return key;
  return prefix + key.charAt(0).toUpperCase() + key.slice(1);
}

function pickString(source: Source, keys: string[], prefix?: string) {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[withPrefix(prefix, key)];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function normalizeReviewStatus(raw?: string): ReviewStatus | undefined {
  const value = raw?.toLowerCase().replace(/[\s_-]/g, "");
  if (!value) return undefined;
  if (/reject|declin|fail/.test(value)) return "Rejected";
  if (/approve|verified|complete|success/.test(value)) return "Approved";
  if (/review|submitted/.test(value)) return "In Review";
  if (/pending|await/.test(value)) return "Pending";
  return undefined;
}

function readReview(source: Source, prefix?: string): DocumentReview {
  const status = normalizeReviewStatus(pickString(source, STATUS_KEYS, prefix));
  if (!status) return EMPTY;
  return {
    status,
    isRejected: status === "Rejected",
    comment: pickString(source, COMMENT_KEYS, prefix),
    reviewedAt: pickString(source, DATE_KEYS, prefix),
  };
}

/** Matches the design's timestamp, e.g. "August 1, 2026 04:33". */
export function formatReviewDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return format(parsed, "MMMM d, yyyy HH:mm");
}

// ─── Beneficial owner documents ──────────────────────────────────────────────

export type OwnerDocKind = "wealth" | "address";

// Owner-level field prefixes, in the order they are trusted.
const OWNER_PREFIXES: Record<OwnerDocKind, string[]> = {
  wealth: ["proofOfWealth", "sourceOfWealth", "identityDocument"],
  address: ["proofOfAddress", "residentialAddress"],
};

const OWNER_DOC_PATTERN: Record<OwnerDocKind, RegExp> = {
  wealth: /wealth|source|identity/i,
  address: /address|residential/i,
};

function ownerDocuments(owner: Source): Array<Record<string, unknown>> {
  const documents = owner?.documents;
  return Array.isArray(documents) ? (documents as Array<Record<string, unknown>>) : [];
}

function documentTypeLabel(doc: Record<string, unknown>) {
  return `${doc.documentType || doc.documentTypeId || doc.type || doc.category || doc.name || doc.title || ""}`;
}

export function readOwnerDocumentReview(owner: Source, kind: OwnerDocKind): DocumentReview {
  for (const prefix of OWNER_PREFIXES[kind]) {
    const review = readReview(owner, prefix);
    if (review.status) return review;
  }

  const match = ownerDocuments(owner).find((doc) =>
    OWNER_DOC_PATTERN[kind].test(documentTypeLabel(doc)),
  );
  return match ? readReview(match) : EMPTY;
}

// ─── Company documents ───────────────────────────────────────────────────────

const COMPANY_DOC_COLLECTIONS = [
  "documents",
  "companyDocuments",
  "uploadedDocuments",
  "documentUploads",
];

function companyDocuments(registration: Source): Array<Record<string, unknown>> {
  if (!registration) return [];
  return COMPANY_DOC_COLLECTIONS.flatMap((key) => {
    const value = registration[key];
    return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
  });
}

/** Finds the reviewer's verdict on a company document by its type id or name. */
export function readCompanyDocumentReview(
  registration: Source,
  documentTypeId?: string,
  documentTypeName?: string,
): DocumentReview {
  const wantedName = documentTypeName?.trim().toLowerCase();

  const match = companyDocuments(registration).find((doc) => {
    const id = `${doc.documentTypeId || doc.documentType || doc.typeId || ""}`;
    if (documentTypeId && id && id === documentTypeId) return true;
    const label = documentTypeLabel(doc).trim().toLowerCase();
    return !!wantedName && !!label && label === wantedName;
  });

  return match ? readReview(match) : EMPTY;
}

// ─── Aggregate ───────────────────────────────────────────────────────────────

/**
 * True when the reviewer sent anything back for re-upload. Used to drop the
 * partner straight onto the documents step so the feedback is not buried.
 */
export function hasRejectedDocuments(registration: Source): boolean {
  const owners = registration?.beneficialOwners;
  const ownerRejected =
    Array.isArray(owners) &&
    owners.some((owner) => {
      const source = owner as Record<string, unknown>;
      if (readOwnerDocumentReview(source, "wealth").isRejected) return true;
      if (readOwnerDocumentReview(source, "address").isRejected) return true;
      return ownerDocuments(source).some((doc) => readReview(doc).isRejected);
    });

  if (ownerRejected) return true;

  return companyDocuments(registration).some((doc) => readReview(doc).isRejected);
}
