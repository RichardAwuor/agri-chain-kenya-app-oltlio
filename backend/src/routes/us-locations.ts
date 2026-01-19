import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

const US_STATES_DATA = [
  { stateName: 'Alabama', stateCode: 'AL' },
  { stateName: 'Alaska', stateCode: 'AK' },
  { stateName: 'Arizona', stateCode: 'AZ' },
  { stateName: 'Arkansas', stateCode: 'AR' },
  { stateName: 'California', stateCode: 'CA' },
  { stateName: 'Colorado', stateCode: 'CO' },
  { stateName: 'Connecticut', stateCode: 'CT' },
  { stateName: 'Delaware', stateCode: 'DE' },
  { stateName: 'Florida', stateCode: 'FL' },
  { stateName: 'Georgia', stateCode: 'GA' },
  { stateName: 'Hawaii', stateCode: 'HI' },
  { stateName: 'Idaho', stateCode: 'ID' },
  { stateName: 'Illinois', stateCode: 'IL' },
  { stateName: 'Indiana', stateCode: 'IN' },
  { stateName: 'Iowa', stateCode: 'IA' },
  { stateName: 'Kansas', stateCode: 'KS' },
  { stateName: 'Kentucky', stateCode: 'KY' },
  { stateName: 'Louisiana', stateCode: 'LA' },
  { stateName: 'Maine', stateCode: 'ME' },
  { stateName: 'Maryland', stateCode: 'MD' },
  { stateName: 'Massachusetts', stateCode: 'MA' },
  { stateName: 'Michigan', stateCode: 'MI' },
  { stateName: 'Minnesota', stateCode: 'MN' },
  { stateName: 'Mississippi', stateCode: 'MS' },
  { stateName: 'Missouri', stateCode: 'MO' },
  { stateName: 'Montana', stateCode: 'MT' },
  { stateName: 'Nebraska', stateCode: 'NE' },
  { stateName: 'Nevada', stateCode: 'NV' },
  { stateName: 'New Hampshire', stateCode: 'NH' },
  { stateName: 'New Jersey', stateCode: 'NJ' },
  { stateName: 'New Mexico', stateCode: 'NM' },
  { stateName: 'New York', stateCode: 'NY' },
  { stateName: 'North Carolina', stateCode: 'NC' },
  { stateName: 'North Dakota', stateCode: 'ND' },
  { stateName: 'Ohio', stateCode: 'OH' },
  { stateName: 'Oklahoma', stateCode: 'OK' },
  { stateName: 'Oregon', stateCode: 'OR' },
  { stateName: 'Pennsylvania', stateCode: 'PA' },
  { stateName: 'Rhode Island', stateCode: 'RI' },
  { stateName: 'South Carolina', stateCode: 'SC' },
  { stateName: 'South Dakota', stateCode: 'SD' },
  { stateName: 'Tennessee', stateCode: 'TN' },
  { stateName: 'Texas', stateCode: 'TX' },
  { stateName: 'Utah', stateCode: 'UT' },
  { stateName: 'Vermont', stateCode: 'VT' },
  { stateName: 'Virginia', stateCode: 'VA' },
  { stateName: 'Washington', stateCode: 'WA' },
  { stateName: 'West Virginia', stateCode: 'WV' },
  { stateName: 'Wisconsin', stateCode: 'WI' },
  { stateName: 'Wyoming', stateCode: 'WY' },
];

