/*
  Warnings:

  - Added the required column `fullName` to the `CV` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CV" ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
