-- CreateTable
CREATE TABLE "ev_stations" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "connectors" TEXT[],
    "open24h" BOOLEAN NOT NULL DEFAULT false,
    "hoursText" TEXT,
    "source" TEXT NOT NULL DEFAULT 'mef',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ev_stations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ev_stations_externalId_key" ON "ev_stations"("externalId");

-- CreateIndex
CREATE INDEX "ev_stations_latitude_longitude_idx" ON "ev_stations"("latitude", "longitude");
