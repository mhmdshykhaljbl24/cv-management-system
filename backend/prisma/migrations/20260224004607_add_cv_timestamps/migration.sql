/*
  Warnings:

  - Added the required column `updatedAt` to the `CV` table without a default value. This is not possible if the table is not empty.
  - Made the column `summary` on table `CV` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CV" DROP CONSTRAINT "CV_userId_fkey";

-- AlterTable
ALTER TABLE "CV" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "summary" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CV" ADD CONSTRAINT "CV_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