const US_CITIES_DATA = [
  // California
  { stateCode: 'CA', cityName: 'Los Angeles' },
  { stateCode: 'CA', cityName: 'San Francisco' },
  { stateCode: 'CA', cityName: 'San Diego' },
  { stateCode: 'CA', cityName: 'Sacramento' },
  { stateCode: 'CA', cityName: 'Long Beach' },
  { stateCode: 'CA', cityName: 'Oakland' },
  { stateCode: 'CA', cityName: 'Fresno' },
  { stateCode: 'CA', cityName: 'San Jose' },
  { stateCode: 'CA', cityName: 'Santa Ana' },
  { stateCode: 'CA', cityName: 'Anaheim' },
  // Texas
  { stateCode: 'TX', cityName: 'Houston' },
  { stateCode: 'TX', cityName: 'Dallas' },
  { stateCode: 'TX', cityName: 'Austin' },
  { stateCode: 'TX', cityName: 'San Antonio' },
  { stateCode: 'TX', cityName: 'Fort Worth' },
  { stateCode: 'TX', cityName: 'El Paso' },
  { stateCode: 'TX', cityName: 'Arlington' },
  { stateCode: 'TX', cityName: 'Corpus Christi' },
  { stateCode: 'TX', cityName: 'Plano' },
  { stateCode: 'TX', cityName: 'Garland' },
  // Florida
  { stateCode: 'FL', cityName: 'Jacksonville' },
  { stateCode: 'FL', cityName: 'Miami' },
  { stateCode: 'FL', cityName: 'Tampa' },
  { stateCode: 'FL', cityName: 'Orlando' },
  { stateCode: 'FL', cityName: 'St. Petersburg' },
  { stateCode: 'FL', cityName: 'Hialeah' },
  { stateCode: 'FL', cityName: 'Tallahassee' },
  { stateCode: 'FL', cityName: 'Fort Lauderdale' },
  { stateCode: 'FL', cityName: 'West Palm Beach' },
  { stateCode: 'FL', cityName: 'Daytona Beach' },
  // New York
  { stateCode: 'NY', cityName: 'New York City' },
  { stateCode: 'NY', cityName: 'Buffalo' },
  { stateCode: 'NY', cityName: 'Rochester' },
  { stateCode: 'NY', cityName: 'Yonkers' },
  { stateCode: 'NY', cityName: 'Syracuse' },
  { stateCode: 'NY', cityName: 'Albany' },
  { stateCode: 'NY', cityName: 'New Rochelle' },
  { stateCode: 'NY', cityName: 'Utica' },
  { stateCode: 'NY', cityName: 'Troy' },
  { stateCode: 'NY', cityName: 'White Plains' },
  // Illinois
  { stateCode: 'IL', cityName: 'Chicago' },
  { stateCode: 'IL', cityName: 'Aurora' },
  { stateCode: 'IL', cityName: 'Rockford' },
  { stateCode: 'IL', cityName: 'Joliet' },
  { stateCode: 'IL', cityName: 'Naperville' },
  { stateCode: 'IL', cityName: 'Springfield' },
  { stateCode: 'IL', cityName: 'Peoria' },
  { stateCode: 'IL', cityName: 'Elgin' },
  { stateCode: 'IL', cityName: 'Waukegan' },
  { stateCode: 'IL', cityName: 'Champaign' },
  // Pennsylvania
  { stateCode: 'PA', cityName: 'Philadelphia' },
  { stateCode: 'PA', cityName: 'Pittsburgh' },
  { stateCode: 'PA', cityName: 'Allentown' },
  { stateCode: 'PA', cityName: 'Erie' },
  { stateCode: 'PA', cityName: 'Reading' },
  { stateCode: 'PA', cityName: 'Scranton' },
  { stateCode: 'PA', cityName: 'Bethlehem' },
  { stateCode: 'PA', cityName: 'Lancaster' },
  { stateCode: 'PA', cityName: 'Harrisburg' },
  { stateCode: 'PA', cityName: 'Altoona' },
  // Ohio
  { stateCode: 'OH', cityName: 'Columbus' },
  { stateCode: 'OH', cityName: 'Cleveland' },
  { stateCode: 'OH', cityName: 'Cincinnati' },
  { stateCode: 'OH', cityName: 'Toledo' },
  { stateCode: 'OH', cityName: 'Akron' },
  { stateCode: 'OH', cityName: 'Dayton' },
  { stateCode: 'OH', cityName: 'Canton' },
  { stateCode: 'OH', cityName: 'Youngstown' },
  { stateCode: 'OH', cityName: 'Parma' },
  { stateCode: 'OH', cityName: 'Warren' },
  // Michigan
  { stateCode: 'MI', cityName: 'Detroit' },
  { stateCode: 'MI', cityName: 'Grand Rapids' },
  { stateCode: 'MI', cityName: 'Warren' },
  { stateCode: 'MI', cityName: 'Sterling Heights' },
  { stateCode: 'MI', cityName: 'Ann Arbor' },
  { stateCode: 'MI', cityName: 'Lansing' },
  { stateCode: 'MI', cityName: 'Flint' },
  { stateCode: 'MI', cityName: 'Dearborn' },
  { stateCode: 'MI', cityName: 'Livonia' },
  { stateCode: 'MI', cityName: 'Farmington Hills' },
  // Georgia
  { stateCode: 'GA', cityName: 'Atlanta' },
  { stateCode: 'GA', cityName: 'Augusta' },
  { stateCode: 'GA', cityName: 'Columbus' },
  { stateCode: 'GA', cityName: 'Savannah' },
  { stateCode: 'GA', cityName: 'Athens' },
  { stateCode: 'GA', cityName: 'Macon' },
  { stateCode: 'GA', cityName: 'Albany' },
  { stateCode: 'GA', cityName: 'Marietta' },
  { stateCode: 'GA', cityName: 'Roswell' },
  { stateCode: 'GA', cityName: 'Johns Creek' },
  // North Carolina
  { stateCode: 'NC', cityName: 'Charlotte' },
  { stateCode: 'NC', cityName: 'Raleigh' },
  { stateCode: 'NC', cityName: 'Greensboro' },
  { stateCode: 'NC', cityName: 'Durham' },
  { stateCode: 'NC', cityName: 'Winston-Salem' },
  { stateCode: 'NC', cityName: 'Fayetteville' },
  { stateCode: 'NC', cityName: 'High Point' },
  { stateCode: 'NC', cityName: 'Cary' },
  { stateCode: 'NC', cityName: 'Wilmington' },
  { stateCode: 'NC', cityName: 'Asheboro' },
  // Arizona
  { stateCode: 'AZ', cityName: 'Phoenix' },
  { stateCode: 'AZ', cityName: 'Mesa' },
  { stateCode: 'AZ', cityName: 'Chandler' },
  { stateCode: 'AZ', cityName: 'Scottsdale' },
  { stateCode: 'AZ', cityName: 'Tempe' },
  { stateCode: 'AZ', cityName: 'Glendale' },
  { stateCode: 'AZ', cityName: 'Gilbert' },
  { stateCode: 'AZ', cityName: 'Peoria' },
  { stateCode: 'AZ', cityName: 'Surprise' },
  { stateCode: 'AZ', cityName: 'Tucson' },
  // Washington
  { stateCode: 'WA', cityName: 'Seattle' },
  { stateCode: 'WA', cityName: 'Spokane' },
  { stateCode: 'WA', cityName: 'Tacoma' },
  { stateCode: 'WA', cityName: 'Bellevue' },
  { stateCode: 'WA', cityName: 'Kent' },
  { stateCode: 'WA', cityName: 'Everett' },
  { stateCode: 'WA', cityName: 'Renton' },
  { stateCode: 'WA', cityName: 'Kirkland' },
  { stateCode: 'WA', cityName: 'Sammamish' },
  { stateCode: 'WA', cityName: 'Redmond' },
  // Colorado
  { stateCode: 'CO', cityName: 'Denver' },
  { stateCode: 'CO', cityName: 'Colorado Springs' },
  { stateCode: 'CO', cityName: 'Aurora' },
  { stateCode: 'CO', cityName: 'Fort Collins' },
  { stateCode: 'CO', cityName: 'Lakewood' },
  { stateCode: 'CO', cityName: 'Thornton' },
  { stateCode: 'CO', cityName: 'Arvada' },
  { stateCode: 'CO', cityName: 'Westminster' },
  { stateCode: 'CO', cityName: 'Boulder' },
  { stateCode: 'CO', cityName: 'Pueblo' },
  // Massachusetts
  { stateCode: 'MA', cityName: 'Boston' },
  { stateCode: 'MA', cityName: 'Worcester' },
  { stateCode: 'MA', cityName: 'Springfield' },
  { stateCode: 'MA', cityName: 'Lowell' },
  { stateCode: 'MA', cityName: 'Cambridge' },
  { stateCode: 'MA', cityName: 'New Bedford' },
  { stateCode: 'MA', cityName: 'Brockton' },
  { stateCode: 'MA', cityName: 'Quincy' },
  { stateCode: 'MA', cityName: 'Lynn' },
  { stateCode: 'MA', cityName: 'Framingham' },
  // Tennessee
  { stateCode: 'TN', cityName: 'Memphis' },
  { stateCode: 'TN', cityName: 'Nashville' },
  { stateCode: 'TN', cityName: 'Knoxville' },
  { stateCode: 'TN', cityName: 'Chattanooga' },
  { stateCode: 'TN', cityName: 'Clarksville' },
  { stateCode: 'TN', cityName: 'Murfreesboro' },
  { stateCode: 'TN', cityName: 'Franklin' },
  { stateCode: 'TN', cityName: 'Jackson' },
  { stateCode: 'TN', cityName: 'Kingsport' },
  { stateCode: 'TN', cityName: 'Johnson City' },
  // Missouri
  { stateCode: 'MO', cityName: 'Kansas City' },
  { stateCode: 'MO', cityName: 'Saint Louis' },
  { stateCode: 'MO', cityName: 'Springfield' },
  { stateCode: 'MO', cityName: 'Independence' },
  { stateCode: 'MO', cityName: 'Columbia' },
  { stateCode: 'MO', cityName: 'Lee\'s Summit' },
  { stateCode: 'MO', cityName: 'O\'Fallon' },
  { stateCode: 'MO', cityName: 'Joplin' },
  { stateCode: 'MO', cityName: 'St. Joseph' },
  { stateCode: 'MO', cityName: 'Branson' },
];

