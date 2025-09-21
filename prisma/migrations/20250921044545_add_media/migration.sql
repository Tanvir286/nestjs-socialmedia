/*
  Warnings:

  - The `mediaUrls` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "mediaUrls",
ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
