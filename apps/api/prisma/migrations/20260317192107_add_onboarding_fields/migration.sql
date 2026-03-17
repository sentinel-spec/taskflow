-- CreateEnum
CREATE TYPE "WorkspaceUseCase" AS ENUM ('WORK', 'PERSONAL', 'STUDY', 'OTHER');

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "team_size" TEXT,
ADD COLUMN     "use_case" "WorkspaceUseCase" NOT NULL DEFAULT 'WORK';
