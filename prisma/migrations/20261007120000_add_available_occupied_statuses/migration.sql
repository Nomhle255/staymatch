ALTER TABLE "Accommodation" ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "AccommodationStatus" RENAME TO "AccommodationStatus_old";

CREATE TYPE "AccommodationStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'VERIFIED', 'PENDING_REVIEW', 'INACTIVE');

ALTER TABLE "Accommodation"
ALTER COLUMN "status" TYPE "AccommodationStatus"
USING (
    CASE "status"::text
        WHEN 'VERIFIED' THEN 'AVAILABLE'::"AccommodationStatus"
        ELSE "status"::text::"AccommodationStatus"
    END
);

DROP TYPE "AccommodationStatus_old";

ALTER TABLE "Accommodation" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';