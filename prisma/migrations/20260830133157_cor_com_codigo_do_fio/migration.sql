-- AlterTable
ALTER TABLE "OptionGroup" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "OptionValue" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "yarnColorCode" TEXT,
ADD COLUMN     "yarnLine" TEXT;
