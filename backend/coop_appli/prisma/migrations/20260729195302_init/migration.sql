-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADHERENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatutEvenement" AS ENUM ('OUVERT', 'CLOS');

-- CreateEnum
CREATE TYPE "StatutCotisation" AS ENUM ('EN_ATTENTE', 'PAYEE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "MoyenPaiement" AS ENUM ('ESPECES', 'CHEQUE', 'VIREMENT', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "CanalNotification" AS ENUM ('SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "StatutNotification" AS ENUM ('ENVOYEE', 'ECHEC');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADHERENT',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenements" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "montantCotisation" DECIMAL(10,2) NOT NULL,
    "dateEvenement" TIMESTAMP(3) NOT NULL,
    "dateLimitePaiement" TIMESTAMP(3) NOT NULL,
    "statut" "StatutEvenement" NOT NULL DEFAULT 'OUVERT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "evenements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotisations" (
    "id" TEXT NOT NULL,
    "montantDu" DECIMAL(10,2) NOT NULL,
    "statut" "StatutCotisation" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "evenementId" TEXT NOT NULL,

    CONSTRAINT "cotisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "moyenPaiement" "MoyenPaiement" NOT NULL,
    "note" TEXT,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cotisationId" TEXT NOT NULL,
    "enregistrePar" TEXT NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "canal" "CanalNotification" NOT NULL,
    "message" TEXT NOT NULL,
    "statut" "StatutNotification" NOT NULL DEFAULT 'ENVOYEE',
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_activite" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "cibleType" TEXT NOT NULL,
    "cibleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "journal_activite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telephone_key" ON "users"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cotisations_userId_evenementId_key" ON "cotisations"("userId", "evenementId");

-- AddForeignKey
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisations" ADD CONSTRAINT "cotisations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisations" ADD CONSTRAINT "cotisations_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "evenements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_cotisationId_fkey" FOREIGN KEY ("cotisationId") REFERENCES "cotisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_enregistrePar_fkey" FOREIGN KEY ("enregistrePar") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_activite" ADD CONSTRAINT "journal_activite_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
