-- Categoria com peça não pode ser apagada: levaria as peças junto. Desativar
-- resolve — some do site e o conteúdo fica no banco.
ALTER TABLE "Category" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