const US_ZIP_CODES_DATA = [
  // California - Los Angeles
  { cityName: 'Los Angeles', stateCode: 'CA', zipCode: '90001' },
  { cityName: 'Los Angeles', stateCode: 'CA', zipCode: '90002' },
  { cityName: 'Los Angeles', stateCode: 'CA', zipCode: '90003' },
  { cityName: 'Los Angeles', stateCode: 'CA', zipCode: '90004' },
  { cityName: 'Los Angeles', stateCode: 'CA', zipCode: '90005' },
  { cityName: 'Los Angeles', stateCode: 'CA', zipCode: '90210' },
  { cityName: 'Los Angeles', stateCode: 'CA', zipCode: '90211' },
  { cityName: 'Los Angeles', stateCode: 'CA', zipCode: '90212' },
  // California - San Francisco
  { cityName: 'San Francisco', stateCode: 'CA', zipCode: '94101' },
  { cityName: 'San Francisco', stateCode: 'CA', zipCode: '94102' },
  { cityName: 'San Francisco', stateCode: 'CA', zipCode: '94103' },
  { cityName: 'San Francisco', stateCode: 'CA', zipCode: '94104' },
  { cityName: 'San Francisco', stateCode: 'CA', zipCode: '94105' },
  // Texas - Houston
  { cityName: 'Houston', stateCode: 'TX', zipCode: '77001' },
  { cityName: 'Houston', stateCode: 'TX', zipCode: '77002' },
  { cityName: 'Houston', stateCode: 'TX', zipCode: '77003' },
  { cityName: 'Houston', stateCode: 'TX', zipCode: '77004' },
  { cityName: 'Houston', stateCode: 'TX', zipCode: '77005' },
  // Texas - Dallas
  { cityName: 'Dallas', stateCode: 'TX', zipCode: '75201' },
  { cityName: 'Dallas', stateCode: 'TX', zipCode: '75202' },
  { cityName: 'Dallas', stateCode: 'TX', zipCode: '75203' },
  { cityName: 'Dallas', stateCode: 'TX', zipCode: '75204' },
  { cityName: 'Dallas', stateCode: 'TX', zipCode: '75205' },
  // Florida - Miami
  { cityName: 'Miami', stateCode: 'FL', zipCode: '33101' },
  { cityName: 'Miami', stateCode: 'FL', zipCode: '33102' },
  { cityName: 'Miami', stateCode: 'FL', zipCode: '33103' },
  { cityName: 'Miami', stateCode: 'FL', zipCode: '33104' },
  { cityName: 'Miami', stateCode: 'FL', zipCode: '33105' },
  // Florida - Jacksonville
  { cityName: 'Jacksonville', stateCode: 'FL', zipCode: '32099' },
  { cityName: 'Jacksonville', stateCode: 'FL', zipCode: '32202' },
  { cityName: 'Jacksonville', stateCode: 'FL', zipCode: '32203' },
  { cityName: 'Jacksonville', stateCode: 'FL', zipCode: '32204' },
  { cityName: 'Jacksonville', stateCode: 'FL', zipCode: '32205' },
  // New York - NYC
  { cityName: 'New York City', stateCode: 'NY', zipCode: '10001' },
  { cityName: 'New York City', stateCode: 'NY', zipCode: '10002' },
  { cityName: 'New York City', stateCode: 'NY', zipCode: '10003' },
  { cityName: 'New York City', stateCode: 'NY', zipCode: '10004' },
  { cityName: 'New York City', stateCode: 'NY', zipCode: '10005' },
  // Illinois - Chicago
  { cityName: 'Chicago', stateCode: 'IL', zipCode: '60601' },
  { cityName: 'Chicago', stateCode: 'IL', zipCode: '60602' },
  { cityName: 'Chicago', stateCode: 'IL', zipCode: '60603' },
  { cityName: 'Chicago', stateCode: 'IL', zipCode: '60604' },
  { cityName: 'Chicago', stateCode: 'IL', zipCode: '60605' },
  // Pennsylvania - Philadelphia
  { cityName: 'Philadelphia', stateCode: 'PA', zipCode: '19101' },
  { cityName: 'Philadelphia', stateCode: 'PA', zipCode: '19102' },
  { cityName: 'Philadelphia', stateCode: 'PA', zipCode: '19103' },
  { cityName: 'Philadelphia', stateCode: 'PA', zipCode: '19104' },
  { cityName: 'Philadelphia', stateCode: 'PA', zipCode: '19105' },
  // Ohio - Columbus
  { cityName: 'Columbus', stateCode: 'OH', zipCode: '43085' },
  { cityName: 'Columbus', stateCode: 'OH', zipCode: '43201' },
  { cityName: 'Columbus', stateCode: 'OH', zipCode: '43202' },
  { cityName: 'Columbus', stateCode: 'OH', zipCode: '43203' },
  { cityName: 'Columbus', stateCode: 'OH', zipCode: '43204' },
  // Georgia - Atlanta
  { cityName: 'Atlanta', stateCode: 'GA', zipCode: '30303' },
  { cityName: 'Atlanta', stateCode: 'GA', zipCode: '30304' },
  { cityName: 'Atlanta', stateCode: 'GA', zipCode: '30305' },
  { cityName: 'Atlanta', stateCode: 'GA', zipCode: '30306' },
  { cityName: 'Atlanta', stateCode: 'GA', zipCode: '30307' },
];

