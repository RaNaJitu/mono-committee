-- CreateTable
CREATE TABLE "WhiteLabel" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "salt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "wl_server_config" (
    "id" INTEGER NOT NULL,
    "Domains" TEXT[],
    "Server_ip" TEXT[],
    "dbname" TEXT NOT NULL,
    "whiteLabelId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,

    CONSTRAINT "wl_server_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabel_id_key" ON "WhiteLabel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabel_username_key" ON "WhiteLabel"("username");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabel_email_key" ON "WhiteLabel"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wl_server_config_id_key" ON "wl_server_config"("id");

-- CreateIndex
CREATE UNIQUE INDEX "wl_server_config_whiteLabelId_key" ON "wl_server_config"("whiteLabelId");

-- AddForeignKey
ALTER TABLE "wl_server_config" ADD CONSTRAINT "wl_server_config_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
