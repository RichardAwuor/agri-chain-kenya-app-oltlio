import type { FastifyRequest, FastifyReply } from 'fastify';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

const SEED_DATA = [
  // Mombasa County (MSA, 01)
  { countyName: 'Mombasa', countyCode: 'MSA', countyNumber: '01', subCounty: 'Mombasa Sub-County', wardName: 'Changamwe', wardNumber: '01' },
  { countyName: 'Mombasa', countyCode: 'MSA', countyNumber: '01', subCounty: 'Mombasa Sub-County', wardName: 'Jomvu', wardNumber: '02' },
  { countyName: 'Mombasa', countyCode: 'MSA', countyNumber: '01', subCounty: 'Mombasa Sub-County', wardName: 'Kisauni', wardNumber: '03' },
  { countyName: 'Mombasa', countyCode: 'MSA', countyNumber: '01', subCounty: 'Likoni Sub-County', wardName: 'Likoni', wardNumber: '04' },
  { countyName: 'Mombasa', countyCode: 'MSA', countyNumber: '01', subCounty: 'Likoni Sub-County', wardName: 'Mtongwe', wardNumber: '05' },
  { countyName: 'Mombasa', countyCode: 'MSA', countyNumber: '01', subCounty: 'Nyali Sub-County', wardName: 'Nyali', wardNumber: '06' },

  // Kwale County (KWL, 02)
  { countyName: 'Kwale', countyCode: 'KWL', countyNumber: '02', subCounty: 'Mombasa Sub-County', wardName: 'Banda', wardNumber: '01' },
  { countyName: 'Kwale', countyCode: 'KWL', countyNumber: '02', subCounty: 'Mombasa Sub-County', wardName: 'Chaani', wardNumber: '02' },
  { countyName: 'Kwale', countyCode: 'KWL', countyNumber: '02', subCounty: 'Mombasa Sub-County', wardName: 'Diani', wardNumber: '03' },
  { countyName: 'Kwale', countyCode: 'KWL', countyNumber: '02', subCounty: 'Lunga Lunga Sub-County', wardName: 'Lunga Lunga', wardNumber: '04' },

  // Kilifi County (KLF, 03)
  { countyName: 'Kilifi', countyCode: 'KLF', countyNumber: '03', subCounty: 'Kilifi North Sub-County', wardName: 'Malindi', wardNumber: '01' },
  { countyName: 'Kilifi', countyCode: 'KLF', countyNumber: '03', subCounty: 'Kilifi North Sub-County', wardName: 'Magarini', wardNumber: '02' },
  { countyName: 'Kilifi', countyCode: 'KLF', countyNumber: '03', subCounty: 'Kilifi South Sub-County', wardName: 'Mtwapa', wardNumber: '03' },
  { countyName: 'Kilifi', countyCode: 'KLF', countyNumber: '03', subCounty: 'Kilifi South Sub-County', wardName: 'Rabai', wardNumber: '04' },

  // Tana River County (TRV, 04)
  { countyName: 'Tana River', countyCode: 'TRV', countyNumber: '04', subCounty: 'Tana Delta Sub-County', wardName: 'Kipini', wardNumber: '01' },
  { countyName: 'Tana River', countyCode: 'TRV', countyNumber: '04', subCounty: 'Tana Delta Sub-County', wardName: 'Lamu', wardNumber: '02' },
  { countyName: 'Tana River', countyCode: 'TRV', countyNumber: '04', subCounty: 'Tana River Sub-County', wardName: 'Garsen', wardNumber: '03' },

  // Lamu County (LMU, 05)
  { countyName: 'Lamu', countyCode: 'LMU', countyNumber: '05', subCounty: 'Lamu East Sub-County', wardName: 'Faza', wardNumber: '01' },
  { countyName: 'Lamu', countyCode: 'LMU', countyNumber: '05', subCounty: 'Lamu West Sub-County', wardName: 'Lamu', wardNumber: '02' },
  { countyName: 'Lamu', countyCode: 'LMU', countyNumber: '05', subCounty: 'Lamu West Sub-County', wardName: 'Mpeketoni', wardNumber: '03' },

  // Taita/Taveta County (TVT, 06)
  { countyName: 'Taita/Taveta', countyCode: 'TVT', countyNumber: '06', subCounty: 'Taita Sub-County', wardName: 'Mwatate', wardNumber: '01' },
  { countyName: 'Taita/Taveta', countyCode: 'TVT', countyNumber: '06', subCounty: 'Taita Sub-County', wardName: 'Wundanyi', wardNumber: '02' },
  { countyName: 'Taita/Taveta', countyCode: 'TVT', countyNumber: '06', subCounty: 'Taveta Sub-County', wardName: 'Taveta', wardNumber: '03' },

  // Garissa County (GRS, 07)
  { countyName: 'Garissa', countyCode: 'GRS', countyNumber: '07', subCounty: 'Garissa Sub-County', wardName: 'Garissa', wardNumber: '01' },
  { countyName: 'Garissa', countyCode: 'GRS', countyNumber: '07', subCounty: 'Garissa Sub-County', wardName: 'Ijara', wardNumber: '02' },
  { countyName: 'Garissa', countyCode: 'GRS', countyNumber: '07', subCounty: 'Balambala Sub-County', wardName: 'Balambala', wardNumber: '03' },

  // Wajir County (WJR, 08)
  { countyName: 'Wajir', countyCode: 'WJR', countyNumber: '08', subCounty: 'Wajir North Sub-County', wardName: 'Eldas', wardNumber: '01' },
  { countyName: 'Wajir', countyCode: 'WJR', countyNumber: '08', subCounty: 'Wajir North Sub-County', wardName: 'Wajir North', wardNumber: '02' },
  { countyName: 'Wajir', countyCode: 'WJR', countyNumber: '08', subCounty: 'Wajir South Sub-County', wardName: 'Wajir South', wardNumber: '03' },

  // Mandera County (MDR, 09)
  { countyName: 'Mandera', countyCode: 'MDR', countyNumber: '09', subCounty: 'Mandera East Sub-County', wardName: 'Khasim Shuna', wardNumber: '01' },
  { countyName: 'Mandera', countyCode: 'MDR', countyNumber: '09', subCounty: 'Mandera West Sub-County', wardName: 'Mandera West', wardNumber: '02' },
  { countyName: 'Mandera', countyCode: 'MDR', countyNumber: '09', subCounty: 'Mandera Central Sub-County', wardName: 'Mandera Central', wardNumber: '03' },

  // Marsabit County (MST, 10)
  { countyName: 'Marsabit', countyCode: 'MST', countyNumber: '10', subCounty: 'Marsabit Sub-County', wardName: 'Marsabit', wardNumber: '01' },
  { countyName: 'Marsabit', countyCode: 'MST', countyNumber: '10', subCounty: 'Marsabit Sub-County', wardName: 'Moyale', wardNumber: '02' },
  { countyName: 'Marsabit', countyCode: 'MST', countyNumber: '10', subCounty: 'Laisamis Sub-County', wardName: 'Laisamis', wardNumber: '03' },

  // Isiolo County (ISO, 11)
  { countyName: 'Isiolo', countyCode: 'ISO', countyNumber: '11', subCounty: 'Isiolo Sub-County', wardName: 'Isiolo', wardNumber: '01' },
  { countyName: 'Isiolo', countyCode: 'ISO', countyNumber: '11', subCounty: 'Isiolo Sub-County', wardName: 'Karo', wardNumber: '02' },
  { countyName: 'Isiolo', countyCode: 'ISO', countyNumber: '11', subCounty: 'Merti Sub-County', wardName: 'Merti', wardNumber: '03' },

  // Meru County (MRU, 12)
  { countyName: 'Meru', countyCode: 'MRU', countyNumber: '12', subCounty: 'Meru Central Sub-County', wardName: 'Meru', wardNumber: '01' },
  { countyName: 'Meru', countyCode: 'MRU', countyNumber: '12', subCounty: 'Meru Central Sub-County', wardName: 'Mwali', wardNumber: '02' },
  { countyName: 'Meru', countyCode: 'MRU', countyNumber: '12', subCounty: 'Igembe Sub-County', wardName: 'Igembe South', wardNumber: '03' },

  // Tharaka-Nithi County (TKN, 13)
  { countyName: 'Tharaka-Nithi', countyCode: 'TKN', countyNumber: '13', subCounty: 'Tharaka Sub-County', wardName: 'Tharaka', wardNumber: '01' },
  { countyName: 'Tharaka-Nithi', countyCode: 'TKN', countyNumber: '13', subCounty: 'Nithi Sub-County', wardName: 'Nithi', wardNumber: '02' },
  { countyName: 'Tharaka-Nithi', countyCode: 'TKN', countyNumber: '13', subCounty: 'Chuka Sub-County', wardName: 'Chuka', wardNumber: '03' },

  // Embu County (EMB, 14)
  { countyName: 'Embu', countyCode: 'EMB', countyNumber: '14', subCounty: 'Embu Sub-County', wardName: 'Embu', wardNumber: '01' },
  { countyName: 'Embu', countyCode: 'EMB', countyNumber: '14', subCounty: 'Embu Sub-County', wardName: 'Runyenjes', wardNumber: '02' },
  { countyName: 'Embu', countyCode: 'EMB', countyNumber: '14', subCounty: 'Mbeere Sub-County', wardName: 'Mbeere North', wardNumber: '03' },

  // Kitui County (KTI, 15)
  { countyName: 'Kitui', countyCode: 'KTI', countyNumber: '15', subCounty: 'Kitui Central Sub-County', wardName: 'Kitui Central', wardNumber: '01' },
  { countyName: 'Kitui', countyCode: 'KTI', countyNumber: '15', subCounty: 'Kitui East Sub-County', wardName: 'Kitui East', wardNumber: '02' },
  { countyName: 'Kitui', countyCode: 'KTI', countyNumber: '15', subCounty: 'Kitui South Sub-County', wardName: 'Kitui South', wardNumber: '03' },

  // Machakos County (MCK, 16)
  { countyName: 'Machakos', countyCode: 'MCK', countyNumber: '16', subCounty: 'Machakos Sub-County', wardName: 'Machakos', wardNumber: '01' },
  { countyName: 'Machakos', countyCode: 'MCK', countyNumber: '16', subCounty: 'Machakos Sub-County', wardName: 'Athi River', wardNumber: '02' },
  { countyName: 'Machakos', countyCode: 'MCK', countyNumber: '16', subCounty: 'Kangundo Sub-County', wardName: 'Kangundo', wardNumber: '03' },

  // Makueni County (MKN, 17)
  { countyName: 'Makueni', countyCode: 'MKN', countyNumber: '17', subCounty: 'Makueni Sub-County', wardName: 'Makueni', wardNumber: '01' },
  { countyName: 'Makueni', countyCode: 'MKN', countyNumber: '17', subCounty: 'Makueni Sub-County', wardName: 'Makindu', wardNumber: '02' },
  { countyName: 'Makueni', countyCode: 'MKN', countyNumber: '17', subCounty: 'Kibwezi Sub-County', wardName: 'Kibwezi', wardNumber: '03' },

  // Nyandarua County (NRA, 18)
  { countyName: 'Nyandarua', countyCode: 'NRA', countyNumber: '18', subCounty: 'Nyandarua North Sub-County', wardName: 'Kinangop', wardNumber: '01' },
  { countyName: 'Nyandarua', countyCode: 'NRA', countyNumber: '18', subCounty: 'Nyandarua Central Sub-County', wardName: 'Ol Kalou', wardNumber: '02' },
  { countyName: 'Nyandarua', countyCode: 'NRA', countyNumber: '18', subCounty: 'Nyandarua South Sub-County', wardName: 'Ndaragwa', wardNumber: '03' },

  // Nyeri County (NYR, 19)
  { countyName: 'Nyeri', countyCode: 'NYR', countyNumber: '19', subCounty: 'Nyeri North Sub-County', wardName: 'Mathira', wardNumber: '01' },
  { countyName: 'Nyeri', countyCode: 'NYR', countyNumber: '19', subCounty: 'Nyeri South Sub-County', wardName: 'Nyeri', wardNumber: '02' },
  { countyName: 'Nyeri', countyCode: 'NYR', countyNumber: '19', subCounty: 'Nyeri Central Sub-County', wardName: 'Mukurweini', wardNumber: '03' },

  // Kirinyaga County (KRG, 20)
  { countyName: 'Kirinyaga', countyCode: 'KRG', countyNumber: '20', subCounty: 'Kirinyaga Central Sub-County', wardName: 'Kirinyaga Central', wardNumber: '01' },
  { countyName: 'Kirinyaga', countyCode: 'KRG', countyNumber: '20', subCounty: 'Kirinyaga North Sub-County', wardName: 'Kirinyaga North', wardNumber: '02' },
  { countyName: 'Kirinyaga', countyCode: 'KRG', countyNumber: '20', subCounty: 'Kirinyaga South Sub-County', wardName: 'Kirinyaga South', wardNumber: '03' },

  // Murang'a County (MRA, 21)
  { countyName: 'Murang\'a', countyCode: 'MRA', countyNumber: '21', subCounty: 'Murang\'a North Sub-County', wardName: 'Kangema', wardNumber: '01' },
  { countyName: 'Murang\'a', countyCode: 'MRA', countyNumber: '21', subCounty: 'Murang\'a Central Sub-County', wardName: 'Murang\'a', wardNumber: '02' },
  { countyName: 'Murang\'a', countyCode: 'MRA', countyNumber: '21', subCounty: 'Murang\'a South Sub-County', wardName: 'Murang\'a South', wardNumber: '03' },

  // Kiambu County (KBU, 22)
  { countyName: 'Kiambu', countyCode: 'KBU', countyNumber: '22', subCounty: 'Kiambu Sub-County', wardName: 'Kiambu', wardNumber: '01' },
  { countyName: 'Kiambu', countyCode: 'KBU', countyNumber: '22', subCounty: 'Limuru Sub-County', wardName: 'Limuru', wardNumber: '02' },
  { countyName: 'Kiambu', countyCode: 'KBU', countyNumber: '22', subCounty: 'Thika Sub-County', wardName: 'Thika', wardNumber: '03' },

  // Turkana County (TKN, 23)
  { countyName: 'Turkana', countyCode: 'TKN', countyNumber: '23', subCounty: 'Turkana North Sub-County', wardName: 'Turkana North', wardNumber: '01' },
  { countyName: 'Turkana', countyCode: 'TKN', countyNumber: '23', subCounty: 'Turkana Central Sub-County', wardName: 'Turkana Central', wardNumber: '02' },
  { countyName: 'Turkana', countyCode: 'TKN', countyNumber: '23', subCounty: 'Turkana South Sub-County', wardName: 'Turkana South', wardNumber: '03' },

  // West Pokot County (WPT, 24)
  { countyName: 'West Pokot', countyCode: 'WPT', countyNumber: '24', subCounty: 'West Pokot Central Sub-County', wardName: 'West Pokot Central', wardNumber: '01' },
  { countyName: 'West Pokot', countyCode: 'WPT', countyNumber: '24', subCounty: 'West Pokot North Sub-County', wardName: 'West Pokot North', wardNumber: '02' },
  { countyName: 'West Pokot', countyCode: 'WPT', countyNumber: '24', subCounty: 'Sigor Sub-County', wardName: 'Sigor', wardNumber: '03' },

  // Samburu County (SMR, 25)
  { countyName: 'Samburu', countyCode: 'SMR', countyNumber: '25', subCounty: 'Samburu North Sub-County', wardName: 'Samburu North', wardNumber: '01' },
  { countyName: 'Samburu', countyCode: 'SMR', countyNumber: '25', subCounty: 'Samburu South Sub-County', wardName: 'Samburu South', wardNumber: '02' },
  { countyName: 'Samburu', countyCode: 'SMR', countyNumber: '25', subCounty: 'Samburu East Sub-County', wardName: 'Samburu East', wardNumber: '03' },

  // Trans Nzoia County (TNR, 26)
  { countyName: 'Trans Nzoia', countyCode: 'TNR', countyNumber: '26', subCounty: 'Trans Nzoia North Sub-County', wardName: 'Cherangany', wardNumber: '01' },
  { countyName: 'Trans Nzoia', countyCode: 'TNR', countyNumber: '26', subCounty: 'Trans Nzoia South Sub-County', wardName: 'Kiminini', wardNumber: '02' },
  { countyName: 'Trans Nzoia', countyCode: 'TNR', countyNumber: '26', subCounty: 'Kwanza Sub-County', wardName: 'Kwanza', wardNumber: '03' },

  // Uasin Gishu County (UGU, 27)
  { countyName: 'Uasin Gishu', countyCode: 'UGU', countyNumber: '27', subCounty: 'Uasin Gishu North Sub-County', wardName: 'Turbo', wardNumber: '01' },
  { countyName: 'Uasin Gishu', countyCode: 'UGU', countyNumber: '27', subCounty: 'Uasin Gishu South Sub-County', wardName: 'Kapseret', wardNumber: '02' },
  { countyName: 'Uasin Gishu', countyCode: 'UGU', countyNumber: '27', subCounty: 'Eldoret Sub-County', wardName: 'Eldoret', wardNumber: '03' },

  // Elgeyo/Marakwet County (ELM, 28)
  { countyName: 'Elgeyo/Marakwet', countyCode: 'ELM', countyNumber: '28', subCounty: 'Elgeyo Sub-County', wardName: 'Elgeyo', wardNumber: '01' },
  { countyName: 'Elgeyo/Marakwet', countyCode: 'ELM', countyNumber: '28', subCounty: 'Marakwet Sub-County', wardName: 'Marakwet East', wardNumber: '02' },
  { countyName: 'Elgeyo/Marakwet', countyCode: 'ELM', countyNumber: '28', subCounty: 'Keiyo Sub-County', wardName: 'Keiyo North', wardNumber: '03' },

  // Nandi County (NDI, 29)
  { countyName: 'Nandi', countyCode: 'NDI', countyNumber: '29', subCounty: 'Nandi North Sub-County', wardName: 'Nandi North', wardNumber: '01' },
  { countyName: 'Nandi', countyCode: 'NDI', countyNumber: '29', subCounty: 'Nandi Central Sub-County', wardName: 'Nandi Central', wardNumber: '02' },
  { countyName: 'Nandi', countyCode: 'NDI', countyNumber: '29', subCounty: 'Nandi South Sub-County', wardName: 'Nandi South', wardNumber: '03' },

  // Baringo County (BRO, 30)
  { countyName: 'Baringo', countyCode: 'BRO', countyNumber: '30', subCounty: 'Baringo North Sub-County', wardName: 'Baringo North', wardNumber: '01' },
  { countyName: 'Baringo', countyCode: 'BRO', countyNumber: '30', subCounty: 'Baringo Central Sub-County', wardName: 'Baringo Central', wardNumber: '02' },
  { countyName: 'Baringo', countyCode: 'BRO', countyNumber: '30', subCounty: 'Baringo South Sub-County', wardName: 'Baringo South', wardNumber: '03' },

  // Laikipia County (LKP, 31)
  { countyName: 'Laikipia', countyCode: 'LKP', countyNumber: '31', subCounty: 'Laikipia East Sub-County', wardName: 'Laikipia East', wardNumber: '01' },
  { countyName: 'Laikipia', countyCode: 'LKP', countyNumber: '31', subCounty: 'Laikipia West Sub-County', wardName: 'Laikipia West', wardNumber: '02' },
  { countyName: 'Laikipia', countyCode: 'LKP', countyNumber: '31', subCounty: 'Laikipia North Sub-County', wardName: 'Laikipia North', wardNumber: '03' },

  // Nakuru County (NRU, 32) - renamed from NKU
  { countyName: 'Nakuru', countyCode: 'NRU', countyNumber: '32', subCounty: 'Nakuru Town Sub-County', wardName: 'Barut', wardNumber: '01' },
  { countyName: 'Nakuru', countyCode: 'NRU', countyNumber: '32', subCounty: 'Nakuru Town Sub-County', wardName: 'Langas', wardNumber: '02' },
  { countyName: 'Nakuru', countyCode: 'NRU', countyNumber: '32', subCounty: 'Kuresoi North Sub-County', wardName: 'Kilibwoni', wardNumber: '03' },

  // Narok County (NRK, 33)
  { countyName: 'Narok', countyCode: 'NRK', countyNumber: '33', subCounty: 'Narok North Sub-County', wardName: 'Narok North', wardNumber: '01' },
  { countyName: 'Narok', countyCode: 'NRK', countyNumber: '33', subCounty: 'Narok South Sub-County', wardName: 'Narok South', wardNumber: '02' },
  { countyName: 'Narok', countyCode: 'NRK', countyNumber: '33', subCounty: 'Narok East Sub-County', wardName: 'Narok East', wardNumber: '03' },

  // Kajiado County (KJO, 34)
  { countyName: 'Kajiado', countyCode: 'KJO', countyNumber: '34', subCounty: 'Kajiado North Sub-County', wardName: 'Kajiado North', wardNumber: '01' },
  { countyName: 'Kajiado', countyCode: 'KJO', countyNumber: '34', subCounty: 'Kajiado Central Sub-County', wardName: 'Kajiado Central', wardNumber: '02' },
  { countyName: 'Kajiado', countyCode: 'KJO', countyNumber: '34', subCounty: 'Kajiado South Sub-County', wardName: 'Kajiado South', wardNumber: '03' },

  // Kericho County (KRC, 35)
  { countyName: 'Kericho', countyCode: 'KRC', countyNumber: '35', subCounty: 'Kericho Sub-County', wardName: 'Kericho', wardNumber: '01' },
  { countyName: 'Kericho', countyCode: 'KRC', countyNumber: '35', subCounty: 'Kisii Sub-County', wardName: 'Sigowet', wardNumber: '02' },
  { countyName: 'Kericho', countyCode: 'KRC', countyNumber: '35', subCounty: 'Kipchoge Sub-County', wardName: 'Kipchoge', wardNumber: '03' },

  // Bomet County (BOM, 36)
  { countyName: 'Bomet', countyCode: 'BOM', countyNumber: '36', subCounty: 'Bomet Central Sub-County', wardName: 'Bomet Central', wardNumber: '01' },
  { countyName: 'Bomet', countyCode: 'BOM', countyNumber: '36', subCounty: 'Bomet East Sub-County', wardName: 'Bomet East', wardNumber: '02' },
  { countyName: 'Bomet', countyCode: 'BOM', countyNumber: '36', subCounty: 'Sotik Sub-County', wardName: 'Sotik', wardNumber: '03' },

  // Kakamega County (KKG, 37)
  { countyName: 'Kakamega', countyCode: 'KKG', countyNumber: '37', subCounty: 'Kakamega North Sub-County', wardName: 'Kakamega North', wardNumber: '01' },
  { countyName: 'Kakamega', countyCode: 'KKG', countyNumber: '37', subCounty: 'Kakamega Central Sub-County', wardName: 'Kakamega', wardNumber: '02' },
  { countyName: 'Kakamega', countyCode: 'KKG', countyNumber: '37', subCounty: 'Kakamega South Sub-County', wardName: 'Kakamega South', wardNumber: '03' },

  // Vihiga County (VHG, 38)
  { countyName: 'Vihiga', countyCode: 'VHG', countyNumber: '38', subCounty: 'Vihiga Sub-County', wardName: 'Vihiga', wardNumber: '01' },
  { countyName: 'Vihiga', countyCode: 'VHG', countyNumber: '38', subCounty: 'Hamisi Sub-County', wardName: 'Hamisi', wardNumber: '02' },
  { countyName: 'Vihiga', countyCode: 'VHG', countyNumber: '38', subCounty: 'Saboti Sub-County', wardName: 'Saboti', wardNumber: '03' },

  // Bungoma County (BGA, 39)
  { countyName: 'Bungoma', countyCode: 'BGA', countyNumber: '39', subCounty: 'Bungoma North Sub-County', wardName: 'Bungoma North', wardNumber: '01' },
  { countyName: 'Bungoma', countyCode: 'BGA', countyNumber: '39', subCounty: 'Bungoma Central Sub-County', wardName: 'Bungoma Central', wardNumber: '02' },
  { countyName: 'Bungoma', countyCode: 'BGA', countyNumber: '39', subCounty: 'Bungoma South Sub-County', wardName: 'Bungoma South', wardNumber: '03' },

  // Busia County (BSA, 40)
  { countyName: 'Busia', countyCode: 'BSA', countyNumber: '40', subCounty: 'Busia North Sub-County', wardName: 'Busia North', wardNumber: '01' },
  { countyName: 'Busia', countyCode: 'BSA', countyNumber: '40', subCounty: 'Busia Central Sub-County', wardName: 'Busia Central', wardNumber: '02' },
  { countyName: 'Busia', countyCode: 'BSA', countyNumber: '40', subCounty: 'Busia South Sub-County', wardName: 'Busia South', wardNumber: '03' },

  // Siaya County (SYA, 41)
  { countyName: 'Siaya', countyCode: 'SYA', countyNumber: '41', subCounty: 'Siaya North Sub-County', wardName: 'Siaya North', wardNumber: '01' },
  { countyName: 'Siaya', countyCode: 'SYA', countyNumber: '41', subCounty: 'Siaya Central Sub-County', wardName: 'Siaya Central', wardNumber: '02' },
  { countyName: 'Siaya', countyCode: 'SYA', countyNumber: '41', subCounty: 'Siaya South Sub-County', wardName: 'Siaya South', wardNumber: '03' },

  // Kisumu County (KSM, 42)
  { countyName: 'Kisumu', countyCode: 'KSM', countyNumber: '42', subCounty: 'Kisumu North Sub-County', wardName: 'Kisumu North', wardNumber: '01' },
  { countyName: 'Kisumu', countyCode: 'KSM', countyNumber: '42', subCounty: 'Kisumu Central Sub-County', wardName: 'Kisumu Central', wardNumber: '02' },
  { countyName: 'Kisumu', countyCode: 'KSM', countyNumber: '42', subCounty: 'Kisumu South Sub-County', wardName: 'Kisumu South', wardNumber: '03' },

  // Homa Bay County (HBY, 43)
  { countyName: 'Homa Bay', countyCode: 'HBY', countyNumber: '43', subCounty: 'Homa Bay North Sub-County', wardName: 'Homa Bay North', wardNumber: '01' },
  { countyName: 'Homa Bay', countyCode: 'HBY', countyNumber: '43', subCounty: 'Homa Bay Central Sub-County', wardName: 'Homa Bay Central', wardNumber: '02' },
  { countyName: 'Homa Bay', countyCode: 'HBY', countyNumber: '43', subCounty: 'Homa Bay South Sub-County', wardName: 'Homa Bay South', wardNumber: '03' },

  // Migori County (MGR, 44)
  { countyName: 'Migori', countyCode: 'MGR', countyNumber: '44', subCounty: 'Migori North Sub-County', wardName: 'Migori North', wardNumber: '01' },
  { countyName: 'Migori', countyCode: 'MGR', countyNumber: '44', subCounty: 'Migori Central Sub-County', wardName: 'Migori Central', wardNumber: '02' },
  { countyName: 'Migori', countyCode: 'MGR', countyNumber: '44', subCounty: 'Migori South Sub-County', wardName: 'Migori South', wardNumber: '03' },

  // Kisii County (KSI, 45)
  { countyName: 'Kisii', countyCode: 'KSI', countyNumber: '45', subCounty: 'Kisii North Sub-County', wardName: 'Kisii North', wardNumber: '01' },
  { countyName: 'Kisii', countyCode: 'KSI', countyNumber: '45', subCounty: 'Kisii Central Sub-County', wardName: 'Kisii Central', wardNumber: '02' },
  { countyName: 'Kisii', countyCode: 'KSI', countyNumber: '45', subCounty: 'Kisii South Sub-County', wardName: 'Kisii South', wardNumber: '03' },

  // Nyamira County (NYM, 46)
  { countyName: 'Nyamira', countyCode: 'NYM', countyNumber: '46', subCounty: 'Nyamira North Sub-County', wardName: 'Nyamira North', wardNumber: '01' },
  { countyName: 'Nyamira', countyCode: 'NYM', countyNumber: '46', subCounty: 'Nyamira Central Sub-County', wardName: 'Nyamira Central', wardNumber: '02' },
  { countyName: 'Nyamira', countyCode: 'NYM', countyNumber: '46', subCounty: 'Nyamira South Sub-County', wardName: 'Nyamira South', wardNumber: '03' },

  // Nairobi City County (NBI, 47)
  { countyName: 'Nairobi', countyCode: 'NBI', countyNumber: '47', subCounty: 'Westlands Sub-County', wardName: 'Karura', wardNumber: '01' },
  { countyName: 'Nairobi', countyCode: 'NBI', countyNumber: '47', subCounty: 'Westlands Sub-County', wardName: 'Kitisuru', wardNumber: '02' },
  { countyName: 'Nairobi', countyCode: 'NBI', countyNumber: '47', subCounty: 'Makadara Sub-County', wardName: 'Makadara', wardNumber: '03' },
  { countyName: 'Nairobi', countyCode: 'NBI', countyNumber: '47', subCounty: 'Dagoretti Sub-County', wardName: 'Dagoretti', wardNumber: '04' },
];

export function registerSeedRoutes(app: App) {
  app.fastify.post('/api/seed/locations', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Seeding kenya_locations table');

    try {
      // Check if data already exists
      const existingCount = await app.db.query.kenyaLocations.findMany({
        limit: 1,
      });

      if (existingCount.length > 0) {
        app.logger.info({}, 'Kenya locations already seeded, skipping');
        return { message: 'Kenya locations already seeded' };
      }

      // Insert seed data
      await app.db.insert(schema.kenyaLocations).values(SEED_DATA);

      app.logger.info({ count: SEED_DATA.length }, 'Kenya locations seeded successfully');
      return { message: 'Kenya locations seeded successfully', count: SEED_DATA.length };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to seed kenya_locations');
      throw error;
    }
  });
}
