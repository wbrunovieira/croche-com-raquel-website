-- A Raquel não usa e-mail: entrar no painel com e-mail era barreira sem
-- contrapartida, já que não há recuperação de senha nem notificação por
-- e-mail. Renomeia em vez de recriar para não perder as contas existentes.
ALTER TABLE "User" RENAME COLUMN "email" TO "username";
ALTER INDEX "User_email_key" RENAME TO "User_username_key";
