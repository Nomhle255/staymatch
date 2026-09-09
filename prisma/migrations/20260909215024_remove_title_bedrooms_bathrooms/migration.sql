/*
  Warnings:

  - The values [SHARED_APARTMENT,STUDIO_FLAT,EN_SUITE] on the enum `PropertyType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bathrooms` on the `Accommodation` table. All the data in the column will be lost.
  - You are about to drop the column `bedrooms` on the `Accommodation` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Accommodation` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `Accommodation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Accommodation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PropertyType_new" AS ENUM ('SINGLE_ROOM', 'DOUBLE', 'COMMUNE', 'BACHELOR');
ALTER TABLE "Accommodation" ALTER COLUMN "propertyType" TYPE "PropertyType_new" USING ("propertyType"::text::"PropertyType_new");
ALTER TYPE "PropertyType" RENAME TO "PropertyType_old";
ALTER TYPE "PropertyType_new" RENAME TO "PropertyType";
DROP TYPE "public"."PropertyType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Accommodation" DROP COLUMN "bathrooms",
DROP COLUMN "bedrooms",
DROP COLUMN "title",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
