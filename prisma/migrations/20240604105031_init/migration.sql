-- DropForeignKey
ALTER TABLE "EventType" DROP CONSTRAINT "EventType_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultSchduleId" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SelectedSlots" (
    "id" SERIAL NOT NULL,
    "eventTypeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "slotUtcStartDate" TIMESTAMP(3) NOT NULL,
    "slotUtcEndDate" TIMESTAMP(3) NOT NULL,
    "uid" TEXT NOT NULL,
    "releaseAt" TIMESTAMP(3) NOT NULL,
    "isSeat" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SelectedSlots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_user_eventtype" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SelectedSlots_userId_slotUtcStartDate_slotUtcEndDate_uid_key" ON "SelectedSlots"("userId", "slotUtcStartDate", "slotUtcEndDate", "uid");

-- CreateIndex
CREATE UNIQUE INDEX "_user_eventtype_AB_unique" ON "_user_eventtype"("A", "B");

-- CreateIndex
CREATE INDEX "_user_eventtype_B_index" ON "_user_eventtype"("B");

-- AddForeignKey
ALTER TABLE "_user_eventtype" ADD CONSTRAINT "_user_eventtype_A_fkey" FOREIGN KEY ("A") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_eventtype" ADD CONSTRAINT "_user_eventtype_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
