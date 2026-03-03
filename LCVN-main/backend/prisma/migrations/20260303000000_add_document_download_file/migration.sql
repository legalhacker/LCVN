-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "download_url" VARCHAR(1000),
ADD COLUMN     "download_file_name" VARCHAR(255),
ADD COLUMN     "download_file_size" INTEGER;
