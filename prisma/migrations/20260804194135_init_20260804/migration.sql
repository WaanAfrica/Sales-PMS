-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALES');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SALES',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySales" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "salesRevenue" DOUBLE PRECISION NOT NULL,
    "repeatCustomers" INTEGER NOT NULL,
    "newCustomers" INTEGER NOT NULL,
    "walkIns" INTEGER NOT NULL,
    "newQuotations" INTEGER NOT NULL,
    "closedQuotations" INTEGER NOT NULL,
    "quotationAge" DOUBLE PRECISION NOT NULL,
    "hotQuotationValue" DOUBLE PRECISION NOT NULL,
    "salesPipelineValue" DOUBLE PRECISION NOT NULL,
    "accountsReceivable" DOUBLE PRECISION NOT NULL,
    "opportunities" TEXT,
    "challenges" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "salesRevenueTarget" DOUBLE PRECISION NOT NULL,
    "repeatCustomerTarget" INTEGER NOT NULL,
    "newCustomerTarget" INTEGER NOT NULL,
    "walkInTarget" INTEGER NOT NULL,
    "quotationTarget" INTEGER NOT NULL,
    "pipelineTarget" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DailySales_userId_date_key" ON "DailySales"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyTarget_userId_month_year_key" ON "MonthlyTarget"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "DailySales" ADD CONSTRAINT "DailySales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyTarget" ADD CONSTRAINT "MonthlyTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
