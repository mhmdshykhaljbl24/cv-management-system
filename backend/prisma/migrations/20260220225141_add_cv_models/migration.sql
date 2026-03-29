/*
  Warnings:

  - You are about to drop the column `projectName` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `proficiency` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the `Cv` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PersonalInfo` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `country` on table `Education` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Education` required. This step will fail if there are existing NULL values in that column.
  - Made the column `degree` on table `Education` required. This step will fail if there are existing NULL values in that column.
  - Made the column `major` on table `Education` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `Experience` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Experience` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `technologies` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `level` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cv" DROP CONSTRAINT "Cv_userId_fkey";

-- DropForeignKey
ALTER TABLE "Education" DROP CONSTRAINT "Education_cvId_fkey";

-- DropForeignKey
ALTER TABLE "Experience" DROP CONSTRAINT "Experience_cvId_fkey";

-- DropForeignKey
ALTER TABLE "PersonalInfo" DROP CONSTRAINT "PersonalInfo_cvId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_cvId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_cvId_fkey";

-- DropIndex
DROP INDEX "Skill_cvId_name_key";

-- AlterTable
ALTER TABLE "Education" ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "degree" SET NOT NULL,
ALTER COLUMN "major" SET NOT NULL;

-- AlterTable
ALTER TABLE "Experience" ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "projectName",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "technologies" SET NOT NULL;

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "proficiency",
ADD COLUMN     "level" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Cv";

-- DropTable
DROP TABLE "PersonalInfo";

-- CreateTable
CREATE TABLE "CV" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CV_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CV" ADD CONSTRAINT "CV_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
