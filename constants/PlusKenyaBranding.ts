
/**
 * FRESH-Start Branding Constants
 * 
 * Official brand colors: Black, Red, Green, White (Kenya flag colors)
 * Slogan: "KENYA into global trade"
 */

export const FRESH_START_BRANDING = {
  slogan: 'KENYA into global trade',
  
  colors: {
    black: '#000000',
    red: '#DC143C',
    green: '#006400',
    white: '#FFFFFF',
  },
  
  // County data - All 47 Kenyan counties
  counties: [
    { number: '01', code: 'MSA', name: 'Mombasa' },
    { number: '02', code: 'KWL', name: 'Kwale' },
    { number: '03', code: 'KLF', name: 'Kilifi' },
    { number: '04', code: 'TRV', name: 'Tana River' },
    { number: '05', code: 'LMU', name: 'Lamu' },
    { number: '06', code: 'TVT', name: 'Taita/Taveta' },
    { number: '07', code: 'GRS', name: 'Garissa' },
    { number: '08', code: 'WJR', name: 'Wajir' },
    { number: '09', code: 'MDR', name: 'Mandera' },
    { number: '10', code: 'MST', name: 'Marsabit' },
    { number: '11', code: 'ISO', name: 'Isiolo' },
    { number: '12', code: 'MRU', name: 'Meru' },
    { number: '13', code: 'TKN', name: 'Tharaka-Nithi' },
    { number: '14', code: 'EMB', name: 'Embu' },
    { number: '15', code: 'KTI', name: 'Kitui' },
    { number: '16', code: 'MCK', name: 'Machakos' },
    { number: '17', code: 'MKN', name: 'Makueni' },
    { number: '18', code: 'NRA', name: 'Nyandarua' },
    { number: '19', code: 'NYR', name: 'Nyeri' },
    { number: '20', code: 'KRG', name: 'Kirinyaga' },
    { number: '21', code: 'MRA', name: "Murang'a" },
    { number: '22', code: 'KBU', name: 'Kiambu' },
    { number: '23', code: 'TKN', name: 'Turkana' },
    { number: '24', code: 'WPT', name: 'West Pokot' },
    { number: '25', code: 'SMR', name: 'Samburu' },
    { number: '26', code: 'TNR', name: 'Trans Nzoia' },
    { number: '27', code: 'UGU', name: 'Uasin Gishu' },
    { number: '28', code: 'ELM', name: 'Elgeyo/Marakwet' },
    { number: '29', code: 'NDI', name: 'Nandi' },
    { number: '30', code: 'BRO', name: 'Baringo' },
    { number: '31', code: 'LKP', name: 'Laikipia' },
    { number: '32', code: 'NRU', name: 'Nakuru' },
    { number: '33', code: 'NRK', name: 'Narok' },
    { number: '34', code: 'KJO', name: 'Kajiado' },
    { number: '35', code: 'KRC', name: 'Kericho' },
    { number: '36', code: 'BOM', name: 'Bomet' },
    { number: '37', code: 'KKG', name: 'Kakamega' },
    { number: '38', code: 'VHG', name: 'Vihiga' },
    { number: '39', code: 'BGA', name: 'Bungoma' },
    { number: '40', code: 'BSA', name: 'Busia' },
    { number: '41', code: 'SYA', name: 'Siaya' },
    { number: '42', code: 'KSM', name: 'Kisumu' },
    { number: '43', code: 'HBY', name: 'Homa Bay' },
    { number: '44', code: 'MGR', name: 'Migori' },
    { number: '45', code: 'KSI', name: 'Kisii' },
    { number: '46', code: 'NYM', name: 'Nyamira' },
    { number: '47', code: 'NBI', name: 'Nairobi City' },
  ],
};

/**
 * Crop Matrix Data
 * Complete agricultural data for 8 crops supported by FRESH-Start
 */