const US_AIRPORTS_DATA = [
  // Major US Airports
  { airportName: 'Hartsfield-Jackson Atlanta International Airport', airportCode: 'ATL', city: 'Atlanta', stateCode: 'GA' },
  { airportName: 'Los Angeles International Airport', airportCode: 'LAX', city: 'Los Angeles', stateCode: 'CA' },
  { airportName: 'Chicago O\'Hare International Airport', airportCode: 'ORD', city: 'Chicago', stateCode: 'IL' },
  { airportName: 'Dallas/Fort Worth International Airport', airportCode: 'DFW', city: 'Dallas', stateCode: 'TX' },
  { airportName: 'Denver International Airport', airportCode: 'DEN', city: 'Denver', stateCode: 'CO' },
  { airportName: 'John F. Kennedy International Airport', airportCode: 'JFK', city: 'New York', stateCode: 'NY' },
  { airportName: 'San Francisco International Airport', airportCode: 'SFO', city: 'San Francisco', stateCode: 'CA' },
  { airportName: 'Seattle-Tacoma International Airport', airportCode: 'SEA', city: 'Seattle', stateCode: 'WA' },
  { airportName: 'Miami International Airport', airportCode: 'MIA', city: 'Miami', stateCode: 'FL' },
  { airportName: 'Boston Logan International Airport', airportCode: 'BOS', city: 'Boston', stateCode: 'MA' },
  { airportName: 'Newark Liberty International Airport', airportCode: 'EWR', city: 'Newark', stateCode: 'NJ' },
  { airportName: 'Phoenix Sky Harbor International Airport', airportCode: 'PHX', city: 'Phoenix', stateCode: 'AZ' },
  { airportName: 'Hartsfield-Jackson Atlanta International Airport', airportCode: 'ATL', city: 'Atlanta', stateCode: 'GA' },
  { airportName: 'Minneapolis-Saint Paul International Airport', airportCode: 'MSP', city: 'Minneapolis', stateCode: 'MN' },
  { airportName: 'Detroit Metropolitan Wayne County Airport', airportCode: 'DTW', city: 'Detroit', stateCode: 'MI' },
  { airportName: 'Philadelphia International Airport', airportCode: 'PHL', city: 'Philadelphia', stateCode: 'PA' },
  { airportName: 'Las Vegas Harry Reid International Airport', airportCode: 'LAS', city: 'Las Vegas', stateCode: 'NV' },
  { airportName: 'Houston George Bush Intercontinental Airport', airportCode: 'IAH', city: 'Houston', stateCode: 'TX' },
  { airportName: 'Orlando International Airport', airportCode: 'MCO', city: 'Orlando', stateCode: 'FL' },
  { airportName: 'Memphis International Airport', airportCode: 'MEM', city: 'Memphis', stateCode: 'TN' },
  { airportName: 'Kansas City International Airport', airportCode: 'MCI', city: 'Kansas City', stateCode: 'MO' },
  { airportName: 'Austin-Bergstrom International Airport', airportCode: 'AUS', city: 'Austin', stateCode: 'TX' },
  { airportName: 'Portland International Airport', airportCode: 'PDX', city: 'Portland', stateCode: 'OR' },
  { airportName: 'Salt Lake City International Airport', airportCode: 'SLC', city: 'Salt Lake City', stateCode: 'UT' },
  { airportName: 'New Orleans Louis Armstrong International Airport', airportCode: 'MSY', city: 'New Orleans', stateCode: 'LA' },
  { airportName: 'San Diego International Airport', airportCode: 'SAN', city: 'San Diego', stateCode: 'CA' },
  { airportName: 'Tampa International Airport', airportCode: 'TPA', city: 'Tampa', stateCode: 'FL' },
  { airportName: 'Fort Lauderdale-Hollywood International Airport', airportCode: 'FLL', city: 'Fort Lauderdale', stateCode: 'FL' },
  { airportName: 'Charlotte Douglas International Airport', airportCode: 'CLT', city: 'Charlotte', stateCode: 'NC' },
  { airportName: 'San Juan Luis Muñoz Marín International Airport', airportCode: 'SJU', city: 'San Juan', stateCode: 'PR' },
  { airportName: 'Cancun International Airport', airportCode: 'CUN', city: 'Cancun', stateCode: 'QR' },
  { airportName: 'Los Cabos International Airport', airportCode: 'SJD', city: 'Los Cabos', stateCode: 'BCS' },
  { airportName: 'Dallas Love Field', airportCode: 'DAL', city: 'Dallas', stateCode: 'TX' },
  { airportName: 'Houston Hobby Airport', airportCode: 'HOU', city: 'Houston', stateCode: 'TX' },
  { airportName: 'Maui Kahului Airport', airportCode: 'OGG', city: 'Kahului', stateCode: 'HI' },
  { airportName: 'Hawaii Honolulu International Airport', airportCode: 'HNL', city: 'Honolulu', stateCode: 'HI' },
  { airportName: 'Raleigh-Durham International Airport', airportCode: 'RDH', city: 'Raleigh', stateCode: 'NC' },
  { airportName: 'Nashville International Airport', airportCode: 'BNA', city: 'Nashville', stateCode: 'TN' },
  { airportName: 'Cincinnati/Northern Kentucky International Airport', airportCode: 'CVG', city: 'Cincinnati', stateCode: 'OH' },
  { airportName: 'Cleveland Hopkins International Airport', airportCode: 'CLE', city: 'Cleveland', stateCode: 'OH' },
  { airportName: 'Pittsburgh International Airport', airportCode: 'PIT', city: 'Pittsburgh', stateCode: 'PA' },
  { airportName: 'Hartsfield-Jackson Atlanta International Airport', airportCode: 'ATL', city: 'Atlanta', stateCode: 'GA' },
  { airportName: 'Chicago Midway International Airport', airportCode: 'MDW', city: 'Chicago', stateCode: 'IL' },
  { airportName: 'St. Louis Lambert International Airport', airportCode: 'STL', city: 'St. Louis', stateCode: 'MO' },
  { airportName: 'Milwaukee General Mitchell International Airport', airportCode: 'MKE', city: 'Milwaukee', stateCode: 'WI' },
  { airportName: 'Baltimore/Washington International Airport', airportCode: 'BWI', city: 'Baltimore', stateCode: 'MD' },
  { airportName: 'Ronald Reagan Washington National Airport', airportCode: 'DCA', city: 'Washington', stateCode: 'DC' },
  { airportName: 'Washington Dulles International Airport', airportCode: 'IAD', city: 'Washington', stateCode: 'DC' },
  { airportName: 'Los Angeles Long Beach Airport', airportCode: 'LGB', city: 'Long Beach', stateCode: 'CA' },
  { airportName: 'Oakland International Airport', airportCode: 'OAK', city: 'Oakland', stateCode: 'CA' },
  { airportName: 'San Jose Mineta International Airport', airportCode: 'SJC', city: 'San Jose', stateCode: 'CA' },
  { airportName: 'Kahului Airport', airportCode: 'OGG', city: 'Kahului', stateCode: 'HI' },
];

