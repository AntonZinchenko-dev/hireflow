-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN "portalProfileId" TEXT;

-- CreateIndex
CREATE INDEX "Candidate_portalProfileId_idx" ON "Candidate"("portalProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_vacancyId_portalProfileId_key" ON "Candidate"("vacancyId", "portalProfileId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_portalProfileId_fkey"
FOREIGN KEY ("portalProfileId") REFERENCES "PortalProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
