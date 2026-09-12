-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "capaProdutoId" TEXT;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_capaProdutoId_fkey" FOREIGN KEY ("capaProdutoId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