export function registerUsLocationsRoutes(app: App) {
  // Seed US locations data
  app.fastify.post('/api/locations/seed-us', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Seeding US locations data');

    try {
      // Check if data already exists
      const existingStates = await app.db.query.usStates.findFirst();

      if (existingStates) {
        app.logger.info({}, 'US locations data already seeded');
        return { message: 'US locations data already seeded', seeded: false };
      }

      // Insert states
      await app.db.insert(schema.usStates).values(US_STATES_DATA);
      app.logger.info({ count: US_STATES_DATA.length }, 'US states seeded');

      // Insert cities
      await app.db.insert(schema.usCities).values(US_CITIES_DATA);
      app.logger.info({ count: US_CITIES_DATA.length }, 'US cities seeded');

      // Insert zip codes
      await app.db.insert(schema.usZipCodes).values(US_ZIP_CODES_DATA);
      app.logger.info({ count: US_ZIP_CODES_DATA.length }, 'US zip codes seeded');

      // Insert airports
      await app.db.insert(schema.usAirports).values(US_AIRPORTS_DATA);
      app.logger.info({ count: US_AIRPORTS_DATA.length }, 'US airports seeded');

      return {
        message: 'US locations data seeded successfully',
        seeded: true,
        counts: {
          states: US_STATES_DATA.length,
          cities: US_CITIES_DATA.length,
          zipCodes: US_ZIP_CODES_DATA.length,
          airports: US_AIRPORTS_DATA.length,
        },
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to seed US locations data');
      throw error;
    }
  });

  // Get all US states
  app.fastify.get('/api/locations/us-states', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Fetching all US states');

    try {
      const states = await app.db.query.usStates.findMany({
        orderBy: (table, { asc }) => [asc(table.stateName)],
      });

      app.logger.info({ count: states.length }, 'US states fetched successfully');

      return states.map((state) => ({
        id: state.id,
        stateName: state.stateName,
        stateCode: state.stateCode,
      }));
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch US states');
      throw error;
    }
  });

  // Get US cities by state
  app.fastify.get(
    '/api/locations/us-cities',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { state } = request.query as { state: string };

      if (!state) {
        app.logger.warn({}, 'State parameter is required');
        return reply.status(400).send({ error: 'State parameter is required' });
      }

      app.logger.info({ stateCode: state }, 'Fetching US cities for state');

      try {
        const cities = await app.db.query.usCities.findMany({
          where: eq(schema.usCities.stateCode, state.toUpperCase()),
          orderBy: (table, { asc }) => [asc(table.cityName)],
        });

        app.logger.info({ stateCode: state, count: cities.length }, 'US cities fetched successfully');

        return cities.map((city) => ({
          id: city.id,
          cityName: city.cityName,
          stateCode: city.stateCode,
        }));
      } catch (error) {
        app.logger.error({ err: error, stateCode: state }, 'Failed to fetch US cities');
        throw error;
      }
    }
  );

  // Get US zip codes by city and state
  app.fastify.get(
    '/api/locations/us-zip-codes',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { city, state } = request.query as { city: string; state: string };

      if (!city || !state) {
        app.logger.warn({}, 'City and state parameters are required');
        return reply.status(400).send({ error: 'City and state parameters are required' });
      }

      app.logger.info({ cityName: city, stateCode: state }, 'Fetching US zip codes');

      try {
        const zipCodes = await app.db.query.usZipCodes.findMany({
          where: eq(schema.usZipCodes.cityName, city),
          orderBy: (table, { asc }) => [asc(table.zipCode)],
        });

        app.logger.info(
          { cityName: city, stateCode: state, count: zipCodes.length },
          'US zip codes fetched successfully'
        );

        return zipCodes.map((zip) => ({
          id: zip.id,
          zipCode: zip.zipCode,
          cityName: zip.cityName,
          stateCode: zip.stateCode,
        }));
      } catch (error) {
        app.logger.error({ err: error, cityName: city, stateCode: state }, 'Failed to fetch US zip codes');
        throw error;
      }
    }
  );

  // Get all US airports
  app.fastify.get(
    '/api/locations/us-airports',
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Fetching all US airports');

      try {
        const airports = await app.db.query.usAirports.findMany({
          orderBy: (table, { asc }) => [asc(table.airportCode)],
        });

        app.logger.info({ count: airports.length }, 'US airports fetched successfully');

        return airports.map((airport) => ({
          id: airport.id,
          airportName: airport.airportName,
          airportCode: airport.airportCode,
          city: airport.city,
          stateCode: airport.stateCode,
        }));
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch US airports');
        throw error;
      }
    }
  );
}
