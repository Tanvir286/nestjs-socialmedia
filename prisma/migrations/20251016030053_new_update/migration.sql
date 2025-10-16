-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "groupAdminId" INTEGER,
ADD COLUMN     "groupImage" TEXT,
ADD COLUMN     "groupName" TEXT,
ADD COLUMN     "isGroup" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Participant" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'MEMBER';