export interface CropMatrixData {
  cropName: string;
  perCapitaConsumptionLbs: number;
  annualVolMillionMetricTons: number;
  onePercentMarketShareMetricTons: number;
  dailyDemandMetricTons: number;
  maturityPeriodDays: number;
  plantSpacingMeters: string;
  plantsInHalfAcre: number;
  producePerPlantLbs: number;
  storeBuyingPerLb: number;
  revenuePerSeason: number;
  farmerRevenuePerYear: number;
  averageEarningsPerMonth: number;
  farmerShare40Percent: number;
  serviceProviderShare40Percent: number;
  gokTax20Percent: number;
  farmerEarningPerMonth: number;
}

export const CROP_MATRIX: CropMatrixData[] = [
  {
    cropName: 'Lettuce',
    perCapitaConsumptionLbs: 12,
    annualVolMillionMetricTons: 2,
    onePercentMarketShareMetricTons: 18000,
    dailyDemandMetricTons: 49,
    maturityPeriodDays: 70,
    plantSpacingMeters: '0.5X0.5',
    plantsInHalfAcre: 8000,
    producePerPlantLbs: 1,
    storeBuyingPerLb: 1,
    revenuePerSeason: 8000,
    farmerRevenuePerYear: 24000,
    averageEarningsPerMonth: 2000,
    farmerShare40Percent: 9600,
    serviceProviderShare40Percent: 9600,
    gokTax20Percent: 4800,
    farmerEarningPerMonth: 800,
  },
  {
    cropName: 'Tomato',
    perCapitaConsumptionLbs: 31,
    annualVolMillionMetricTons: 5,
    onePercentMarketShareMetricTons: 46500,
    dailyDemandMetricTons: 127,
    maturityPeriodDays: 80,
    plantSpacingMeters: '1X1',
    plantsInHalfAcre: 2000,
    producePerPlantLbs: 5,
    storeBuyingPerLb: 1,
    revenuePerSeason: 10000,
    farmerRevenuePerYear: 30000,
    averageEarningsPerMonth: 2500,
    farmerShare40Percent: 12000,
    serviceProviderShare40Percent: 12000,
    gokTax20Percent: 6000,
    farmerEarningPerMonth: 1000,
  },
  {
    cropName: 'Cucumber',
    perCapitaConsumptionLbs: 12,
    annualVolMillionMetricTons: 2,
    onePercentMarketShareMetricTons: 18000,
    dailyDemandMetricTons: 49,
    maturityPeriodDays: 60,
    plantSpacingMeters: '0.7X0.7',
    plantsInHalfAcre: 4000,
    producePerPlantLbs: 5,
    storeBuyingPerLb: 1,
    revenuePerSeason: 20000,
    farmerRevenuePerYear: 60000,
    averageEarningsPerMonth: 5000,
    farmerShare40Percent: 24000,
    serviceProviderShare40Percent: 24000,
    gokTax20Percent: 12000,
    farmerEarningPerMonth: 2000,
  },
  {
    cropName: 'Capsicum',
    perCapitaConsumptionLbs: 11,
    annualVolMillionMetricTons: 2,
    onePercentMarketShareMetricTons: 16500,
    dailyDemandMetricTons: 45,
    maturityPeriodDays: 70,
    plantSpacingMeters: '0.7X0.7',
    plantsInHalfAcre: 4000,
    producePerPlantLbs: 2.5,
    storeBuyingPerLb: 2,
    revenuePerSeason: 20000,
    farmerRevenuePerYear: 60000,
    averageEarningsPerMonth: 5000,
    farmerShare40Percent: 24000,
    serviceProviderShare40Percent: 24000,
    gokTax20Percent: 12000,
    farmerEarningPerMonth: 2000,
  },
  {
    cropName: 'Cabbage',
    perCapitaConsumptionLbs: 6,
    annualVolMillionMetricTons: 1,
    onePercentMarketShareMetricTons: 9000,
    dailyDemandMetricTons: 25,
    maturityPeriodDays: 90,
    plantSpacingMeters: '0.5X0.5',
    plantsInHalfAcre: 8000,
    producePerPlantLbs: 1.5,
    storeBuyingPerLb: 1,
    revenuePerSeason: 12000,
    farmerRevenuePerYear: 36000,
    averageEarningsPerMonth: 3000,
    farmerShare40Percent: 14400,
    serviceProviderShare40Percent: 14400,
    gokTax20Percent: 7200,
    farmerEarningPerMonth: 1200,
  },
  {
    cropName: 'Broccoli',
    perCapitaConsumptionLbs: 6,
    annualVolMillionMetricTons: 1,
    onePercentMarketShareMetricTons: 9000,
    dailyDemandMetricTons: 25,
    maturityPeriodDays: 75,
    plantSpacingMeters: '0.5X0.5',
    plantsInHalfAcre: 8000,
    producePerPlantLbs: 1,
    storeBuyingPerLb: 2,
    revenuePerSeason: 16000,
    farmerRevenuePerYear: 48000,
    averageEarningsPerMonth: 4000,
    farmerShare40Percent: 19200,
    serviceProviderShare40Percent: 19200,
    gokTax20Percent: 9600,
    farmerEarningPerMonth: 1600,
  },
  {
    cropName: 'Green onion',
    perCapitaConsumptionLbs: 12,
    annualVolMillionMetricTons: 2,
    onePercentMarketShareMetricTons: 18000,
    dailyDemandMetricTons: 49,
    maturityPeriodDays: 50,
    plantSpacingMeters: '0.25X0.25',
    plantsInHalfAcre: 32000,
    producePerPlantLbs: 0.03,
    storeBuyingPerLb: 10,
    revenuePerSeason: 9600,
    farmerRevenuePerYear: 28800,
    averageEarningsPerMonth: 2400,
    farmerShare40Percent: 11520,
    serviceProviderShare40Percent: 11520,
    gokTax20Percent: 5760,
    farmerEarningPerMonth: 960,
  },
  {
    cropName: 'Potato',
    perCapitaConsumptionLbs: 29,
    annualVolMillionMetricTons: 4,
    onePercentMarketShareMetricTons: 43500,
    dailyDemandMetricTons: 119,
    maturityPeriodDays: 90,
    plantSpacingMeters: '0.7X0.7',
    plantsInHalfAcre: 4000,
    producePerPlantLbs: 2.5,
    storeBuyingPerLb: 0.5,
    revenuePerSeason: 5000,
    farmerRevenuePerYear: 15000,
    averageEarningsPerMonth: 1250,
    farmerShare40Percent: 6000,
    serviceProviderShare40Percent: 6000,
    gokTax20Percent: 3000,
    farmerEarningPerMonth: 500,
  },
];

/**
 * Get crop matrix data for a specific crop
 */
export function getCropData(cropName: string): CropMatrixData | undefined {
  return CROP_MATRIX.find(crop => crop.cropName.toLowerCase() === cropName.toLowerCase());
}

/**
 * Calculate projected harvest based on crop type and acreage
 */
export function calculateProjectedHarvest(cropName: string, acreage: number): {
  volumeLbs: number;
  volumeKg: number;
  revenuePerSeason: number;
  farmerEarningPerMonth: number;
} | null {
  const cropData = getCropData(cropName);
  if (!cropData) return null;

  // Calculate for 0.5 acre (half acre) as base unit
  const halfAcreUnits = acreage / 0.5;
  const volumeLbs = cropData.plantsInHalfAcre * cropData.producePerPlantLbs * halfAcreUnits;
  const volumeKg = volumeLbs * 0.453592; // Convert lbs to kg
  const revenuePerSeason = cropData.revenuePerSeason * halfAcreUnits;
  const farmerEarningPerMonth = cropData.farmerEarningPerMonth * halfAcreUnits;

  return {
    volumeLbs,
    volumeKg,
    revenuePerSeason,
    farmerEarningPerMonth,
  };
}
