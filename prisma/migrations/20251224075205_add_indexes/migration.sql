-- CreateIndex
CREATE INDEX "Day_order_idx" ON "Day"("order");

-- CreateIndex
CREATE INDEX "Location_dayId_idx" ON "Location"("dayId");

-- CreateIndex
CREATE INDEX "Location_order_idx" ON "Location"("order");

-- CreateIndex
CREATE INDEX "Photo_locationId_idx" ON "Photo"("locationId");

-- CreateIndex
CREATE INDEX "Photo_order_idx" ON "Photo"("order");
