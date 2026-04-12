import React, { useState, useRef, useEffect } from "react";
import { supabase } from './supabase.js'
import { savePalette } from './palettes.js'
import History from './History.jsx'
import { exportToPptx } from './exportPptx.js'
import { exportToDxf } from './exportDxf.js'
import GlobeView from './GlobeView.jsx'
import imgSoftscape from './assets/softscape.jpeg'
import imgHardscape from './assets/Hardscape.jpeg'
import imgBoth from './assets/Both.jpeg'
import imgProjectSetup from './assets/project_setup.jpeg'
import imgPlants from './assets/pant_categories.jpeg'
import imgStyle from './assets/panting_style.jpeg'
import imgColour from './assets/seasonality.jpg'
import imgConditions from './assets/special conditions.jpg'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500;1,600&family=Plus+Jakarta+Sans:ital,opsz,wght@0,6..30,300;0,6..30,400;0,6..30,500;0,6..30,600;0,6..30,700;1,6..30,400&display=swap');
@import url('https://fonts.cdnfonts.com/css/garet');`;

/* ══════════ COUNTRY DATA ══════════ */
const COUNTRY_GROUPS = [
  { group:"Climate Presets", countries:["Mediterranean Climate","Tropical / Rainforest Climate","Arid / Desert Climate","Semi-arid / Steppe Climate","Temperate Oceanic Climate","Humid Subtropical Climate","Continental Climate"] },
  { group:"Middle East", countries:["Egypt","Saudi Arabia","UAE","Qatar","Kuwait","Bahrain","Oman","Jordan","Lebanon","Iraq","Syria","Yemen","Palestine / West Bank & Gaza","Libya"] },
  { group:"North Africa", countries:["Morocco","Tunisia","Algeria","Sudan","Ethiopia (Horn)"] },
  { group:"Sub-Saharan Africa", countries:["South Africa","Kenya","Tanzania","Uganda","Rwanda","Nigeria","Ghana","Senegal","Côte d'Ivoire","Cameroon","Zimbabwe","Namibia","Botswana","Mozambique","Zambia","Malawi"] },
  { group:"Southern Europe", countries:["Spain","Portugal","France","Italy","Greece","Turkey","Cyprus","Malta","Croatia","Albania"] },
  { group:"Western & Northern Europe", countries:["UK","Germany","Netherlands","Belgium","Austria","Switzerland","Sweden","Norway","Denmark","Finland","Ireland"] },
  { group:"Eastern Europe", countries:["Poland","Romania","Bulgaria","Czech Republic","Hungary","Ukraine","Serbia"] },
  { group:"South Asia", countries:["India","Pakistan","Bangladesh","Sri Lanka","Nepal"] },
  { group:"Southeast Asia", countries:["Thailand","Malaysia","Indonesia","Philippines","Vietnam","Singapore","Cambodia","Myanmar","Laos"] },
  { group:"East Asia", countries:["China","Japan","South Korea","Taiwan"] },
  { group:"Central Asia", countries:["Kazakhstan","Uzbekistan","Iran","Afghanistan"] },
  { group:"Australia & Pacific", countries:["Australia","New Zealand","Papua New Guinea"] },
  { group:"Americas — Tropical", countries:["Brazil","Colombia","Venezuela","Ecuador","Peru","Bolivia","Mexico","Guatemala","Costa Rica","Panama","Cuba","Dominican Republic","Jamaica"] },
  { group:"Americas — Temperate & Arid", countries:["USA — Southwest (California, Arizona)","USA — Southeast (Florida, Texas)","USA — Mid-Atlantic & Northeast","USA — Pacific Northwest","USA — Midwest / Great Plains","Canada","Argentina","Chile","Uruguay"] },
];

const COUNTRY_SUB_REGIONS = {
  "Egypt":["Greater Cairo / Nile Valley","North Coast (Mediterranean)","Red Sea Coast","Sinai Peninsula","Nile Delta (Beheira, Kafr el-Sheikh)","Upper Egypt (Luxor, Aswan)","Western Desert Oases (Siwa, Bahariya)"],
  "Saudi Arabia":["Riyadh (Najd Plateau)","Jeddah / Hejaz Coast","Asir Highlands","Eastern Province (Al-Hasa)","Tabuk / Neom Region","Medina Region","Hail / North"],
  "UAE":["Dubai","Abu Dhabi","Sharjah / Northern Emirates","Al Ain / Inland Desert","Fujairah / East Coast"],
  "Qatar":["Doha / Coastal","Interior Desert"],
  "Kuwait":["Coastal / Urban"],
  "Bahrain":["Coastal Island"],
  "Oman":["Muscat / Northern Coast","Salalah (Dhofar — Monsoon Zone)","Hajar Mountains","Interior Desert"],
  "Jordan":["Amman / Highlands","Jordan Valley (Rift Valley)","Aqaba / Southern Coast","Wadi Rum Desert"],
  "Lebanon":["Beirut / Coast","Bekaa Valley","Mount Lebanon","Tripoli / North"],
  "Iraq":["Baghdad / Tigris-Euphrates","Basra / Southern Marshes","Kurdish Highland"],
  "Syria":["Damascus / Inland","Coastal (Latakia, Tartus)","Aleppo / North","Euphrates Valley"],
  "Yemen":["Aden / Southern Coast","Sana'a / Highlands","Hadramaut Valley","Socotra Island"],
  "Palestine / West Bank & Gaza":["Gaza / Coastal Strip","West Bank / Hills & Valleys"],
  "Libya":["Tripoli / Northwest Coast","Benghazi / Northeast","Interior Desert"],
  "Morocco":["Coastal (Casablanca, Rabat)","Marrakech / Pre-Sahara","Atlas Mountains","Fes / Imperial Cities","Saharan Fringe (Draa, Ziz)","Agadir / Atlantic South"],
  "Tunisia":["Tunis / Northern Coast","Cap Bon Peninsula","Central Steppe","Southern Desert (Djerba, Tozeur)"],
  "Algeria":["Algiers / Northern Coast","Atlas Region","Oran / West","Eastern (Constantine)","Saharan Interior"],
  "Sudan":["Khartoum / Nile Valley","Red Sea Coast","Sahel / Semi-arid"],
  "Ethiopia (Horn)":["Addis Ababa / Highland","Rift Valley","Lowland / Arid (Afar)","Coastal Region"],
  "South Africa":["Cape Town / Western Cape (Mediterranean)","Johannesburg / Highveld","Durban / KwaZulu-Natal (Subtropical)","Garden Route / Southern Cape","Karoo / Semi-arid","Limpopo / Bushveld"],
  "Kenya":["Nairobi / Central Highland","Mombasa / Coastal","Rift Valley","Arid North (Turkana)"],
  "Tanzania":["Dar es Salaam / Coast","Kilimanjaro / Highland","Zanzibar Island","Serengeti / Savanna"],
  "Nigeria":["Lagos / Humid South","Abuja / Central Savanna","Northern Sahel"],
  "Ghana":["Accra / Coastal","Kumasi / Forest Zone","Northern Savanna"],
  "Spain":["Andalusia / Deep South","Mediterranean Coast (Valencia, Catalonia)","Balearic Islands","Canary Islands","Central Meseta / Madrid","Galicia / Atlantic Northwest"],
  "Portugal":["Lisbon / Central","Algarve / South","Porto / Atlantic North","Madeira Island","Azores"],
  "France":["Mediterranean South (Provence, Languedoc)","Atlantic Southwest (Bordeaux)","Paris / Northern","Alpine Region","Corsica"],
  "Italy":["Sicily / Deep South","Campania / Naples","Tuscany / Central","Rome / Lazio","Northern Italy / Po Valley","Sardinia","Aosta / Alpine"],
  "Greece":["Athens / Attica","Crete","Dodecanese / Aegean Islands","Ionian Islands","Northern Greece / Thessaloniki"],
  "Turkey":["Istanbul / Marmara","Aegean Coast (Izmir, Bodrum)","Mediterranean Coast (Antalya, Mersin)","Central Anatolia","Black Sea Coast","Eastern Turkey / Highland"],
  "Cyprus":["Coastal Lowlands","Troodos Mountain Interior"],
  "UK":["London / Southeast England","Southwest England (Devon, Cornwall)","Wales","Scotland / Highland","Northern Ireland"],
  "Germany":["Bavaria / South","Rhine Valley / West","Northern Germany","Berlin / Northeast"],
  "Australia":["Perth / Southwest (Mediterranean)","Adelaide / South Australia","Sydney / NSW","Melbourne / Victoria","Brisbane / Southeast Queensland","Tropical North (Darwin, Cairns)","Alice Springs / Arid Centre"],
  "New Zealand":["Auckland / North Island (Subtropical)","Wellington / Cook Strait","Christchurch / Canterbury","Otago / South"],
  "India":["Delhi / North India","Rajasthan / Arid West","Mumbai / West Coast","Kolkata / East","Chennai / Southeast","Kerala / Tropical South","Bangalore / Deccan Plateau","Himalayan Foothills","Goa / Coastal"],
  "Pakistan":["Karachi / Coast","Lahore / Punjab","Islamabad / Highland","Sindh / Arid Interior"],
  "Sri Lanka":["Colombo / Wet Zone","Dry Zone / North","Central Hill Country"],
  "Thailand":["Bangkok / Central","Northern (Chiang Mai)","Southern Peninsular","Eastern (Pattaya, Koh Samui)"],
  "Indonesia":["Jakarta / Java","Bali","Lombok","Sumatra","Sulawesi","Papua"],
  "Malaysia":["Kuala Lumpur / Peninsula","Penang","Sabah / Borneo","Sarawak / Borneo"],
  "Philippines":["Metro Manila / Luzon","Cebu / Visayas","Mindanao","Palawan"],
  "Vietnam":["Hanoi / North","Ho Chi Minh City / South","Da Nang / Central","Mekong Delta"],
  "China":["Southern China (Guangdong, Fujian)","Yangtze Delta (Shanghai, Hangzhou)","Beijing / North","Yunnan / Southwest (Mild)","Arid Northwest (Xinjiang, Gansu)","Tropical Hainan"],
  "Japan":["Tokyo / Kanto","Kyoto-Osaka / Kansai","Hokkaido / Cold North","Okinawa / Subtropical","Hiroshima / Southwest"],
  "Brazil":["São Paulo / Southeast","Rio de Janeiro","Amazon / North & West","Northeast / Semi-arid (Caatinga)","Pantanal / West Centre","Rio Grande do Sul / South (Temperate)"],
  "Colombia":["Bogotá / Highland","Medellín / Andean","Cartagena / Caribbean Coast","Pacific Coast","Amazon South"],
  "Mexico":["Mexico City / Central Plateau","Yucatán / Tropical","Baja California / Desert","Pacific Coast","Gulf Coast / Veracruz","Oaxaca / Southern"],
  "Argentina":["Buenos Aires / Humid Pampas","Patagonia / Arid & Cold","Andean West (Mendoza)","Northeast / Subtropical (Misiones)","Córdoba / Central"],
  "Chile":["Santiago / Mediterranean Central","Northern Desert (Atacama)","Lake District / Temperate","Patagonia / Cold South"],
  "USA — Southwest (California, Arizona)":["California Coast / Mediterranean","California Central Valley","Southern California / Semi-arid","Arizona / Sonoran Desert","Nevada / Mojave Desert"],
  "USA — Southeast (Florida, Texas)":["South Florida / Subtropical","Central Florida","Texas Gulf Coast","Texas Hill Country","Louisiana / Humid Subtropical","Georgia / Piedmont"],
  "USA — Mid-Atlantic & Northeast":["New York Metro","Washington DC / Mid-Atlantic","New England / Northeast","Pennsylvania / Mid-Atlantic"],
  "USA — Pacific Northwest":["Seattle / Western Washington","Portland / Western Oregon","Interior Northwest (Spokane, Boise)"],
  "USA — Midwest / Great Plains":["Chicago / Great Lakes","Kansas / Great Plains","Minnesota / Upper Midwest"],
  "Canada":["British Columbia / Pacific Coast","Ontario / Great Lakes","Quebec / Continental","Prairie Provinces (Alberta, Saskatchewan)","Atlantic Canada"],
  "Mediterranean Climate":["General Mediterranean","Coastal Mediterranean","Inland Mediterranean","Semi-arid Mediterranean"],
  "Tropical / Rainforest Climate":["Tropical Rainforest (year-round rain)","Tropical Monsoon","Tropical Savanna / Wet-Dry"],
  "Arid / Desert Climate":["Hot Desert (< 250mm/yr, high temp)","Cold Desert / High Desert","Coastal Desert (cool, foggy)"],
  "Semi-arid / Steppe Climate":["Hot Steppe","Cold Steppe / Continental Steppe"],
  "Temperate Oceanic Climate":["Maritime Temperate (mild, rainy)","Sub-oceanic"],
  "Humid Subtropical Climate":["Humid Subtropical (hot summers, mild winters)"],
  "Continental Climate":["Humid Continental (warm summers)","Subarctic / Boreal"],
};

const REGION_HINTS = {
  "Greater Cairo / Nile Valley":"Hot semi-arid, ~25mm rainfall. Alluvial Nile soils — fertile but often compacted. Dust and heat are key stressors.",
  "North Coast (Mediterranean)":"⚠ Sandy, saline soils — salt-tolerant species essential. ~150–200mm winter rain. Strong coastal winds.",
  "Red Sea Coast":"☀ Extremely hot, near-zero rainfall, intense salt air. Only the most drought and salt tolerant species will survive.",
  "Sinai Peninsula":"🏜 Arid rocky, shallow alkaline soils. Under 50mm/yr. Desert-adapted species only — some oasis plants near wadis.",
  "Nile Delta (Beheira, Kafr el-Sheikh)":"💧 Fertile alluvial soils, high humidity year-round, risk of seasonal waterlogging. Widest plant range in Egypt.",
  "Upper Egypt (Luxor, Aswan)":"☀ One of the hottest and driest inhabited areas on Earth. Near-zero rainfall, very low humidity. Only xerophytes, palms, desert-adapted trees.",
  "Western Desert Oases (Siwa, Bahariya)":"🏜 True desert with isolated groundwater. Extreme heat and aridity. Date palms and oasis-adapted species around water sources.",
  "Riyadh (Najd Plateau)":"☀ Extreme continental desert — 45°C+ summers, cold winters with occasional frost. ~100mm/yr. Drought-tolerant species essential.",
  "Jeddah / Hejaz Coast":"⚠ Hot, humid, salty coastal air year-round. Low rainfall but high atmospheric moisture. Salt and humidity tolerance critical.",
  "Asir Highlands":"Significantly cooler and wetter than rest of Saudi Arabia (up to 500mm/yr). Broader palette including some temperate species.",
  "Eastern Province (Al-Hasa)":"🌡 Extreme heat and dust, high Gulf humidity. Saline groundwater. Drought and humidity tolerance important.",
  "Dubai":"🌡 Extreme summer heat (48°C+), high coastal humidity, salt air. ~75mm/yr. Salt, heat, and drought tolerance essential.",
  "Abu Dhabi":"🌡 Sandy/gravelly soils, high salt content, extreme heat. Only heat-adapted, drought-tolerant, salt-tolerant species.",
  "Al Ain / Inland Desert":"☀ Hot and dry, lower humidity than coast. Rocky desert soils. Palms, desert shrubs, irrigated specimen trees.",
  "Fujairah / East Coast":"More rainfall (~150mm/yr), lower humidity, cooler. Wadi vegetation and some subtropical species viable.",
  "Doha / Coastal":"⚠ Extreme heat with very high humidity. One of the most demanding climates. Nearly all planting requires full irrigation.",
  "Coastal / Urban":"⚠ Hot coastal Gulf climate — high humidity, saline soils and air, intense summer heat.",
  "Coastal Island":"⚠ Gulf island climate — surrounded by hot saline water, high humidity, sandy soils with salt intrusion.",
  "Muscat / Northern Coast":"🌡 Very hot and humid coastal. Rocky terrain nearby. Salt and heat-tolerant species.",
  "Salalah (Dhofar — Monsoon Zone)":"🌧 Unique monsoon season (June–September) creates lush subtropical conditions — tropical species viable here.",
  "Hajar Mountains":"Cooler at elevation, higher rainfall. Some temperate species possible. Rocky, well-draining soils.",
  "Amman / Highlands":"Mediterranean-influenced highland — mild, 300–500mm rainfall. Wide palette including Mediterranean and temperate species.",
  "Jordan Valley (Rift Valley)":"☀ Hot and arid below sea level. Desert and steppe species. Date palms and drought-tolerant Mediterranean plants.",
  "Aqaba / Southern Coast":"⚠ Desert coastal — hot, low rainfall, salt air from Red Sea.",
  "Wadi Rum Desert":"🏜 True hyper-arid desert. Only most resilient desert species. Strong xerophyte design statement.",
  "Beirut / Coast":"Mediterranean climate — mild wet winters, hot dry summers. Wide palette — Mediterranean, subtropical, ornamental species.",
  "Bekaa Valley":"Continental-Mediterranean — hot dry summers, cold winters with snow possible. Broader palette with some temperate species.",
  "Gaza / Coastal Strip":"⚠ Mediterranean coastal with salt air, sandy soils. Salt-tolerant and Mediterranean species preferred.",
  "Coastal (Casablanca, Rabat)":"Atlantic-Mediterranean transition — mild, ~400mm rainfall, some salt air. Good general Mediterranean palette.",
  "Marrakech / Pre-Sahara":"☀ Hot semi-arid, ~230mm rainfall. Traditional Islamic garden plants thrive — oleanders, palms, citrus, bougainvillea.",
  "Atlas Mountains":"Cooler and wetter at altitude — some temperate species possible. Rocky soils, dramatic terrain.",
  "Saharan Fringe (Draa, Ziz)":"🏜 Hyper-arid desert edge. Date palms, acacias, tamarisks only.",
  "Tunis / Northern Coast":"Classic Mediterranean climate — mild, ~460mm rainfall. Good range of Mediterranean ornamentals.",
  "Southern Desert (Djerba, Tozeur)":"🏜 Hot desert, sandy soils. Desert-adapted and oasis species only.",
  "Cape Town / Western Cape (Mediterranean)":"True Mediterranean — dry hot summers, cool wet winters, ~500mm. Unique fynbos biome. Wide drought-tolerant palette.",
  "Johannesburg / Highveld":"High altitude (1700m) — warm summers with thunderstorms, dry mild winters. Frost possible. Good diverse palette.",
  "Durban / KwaZulu-Natal (Subtropical)":"🌴 Warm subtropical coastal — high humidity, good rainfall. Lush tropical and subtropical palette.",
  "Karoo / Semi-arid":"🏜 Hot semi-arid interior. Unique succulent karoo biome. Excellent for xeriscape and succulent-based planting.",
  "Nairobi / Central Highland":"Equatorial highland at 1700m — mild year-round (18–24°C), bimodal rains. Very wide palette.",
  "Mombasa / Coastal":"🌴 Hot humid tropical coast — high rainfall, salt air. Wide range of coastal and tropical plants.",
  "Dar es Salaam / Coast":"🌴 Hot and humid tropical coast. High rainfall. Lush tropical palette.",
  "Andalusia / Deep South":"☀ Hot semi-arid Mediterranean — very hot dry summers, mild winters. ~550mm. Drought-tolerant Mediterranean and exotic species.",
  "Mediterranean Coast (Valencia, Catalonia)":"Classic Mediterranean — warm, ~400–500mm rainfall. Citrus, palms, lavender, rosemary, olive trees all thrive.",
  "Canary Islands":"Year-round mild subtropical — unique microclimate. Wide palette including tropical and desert species.",
  "Mediterranean South (Provence, Languedoc)":"Hot Mediterranean summers, cool winters. ~600mm. Lavender, herbs, olive, cypress — classic Provençal palette.",
  "Paris / Northern":"Temperate oceanic — cool summers, cold winters, ~600mm. Wide temperate palette, deciduous trees dominant.",
  "Sicily / Deep South":"☀ Hot Mediterranean — very dry summers, mild winters. Drought-tolerant species, citrus, agave, palms.",
  "Athens / Attica":"☀ Hot semi-arid Mediterranean — very dry summers. ~380mm. Olive, pine, lavender, rockrose.",
  "Crete":"☀ Similar to Athens but wetter (~500mm) with more wind. Rich local flora. Salt air on coasts.",
  "London / Southeast England":"Cool oceanic — mild, cloudy, ~600mm well-distributed. Very wide temperate palette.",
  "Scotland / Highland":"Cool, wet, and windy — ~1000mm+ rainfall. Heathers, conifers, hardy perennials. Cold-hardy species essential.",
  "Delhi / North India":"🌡 Semi-arid with monsoon — extremely hot summers (45°C+), cool dry winters, ~700mm seasonal rainfall.",
  "Rajasthan / Arid West":"🏜 Hot desert — very low rainfall (~300mm), extreme heat. Desert-adapted Indian species.",
  "Mumbai / West Coast":"🌧 Tropical monsoon — extremely wet June–September (~2400mm/yr). Lush tropical palette.",
  "Kerala / Tropical South":"🌴 Tropical rainforest — very high rainfall (>3000mm/yr), high humidity. Richest tropical planting climate in India.",
  "Bangalore / Deccan Plateau":"Pleasant highland tropical — moderate rainfall, mild temperatures. Very wide ornamental palette.",
  "Bangkok / Central":"🌴 Hot humid tropical — monsoonal. Lush tropical palette with excellent flowering trees.",
  "Perth / Southwest (Mediterranean)":"True Mediterranean — hot dry summers, mild wet winters, ~730mm. Unique Southwest Australian flora.",
  "Sydney / NSW":"Humid subtropical — warm year-round, ~1200mm. Very wide palette from temperate to subtropical.",
  "Melbourne / Victoria":"Oceanic temperate — cool, changeable, ~650mm. Wide temperate palette. Good for deciduous trees.",
  "Brisbane / Southeast Queensland":"Subtropical — warm and humid, ~1000mm. Jacarandas, frangipani, subtropical shrubs.",
  "Tropical North (Darwin, Cairns)":"🌴 Monsoonal tropical — very wet season followed by dry. Tropical species only.",
  "Alice Springs / Arid Centre":"🏜 Hot arid desert — extreme temperatures, ~280mm rainfall. Drought-tolerant native and adapted species only.",
  "Auckland / North Island (Subtropical)":"Warm oceanic/subtropical — mild, ~1200mm. Wide palette from temperate to subtropical.",
  "California Coast / Mediterranean":"True Mediterranean — mild coastal, dry summers, ~500mm. Mediterranean, drought-tolerant, and California native species.",
  "Arizona / Sonoran Desert":"🏜 Hot desert — extreme heat (45°C+), ~190mm. Native saguaro, palo verde, desert willow ecosystem. Xeriscape only.",
  "South Florida / Subtropical":"🌴 Tropical/subtropical — hot and humid year-round, ~1500mm. Full tropical palette. Salt air near coast.",
  "Texas Gulf Coast":"⚠ Humid subtropical with hurricane risk — high heat and humidity, salt air. Flood and salt tolerance important.",
  "São Paulo / Southeast":"Subtropical highland — mild temperatures, ~1400mm distributed year-round. Very wide ornamental palette.",
  "Santiago / Mediterranean Central":"Mediterranean — dry hot summers, cool wet winters, ~280mm. Mediterranean and Chilean native flora.",
  "Northern Desert (Atacama)":"🏜 Extreme hyper-arid — one of the driest places on Earth. Only highly specialised xeric species.",
  "General Mediterranean":"Dry hot summers, mild wet winters, 300–700mm. Wide palette: olive, lavender, rosemary, citrus, bougainvillea.",
  "Tropical Rainforest (year-round rain)":"🌴 Year-round heat and high rainfall. Maximum tropical diversity. Focus on drainage management.",
  "Tropical Savanna / Wet-Dry":"🌴 Distinct wet and dry seasons. Plants must handle waterlogging AND prolonged drought.",
  "Hot Desert (< 250mm/yr, high temp)":"🏜 Full irrigation always required. Only drought-tolerant, heat-adapted species. Xeriscape is the appropriate style.",
  "Maritime Temperate (mild, rainy)":"Cool, wet, and mild year-round. Very wide temperate palette — lawns, deciduous trees, roses, hedges all excel.",
  "Humid Subtropical (hot summers, mild winters)":"Hot humid summers, mild winters. Wide palette including temperate and subtropical species.",
};

const REGION_AUTO_CONDITIONS = {
  "North Coast (Mediterranean)":["Salt Tolerant","Wind Resistant"],
  "Red Sea Coast":["Salt Tolerant","Drought Tolerant","Wind Resistant"],
  "Upper Egypt (Luxor, Aswan)":["Drought Tolerant"],
  "Sinai Peninsula":["Drought Tolerant"],
  "Western Desert Oases (Siwa, Bahariya)":["Drought Tolerant"],
  "Nile Delta (Beheira, Kafr el-Sheikh)":["Humidity Tolerant","Flood / Waterlogging Tolerant"],
  "Riyadh (Najd Plateau)":["Drought Tolerant"],
  "Jeddah / Hejaz Coast":["Humidity Tolerant","Salt Tolerant","Drought Tolerant"],
  "Eastern Province (Al-Hasa)":["Drought Tolerant","Humidity Tolerant"],
  "Tabuk / Neom Region":["Drought Tolerant","Wind Resistant"],
  "Dubai":["Drought Tolerant","Salt Tolerant","Humidity Tolerant"],
  "Abu Dhabi":["Drought Tolerant","Salt Tolerant"],
  "Al Ain / Inland Desert":["Drought Tolerant"],
  "Doha / Coastal":["Drought Tolerant","Salt Tolerant","Humidity Tolerant"],
  "Interior Desert":["Drought Tolerant"],
  "Coastal / Urban":["Salt Tolerant","Humidity Tolerant"],
  "Coastal Island":["Salt Tolerant","Humidity Tolerant"],
  "Muscat / Northern Coast":["Salt Tolerant","Drought Tolerant","Humidity Tolerant"],
  "Aqaba / Southern Coast":["Salt Tolerant","Drought Tolerant"],
  "Wadi Rum Desert":["Drought Tolerant"],
  "Basra / Southern Marshes":["Humidity Tolerant","Flood / Waterlogging Tolerant","Salt Tolerant"],
  "Saharan Fringe (Draa, Ziz)":["Drought Tolerant"],
  "Marrakech / Pre-Sahara":["Drought Tolerant"],
  "Coastal (Casablanca, Rabat)":["Salt Tolerant","Wind Resistant"],
  "Beirut / Coast":["Salt Tolerant","Humidity Tolerant"],
  "Gaza / Coastal Strip":["Salt Tolerant","Humidity Tolerant"],
  "Saharan Interior":["Drought Tolerant"],
  "Arid / Desert Climate":["Drought Tolerant"],
  "Hot Desert (< 250mm/yr, high temp)":["Drought Tolerant"],
  "Semi-arid / Steppe Climate":["Drought Tolerant"],
  "Coastal Mediterranean":["Salt Tolerant","Wind Resistant"],
  "Cape Town / Western Cape (Mediterranean)":["Drought Tolerant","Wind Resistant"],
  "Karoo / Semi-arid":["Drought Tolerant"],
  "Mombasa / Coastal":["Humidity Tolerant","Salt Tolerant"],
  "Dar es Salaam / Coast":["Humidity Tolerant","Salt Tolerant"],
  "Karachi / Coast":["Salt Tolerant","Humidity Tolerant"],
  "Mumbai / West Coast":["Humidity Tolerant"],
  "Goa / Coastal":["Humidity Tolerant","Salt Tolerant"],
  "South Florida / Subtropical":["Humidity Tolerant","Salt Tolerant"],
  "Texas Gulf Coast":["Humidity Tolerant","Salt Tolerant"],
  "Perth / Southwest (Mediterranean)":["Drought Tolerant"],
};

const STYLES = ["Mediterranean","Xeriscape / Desert","Tropical / Lush","Formal / Classical","Native / Local","Coastal / Seaside","Contemporary Minimalist","Wildflower Meadow","Japanese / Zen","Islamic Garden","Woodland / Naturalistic","Prairie / Steppe"];
const STYLE_COMPAT = {
  "Mediterranean":["Coastal / Seaside","Native / Local","Formal / Classical","Contemporary Minimalist","Islamic Garden","Wildflower Meadow"],
  "Xeriscape / Desert":["Native / Local","Contemporary Minimalist","Prairie / Steppe","Islamic Garden"],
  "Tropical / Lush":["Coastal / Seaside","Wildflower Meadow","Native / Local"],
  "Formal / Classical":["Mediterranean","Islamic Garden","Contemporary Minimalist","Japanese / Zen"],
  "Native / Local":["Mediterranean","Xeriscape / Desert","Tropical / Lush","Wildflower Meadow","Prairie / Steppe","Woodland / Naturalistic","Coastal / Seaside"],
  "Coastal / Seaside":["Mediterranean","Tropical / Lush","Native / Local","Contemporary Minimalist"],
  "Contemporary Minimalist":["Mediterranean","Formal / Classical","Xeriscape / Desert","Japanese / Zen","Coastal / Seaside"],
  "Wildflower Meadow":["Native / Local","Prairie / Steppe","Woodland / Naturalistic","Mediterranean","Tropical / Lush"],
  "Japanese / Zen":["Contemporary Minimalist","Formal / Classical","Woodland / Naturalistic"],
  "Islamic Garden":["Formal / Classical","Mediterranean","Xeriscape / Desert"],
  "Woodland / Naturalistic":["Native / Local","Wildflower Meadow","Prairie / Steppe","Japanese / Zen"],
  "Prairie / Steppe":["Xeriscape / Desert","Native / Local","Wildflower Meadow","Woodland / Naturalistic"],
};

const WHEEL = ["Red","Coral","Orange","Pale Yellow","Yellow","Lime Green","Bright Green","Blue","Lavender","Magenta / Purple","Hot Pink","Soft Pink"];
const NEUTRALS_ALWAYS = ["White","Cream / Ivory"];
const FOLIAGE_COLORS = ["Dark Green","Silver / Grey Foliage","Bronze / Burgundy Foliage","Variegated"];
const ALL_COLORS_ORDER = ["White","Cream / Ivory","Pale Yellow","Yellow","Orange","Coral","Red","Soft Pink","Hot Pink","Magenta / Purple","Lavender","Blue","Bright Green","Lime Green","Dark Green","Silver / Grey Foliage","Bronze / Burgundy Foliage","Variegated"];
const COLOR_HEX = {"White":"#f5f5f0","Cream / Ivory":"#f0e4c0","Pale Yellow":"#f5ef80","Yellow":"#f0d030","Orange":"#f08030","Coral":"#f07070","Red":"#e04040","Hot Pink":"#e04090","Soft Pink":"#f0a0c0","Magenta / Purple":"#b850d0","Lavender":"#b090e0","Blue":"#5090e0","Silver / Grey Foliage":"#c0c0cc","Dark Green":"#4a9040","Bright Green":"#70c040","Lime Green":"#b0d830","Bronze / Burgundy Foliage":"#a86050","Variegated":"linear-gradient(135deg,#70c040 0%,#f0e4c0 50%,#b090e0 100%)"};

function wIdx(c){return WHEEL.indexOf(c);}
function wAt(i){const n=WHEEL.length;return WHEEL[((i%n)+n)%n];}
const isChromatic=c=>wIdx(c)!==-1;

function chromaticAvailable(harmony,anchor){
  if(!anchor||!harmony)return WHEEL;
  const i=wIdx(anchor);
  if(harmony==="monochromatic")return[anchor];
  if(harmony==="analogous")return[wAt(i-2),wAt(i-1),anchor,wAt(i+1),wAt(i+2)];
  if(harmony==="complementary"){const h=Math.round(WHEEL.length/2);return[anchor,wAt(i+h-1),wAt(i+h),wAt(i+h+1)];}
  if(harmony==="triadic"){const s=Math.round(WHEEL.length/3);return[anchor,wAt(i+s),wAt(i+s*2)];}
  return WHEEL;
}
function maxChromatic(harmony){
  if(harmony==="monochromatic")return 1;
  if(harmony==="complementary")return 2;
  return 3;
}
function getAvailSet(harmony,sel){
  if(!harmony)return ALL_COLORS_ORDER;
  if(harmony==="neutral")return[...NEUTRALS_ALWAYS,...FOLIAGE_COLORS];
  const anchor=sel.find(c=>isChromatic(c));
  return[...new Set([...NEUTRALS_ALWAYS,...FOLIAGE_COLORS,...chromaticAvailable(harmony,anchor)])];
}

const PROJECT_TYPES=["Residential Villa / Garden","Residential Compound","Commercial Plaza / Retail","Hotel / Resort","Public Park","Streetscape / Boulevard","Rooftop Garden","Courtyard","Golf Course","Industrial / Corporate Campus","Ecological Restoration","Healing / Therapeutic Garden","Educational Campus","Waterfront / Marina","Religious / Cultural Site"];
const DIVERSITY=[{val:"minimal",label:"Minimal",sub:"1–2 species per category — focused palette"},{val:"moderate",label:"Moderate",sub:"3–5 species per category — balanced variety"},{val:"rich",label:"Rich & Diverse",sub:"6+ species — layered and complex"}];
const PLANT_TYPES=["Trees","Palms & Palm-like","Shrubs","Ground Covers","Climbers & Creepers","Perennials","Annuals","Succulents & Cacti","Ornamental Grasses & Sedges","Aquatic Plants","Hedges"];
const HARMONIES=[{val:"monochromatic",label:"Monochromatic",desc:"One colour family — shades and tints only"},{val:"analogous",label:"Analogous",desc:"Adjacent colours on the wheel — harmonious and natural"},{val:"complementary",label:"Complementary",desc:"Anchor colour + its opposite — bold contrast"},{val:"triadic",label:"Triadic",desc:"Anchor + two partners evenly spaced — vibrant balance"},{val:"neutral",label:"Neutral / Foliage-Focused",desc:"Greens, silvers, textures — minimal bloom colour"}];
const MOODS=[{val:"calm",label:"Calm & Serene",icon:"◌"},{val:"healing",label:"Healing / Therapeutic",icon:"✦"},{val:"energetic",label:"Vibrant & Energetic",icon:"◈"},{val:"warm",label:"Warm & Welcoming",icon:"◉"},{val:"romantic",label:"Romantic & Soft",icon:"◇"},{val:"formal",label:"Formal & Classic",icon:"▣"},{val:"wild",label:"Wild & Naturalistic",icon:"❋"}];
const CONDITIONS=["Salt Tolerant","Drought Tolerant","Humidity Tolerant","Wind Resistant","Flood / Waterlogging Tolerant","Shade Tolerant","Fast Growing","Slow & Controlled Growth","Low Maintenance","Fragrant","Wildlife / Pollinator Friendly","Slope Stabilisation","Air Purifying","Edible / Productive","Non-Invasive Roots","Suitable for Children's Areas"];
const FOLIAGE_TEXTURES=["Fine / Feathery","Medium","Bold / Coarse","Glossy","Matte","Spiky / Architectural","Weeping","Fluffy / Airy"];
const CAT_ICONS={"Trees":"🌳","Palms & Palm-like":"🌴","Shrubs":"◉","Ground Covers":"🍀","Climbers & Creepers":"🌱","Perennials":"🌸","Annuals":"🌼","Succulents & Cacti":"🌵","Ornamental Grasses & Sedges":"🌾","Aquatic Plants":"🪷","Hedges":"🍃"};

const HD_CHARACTER=[{val:"natural",label:"Natural Stone",sub:"Quarried materials — granite, limestone, travertine, sandstone, basalt, slate, marble"},{val:"manufactured",label:"Manufactured / Concrete",sub:"Porcelain tiles, concrete pavers, interlocking blocks, terrazzo, exposed aggregate"},{val:"wood-composite",label:"Wood & Composites",sub:"Timber decking, WPC (wood-plastic composite), bamboo composite"},{val:"mixed",label:"Mixed Palette",sub:"Combination of natural stone and manufactured materials in different zones"}];
const HD_ORIGIN=["Local / Regional Materials","Imported Materials","Mix of Both"];
const HD_MATERIALS=["Granite","Marble","Limestone","Travertine","Sandstone","Slate","Basalt / Lava Stone","Quartzite","Cobblestone","Pebbles / River Stone","Decomposed Granite","Coral Stone","Porcelain Tiles","Concrete Pavers","Interlocking Concrete Blocks","Exposed Aggregate Concrete","Stamped / Patterned Concrete","Terrazzo","Brick Pavers","Mosaic Tiles","Microtopping / Micro-cement","Timber Decking","WPC Decking (Wood-Plastic Composite)","Bamboo Composite Decking","Resin-Bound Gravel","Rubber / EPDM Safety Paving","Loose Gravel / Crushed Stone"];
const HD_FINISHES=["Polished","Honed / Matt","Brushed / Textured","Flamed / Thermal","Sandblasted","Split-Face / Natural Cleft","Tumbled / Aged","Exposed Aggregate","Bush-Hammered","No Preference"];
const HD_ZONES=["Pedestrian Paths & Walkways","Main Plaza / Open Paved Area","Pool Surround & Wet Areas","Steps & Level Changes","Driveways & Parking","Terraces & Outdoor Seating","Feature / Accent Zones","Water Feature Surrounds","Edging & Borders","Children's Play Areas","Roof / Podium Deck","Entrance & Arrival Court"];
const HD_COLORS=[{label:"White & Light Cream",hex:"#f5f0e8"},{label:"Warm Beige & Sand",hex:"#d4b896"},{label:"Terracotta & Rust",hex:"#c06840"},{label:"Warm Grey",hex:"#b0a898"},{label:"Cool / Blue-Grey (Slate)",hex:"#7888a0"},{label:"Charcoal & Dark Grey",hex:"#585858"},{label:"Black",hex:"#282828"},{label:"Earthy Brown",hex:"#8a5830"},{label:"Warm Yellow / Honey",hex:"#d4a020"},{label:"Green Tones (Moss, Patina)",hex:"#607848"},{label:"Mixed / Varied",hex:"#aaa"}];
const HD_PATTERNS=["Running Bond","Herringbone","Basket Weave","Opus Incertum (Random / Irregular)","Ashlar (Coursed Random)","Versailles / Opus Francigenum","Stack Bond (Grid)","Fan / Compass","Diagonal","No Preference / Let AI Suggest"];

const CHAPTER_LABELS={"location":"The Origin","project":"The Context","palette-type":"The Direction","style":"The Language","plants":"The Palette","colour":"The Mood","conditions":"The Environment","hd-materials":"The Foundation","hd-zones":"The Territory","brief":"The Vision"};

const STEP_IMAGES={
  "style":imgStyle,
  "plants":imgPlants,
  "colour":imgColour,
  "conditions":imgConditions,
  "brief":"https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=900&q=80",
};

const CSS=`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#f9faf8;color:#163422}

.app{min-height:100vh;background:#f9faf8;color:#163422;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-size:15px;}

.hdr{padding:24px 56px;display:flex;align-items:center;justify-content:space-between;background:#163422;position:sticky;top:0;z-index:50}
.hdr-brand{display:flex;align-items:center;gap:14px}
.hdr-logo{width:32px;height:32px;background:rgba(200,235,208,0.1);border:1px solid rgba(200,235,208,0.18);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;color:#c8ebd0}
.hdr-name{font-family:'Garet',sans-serif;font-size:20px;color:#ffffff;letter-spacing:.01em;font-weight:400;font-style:normal}
.hdr-sub{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,240,232,0.3);margin-top:2px;font-weight:500}

.main{padding:60px 56px 80px;max-width:680px}
.wizard-body{display:flex;min-height:calc(100vh - 69px);position:relative}
.wizard-left{flex:1;overflow-y:auto;position:relative;z-index:2}
.wizard-globe-bg{position:fixed;right:0;top:69px;width:55%;height:calc(100vh - 69px);z-index:0;pointer-events:none}
.wizard-globe-fade{position:fixed;right:0;top:69px;width:55%;height:calc(100vh - 69px);background:linear-gradient(to right,rgba(249,250,248,1) 0%,rgba(249,250,248,0.3) 35%,rgba(249,250,248,0) 65%);z-index:1;pointer-events:none}
.wizard-photo-bg{position:fixed;right:0;top:69px;width:55%;height:calc(100vh - 69px);z-index:0;pointer-events:none;background-size:cover;background-position:center}
.wizard-photo-fade{position:fixed;right:0;top:69px;width:55%;height:calc(100vh - 69px);background:linear-gradient(to right,rgba(249,250,248,1) 0%,rgba(249,250,248,0.3) 35%,rgba(249,250,248,0) 65%);z-index:1;pointer-events:none}
@media(max-width:900px){.main{padding:40px 24px 80px}}

.stp-eyebrow{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(22,52,34,0.35);margin-bottom:18px;display:flex;align-items:center;gap:12px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif}
.stp-eyebrow::after{content:'';flex:1;height:1px;background:rgba(22,52,34,0.07)}
.stp-title{font-family:'Garet',sans-serif;font-size:48px;font-weight:400;font-style:normal;color:#163422;line-height:1.1;margin-bottom:10px;letter-spacing:-.01em}
.stp-title em{font-style:normal;color:#4c644e;font-weight:300}
.stp-desc{font-size:14px;color:#4c644e;line-height:1.85;max-width:480px;margin-bottom:40px;font-weight:300}

.sect{margin-bottom:32px}
.sl{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(22,52,34,0.35);margin-bottom:14px;display:flex;align-items:center;gap:10px;font-weight:600}
.sl::after{content:'';flex:1;height:1px;background:rgba(22,52,34,0.06)}

select,input,textarea{background:#ffffff;border:1.5px solid rgba(22,52,34,0.1);border-radius:14px;color:#163422;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:400;padding:12px 16px;outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
select:focus,input:focus,textarea:focus{border-color:#163422;box-shadow:0 0 0 3px rgba(22,52,34,0.07)}
select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23163422' stroke-opacity='.35' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;padding-right:44px}
select option{background:#ffffff;color:#163422}
textarea{resize:vertical;min-height:140px;line-height:1.7}
input::placeholder,textarea::placeholder{color:rgba(22,52,34,0.25)}

.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.tags{display:flex;flex-wrap:wrap;gap:8px}
.tag{padding:7px 16px;border:1.5px solid rgba(22,52,34,0.1);border-radius:9999px;font-size:13px;color:rgba(22,52,34,0.45);cursor:pointer;transition:all .18s;user-select:none;background:#ffffff;letter-spacing:.01em;font-weight:500}
.tag:hover{border-color:rgba(22,52,34,0.28);color:#163422;background:#f3f4f2}
.tag:active{transform:scale(0.95)}
.tag.on{background:rgba(22,52,34,0.07);border-color:#163422;color:#163422;font-weight:600}
.tag.dim{opacity:.25;cursor:not-allowed;pointer-events:none}
.tag.auto{background:rgba(200,235,208,0.35);border-color:rgba(22,52,34,0.2);color:#163422;font-weight:600}
.tag.auto::after{content:'  ✓';font-size:10px;opacity:.7}
.tag.sel-all{border-style:dashed;border-color:rgba(22,52,34,0.18);color:rgba(22,52,34,0.4)}
.tag.sel-all:hover{border-color:#163422;color:#163422;border-style:solid}

.ctag{padding:0;border:2.5px solid transparent;border-radius:14px;font-size:11px;cursor:pointer;transition:all .2s;user-select:none;overflow:hidden;display:flex;flex-direction:column;background:#ffffff;letter-spacing:.01em;font-weight:500;min-width:80px}
.ctag:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,0.15)}
.ctag:active{transform:scale(0.97)}
.ctag.on{border-color:#163422;box-shadow:0 0 0 2px #163422}
.ctag.dim{opacity:.25;cursor:not-allowed;pointer-events:none}
.cdot{display:none}
.ctag-swatch{width:100%;height:52px;display:block;flex-shrink:0}
.ctag-name{padding:6px 8px;font-size:10px;color:#163422;background:#ffffff;text-align:center;line-height:1.3;font-family:'Plus Jakarta Sans',sans-serif}

.div-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.div-card{border:1px solid rgba(22,52,34,0.1);border-radius:16px;padding:20px 18px;cursor:pointer;transition:all .2s;background:#ffffff}
.div-card:hover{border-color:rgba(22,52,34,0.22);background:#f3f4f2}
.div-card.on{background:rgba(22,52,34,0.06);border-color:#163422}
.div-card-lbl{font-size:13px;font-weight:700;color:#163422;margin-bottom:6px;font-family:'Plus Jakarta Sans',sans-serif}
.div-card-sub{font-size:11px;color:#4c644e;line-height:1.5}

.mood-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:8px}
.mood-card{border:1px solid rgba(22,52,34,0.1);border-radius:16px;padding:13px 16px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:12px;background:#ffffff}
.mood-card:hover{border-color:rgba(22,52,34,0.22);background:#f3f4f2}
.mood-card.on{background:rgba(22,52,34,0.06);border-color:#163422}
.mood-icon{font-size:14px;color:#4c644e;width:16px;text-align:center;flex-shrink:0}
.mood-lbl{font-size:12px;color:#163422;letter-spacing:.01em;font-weight:500}

.harm-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.harm-card{border:1px solid rgba(22,52,34,0.1);border-radius:16px;padding:14px 16px;cursor:pointer;transition:all .18s;background:#ffffff}
.harm-card:hover{border-color:rgba(22,52,34,0.22);background:#f3f4f2}
.harm-card.on{background:rgba(22,52,34,0.06);border-color:#163422}
.harm-name{font-size:12px;font-weight:700;color:#163422;margin-bottom:4px;font-family:'Plus Jakarta Sans',sans-serif}
.harm-desc{font-size:11px;color:#4c644e;line-height:1.5}

.tgl-row{display:flex;align-items:center;gap:14px}
.tgl{width:40px;height:22px;background:rgba(22,52,34,0.08);border:1px solid rgba(22,52,34,0.12);border-radius:11px;position:relative;cursor:pointer;transition:all .2s;flex-shrink:0}
.tgl.on{background:rgba(22,52,34,0.22);border-color:#163422}
.tgl-k{width:16px;height:16px;background:rgba(22,52,34,0.25);border-radius:50%;position:absolute;top:2px;left:2px;transition:all .2s}
.tgl.on .tgl-k{left:20px;background:#163422}
.tgl-lbl{font-size:12px;color:#4c644e;letter-spacing:.01em;font-weight:500}

.hint-box{margin-top:10px;padding:12px 16px;background:rgba(200,235,208,0.25);border-radius:12px;border:1px solid rgba(22,52,34,0.1);font-size:12px;color:#4c644e;line-height:1.7}
.info-box{padding:12px 16px;background:#f3f4f2;border-radius:12px;border:1px solid rgba(22,52,34,0.07);font-size:12px;color:#4c644e;line-height:1.7;margin-top:10px}
.colour-hint{font-size:11px;color:#4c644e;margin-bottom:10px;line-height:1.6;padding:8px 14px;background:rgba(200,235,208,0.2);border-radius:12px;border:1px solid rgba(22,52,34,0.07)}

.radio-stack{display:flex;flex-direction:column;gap:8px}
.r-card{border:1px solid rgba(22,52,34,0.1);border-radius:16px;padding:14px 18px;cursor:pointer;transition:all .18s;display:flex;align-items:flex-start;gap:14px;background:#ffffff}
.r-card:hover{border-color:rgba(22,52,34,0.22);background:#f3f4f2}
.r-card.on{background:rgba(22,52,34,0.06);border-color:#163422}
.r-dot{width:15px;height:15px;border-radius:50%;border:1.5px solid rgba(22,52,34,0.18);margin-top:2px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s}
.r-card.on .r-dot{border-color:#163422}
.r-inner{width:6px;height:6px;border-radius:50%;background:#163422}
.r-lbl{font-size:12px;font-weight:700;color:#163422;margin-bottom:3px;font-family:'Plus Jakarta Sans',sans-serif}
.r-sub{font-size:11px;color:#4c644e;line-height:1.5}

.depth-note{font-size:11px;color:#4c644e;background:rgba(200,235,208,0.2);border:1px solid rgba(22,52,34,0.08);border-radius:12px;padding:10px 14px;margin-top:8px;line-height:1.7}
.link-btn{font-size:11px;color:#163422;cursor:pointer;text-decoration:underline;background:none;border:none;padding:0;font-family:inherit;font-weight:600}
.link-btn:hover{color:#4c644e}

.pt-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:4px}
.pt-card{border:1.5px solid rgba(22,52,34,0.1);border-radius:20px;overflow:hidden;cursor:pointer;transition:all .25s;text-align:center;background:#ffffff;display:flex;flex-direction:column}
.pt-card:hover{border-color:rgba(22,52,34,0.3);transform:translateY(-3px);box-shadow:0 12px 32px rgba(22,52,34,0.12)}
.pt-card.on{border-color:#163422;box-shadow:0 0 0 2px #163422}
.pt-img{width:100%;height:220px;object-fit:cover;display:block;transition:transform .4s ease}
.pt-card:hover .pt-img{transform:scale(1.03)}
.pt-body{padding:18px 16px 22px;flex:1}
.pt-label{font-size:14px;font-weight:700;color:#163422;margin-bottom:6px;font-family:'Plus Jakarta Sans',sans-serif}
.pt-sub{font-size:11px;color:#4c644e;line-height:1.5}

.nav{display:flex;justify-content:space-between;align-items:center;margin-top:48px;padding-top:24px;border-top:1px solid rgba(22,52,34,0.06)}
.btn-back{background:#ffffff;border:1px solid rgba(22,52,34,0.14);border-radius:9999px;color:rgba(22,52,34,0.45);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;padding:11px 28px;transition:all .2s}
.btn-back:hover{border-color:rgba(22,52,34,0.3);color:#163422}
.btn-next{background:linear-gradient(135deg,#163422,#2d4b37);border:none;border-radius:9999px;color:#ffffff;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;padding:12px 36px;transition:all .2s;box-shadow:0 2px 8px rgba(22,52,34,0.2)}
.btn-next:hover{opacity:.92;box-shadow:0 4px 16px rgba(22,52,34,0.28)}
.btn-next:disabled{background:rgba(22,52,34,0.12);color:rgba(22,52,34,0.28);cursor:not-allowed;box-shadow:none}
.btn-gen{background:linear-gradient(135deg,#163422,#2d4b37);border:none;border-radius:9999px;color:#ffffff;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;padding:14px 48px;transition:all .2s;box-shadow:0 2px 8px rgba(22,52,34,0.2)}
.btn-gen:hover{opacity:.92;box-shadow:0 4px 16px rgba(22,52,34,0.28)}

.loading{text-align:center;padding:100px 20px}
.loading-t{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:400;font-style:italic;color:#163422;margin-bottom:10px;letter-spacing:-.01em}
.loading-s{font-size:13px;color:#4c644e;margin-bottom:36px;letter-spacing:.02em}
.spin{display:inline-flex;gap:8px}
.spin span{width:7px;height:7px;background:#163422;border-radius:50%;animation:blink 1.4s ease-in-out infinite}
.spin span:nth-child(2){animation-delay:.2s}.spin span:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,80%,100%{opacity:.15;transform:scale(.7)}40%{opacity:1;transform:scale(1)}}

/* ── Result page ── */
.res-wrap{max-width:1160px;margin:0 auto;padding:0 32px 100px}

/* Header */
.res-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0;flex-wrap:wrap;gap:16px;padding:40px 0 32px;border-bottom:1px solid rgba(22,52,34,0.07)}
.res-hdr-left{}
.res-eyebrow{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(22,52,34,0.35);margin-bottom:12px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif}
.res-title{font-family:'Garet',sans-serif;font-size:40px;font-weight:400;color:#163422;line-height:1.05;letter-spacing:-.01em}
.res-meta{font-size:12px;color:rgba(22,52,34,0.45);margin-top:6px;letter-spacing:.02em;font-family:'Plus Jakarta Sans',sans-serif}
.res-hdr-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.res-actions-primary{display:flex;gap:8px;align-items:center}
.res-actions-secondary{display:flex;gap:6px;align-items:center}

/* Stats bar */
.res-stats{display:flex;gap:0;border:1px solid rgba(22,52,34,0.08);border-radius:16px;overflow:hidden;margin:28px 0 36px;background:#ffffff}
.res-stat{flex:1;padding:18px 20px;border-right:1px solid rgba(22,52,34,0.07);text-align:center}
.res-stat:last-child{border-right:none}
.res-stat-val{font-family:'Garet',sans-serif;font-size:24px;font-weight:400;color:#163422;line-height:1;margin-bottom:4px}
.res-stat-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:rgba(22,52,34,0.35);font-weight:600;font-family:'Plus Jakarta Sans',sans-serif}

/* Tabs */
.res-tabs{display:flex;gap:0;border-bottom:1px solid rgba(22,52,34,0.08);margin-bottom:40px}
.res-tab{background:none;border:none;border-bottom:2px solid transparent;padding:12px 24px;font-family:'Garet',sans-serif;font-size:13px;font-weight:400;color:rgba(22,52,34,0.4);cursor:pointer;transition:all .2s;margin-bottom:-1px;letter-spacing:.01em}
.res-tab.active{color:#163422;border-bottom-color:#163422}
.res-tab:hover{color:#163422}

/* Strategy editorial block */
.strat-box{padding:36px 0;margin-bottom:40px;border-bottom:1px solid rgba(22,52,34,0.06)}
.strat-lbl{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(22,52,34,0.3);margin-bottom:16px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif}
.strat-txt{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;font-style:italic;color:#163422;line-height:1.65;letter-spacing:-.01em;max-width:780px}
.feasibility-box{background:rgba(255,248,235,0.8);border:1px solid rgba(180,120,30,0.18);border-left:3px solid #b87820;border-radius:16px;padding:18px 24px;margin-bottom:28px}
.feasibility-lbl{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(160,100,20,0.65);margin-bottom:8px;font-weight:600}
.feasibility-txt{font-size:13px;line-height:1.8;color:rgba(120,75,15,0.85)}

/* Section banners */
.sec-banner{font-family:'Garet',sans-serif;font-size:13px;font-weight:400;color:rgba(22,52,34,0.4);margin-bottom:32px;padding-bottom:14px;border-bottom:1px solid rgba(22,52,34,0.07);letter-spacing:.08em;text-transform:uppercase}

/* Category */
.cat-sec{margin-bottom:56px;position:relative}
.cat-hdr{display:flex;align-items:baseline;gap:14px;margin-bottom:24px;padding:16px 0;border-bottom:1px solid rgba(22,52,34,0.06);position:sticky;top:69px;background:#f9faf8;z-index:10}
.cat-icon{font-size:14px;opacity:.5}
.cat-name{font-family:'Garet',sans-serif;font-size:18px;font-weight:400;color:#163422;letter-spacing:.01em}
.cat-cnt{font-size:10px;color:rgba(22,52,34,0.4);background:rgba(22,52,34,0.06);border-radius:9999px;padding:3px 10px;letter-spacing:.04em;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif}

/* Plant cards */
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;background:transparent}
.pc{background:#ffffff;padding:0;transition:all .25s;border-radius:16px;border:1px solid rgba(22,52,34,0.08);overflow:hidden;position:relative}
.pc:hover{border-color:rgba(22,52,34,0.18);box-shadow:0 8px 28px rgba(22,52,34,0.09);transform:translateY(-1px)}
.pc-img-wrap{width:100%;height:130px;overflow:hidden;background:rgba(22,52,34,0.04);position:relative;flex-shrink:0}
.pc-img-wrap img{width:100%;height:100%;object-fit:cover;display:block}
.pc-img-placeholder{width:100%;height:100%;background:#ffffff}
.pc-body{padding:16px 18px 18px}
.pc-common{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:500;font-style:italic;color:#163422;margin-bottom:2px;letter-spacing:-.01em;line-height:1.2}
.pc-sci{font-style:italic;font-size:10px;color:#99baa1;margin-bottom:14px;font-weight:400;letter-spacing:.01em}
.pc-key-specs{display:flex;gap:8px;margin-bottom:14px}
.pc-spec{flex:1;background:#f7f8f6;padding:8px 10px;border-radius:10px;text-align:center}
.pc-spec-val{font-size:11px;font-weight:600;color:#163422;line-height:1.2;margin-bottom:2px}
.pc-spec-key{font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:rgba(22,52,34,0.35);font-weight:600}
.pc-water{display:flex;gap:3px;justify-content:center;margin-bottom:4px}
.pc-drop{font-size:11px;opacity:.2}
.pc-drop.filled{opacity:1}
.pbadges{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px}
.bp{font-size:9px;padding:3px 9px;border-radius:9999px;letter-spacing:.03em;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif}
.bp-g{background:rgba(200,235,208,0.5);color:#163422;border:1px solid rgba(22,52,34,0.1)}
.bp-a{background:rgba(255,243,215,0.7);color:#7a4f0a;border:1px solid rgba(180,120,30,0.18)}
.bp-b{background:rgba(210,225,250,0.6);color:#1a3870;border:1px solid rgba(50,90,190,0.14)}
.bp-p{background:rgba(235,215,250,0.6);color:#4a1870;border:1px solid rgba(120,50,190,0.14)}
.bp-t{background:rgba(200,245,225,0.55);color:#0a4228;border:1px solid rgba(20,130,80,0.14)}
.pnote{font-size:11px;color:#4c644e;line-height:1.6;border-top:1px solid rgba(22,52,34,0.06);padding-top:10px;font-style:italic;opacity:.8}
.pc-actions{display:flex;gap:6px;margin-top:12px;opacity:0;transition:opacity .2s}
.pc:hover .pc-actions{opacity:1}
.pc-act-btn{flex:1;background:transparent;border:1px solid rgba(22,52,34,0.12);border-radius:8px;padding:7px 10px;font-size:10px;color:rgba(22,52,34,0.5);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;transition:all .18s;letter-spacing:.03em}
.pc-act-btn:hover{background:rgba(22,52,34,0.05);color:#163422;border-color:rgba(22,52,34,0.22)}
.pc-act-btn.danger:hover{background:rgba(220,40,40,0.05);color:rgba(180,20,20,0.8);border-color:rgba(220,40,40,0.2)}

/* Hardscape cards */
.hd-section{margin-bottom:48px}
.hd-sec-title{font-family:'Garet',sans-serif;font-size:14px;font-weight:400;color:rgba(22,52,34,0.5);margin-bottom:16px;display:flex;align-items:center;gap:10px;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(22,52,34,0.06);padding-bottom:12px}
.hd-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;background:transparent}
.hd-card{background:#ffffff;padding:0;transition:all .25s;border-radius:16px;border:1px solid rgba(22,52,34,0.08);overflow:hidden}
.hd-card:hover{border-color:rgba(22,52,34,0.18);box-shadow:0 8px 28px rgba(22,52,34,0.09);transform:translateY(-1px)}
.hd-card-swatch{height:52px;width:100%;flex-shrink:0}
.hd-card-body{padding:16px 18px 18px}
.hd-card-name{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:500;font-style:italic;color:#163422;margin-bottom:2px;letter-spacing:-.01em}
.hd-card-sub{font-size:10px;color:#99baa1;margin-bottom:14px;font-style:italic;font-weight:400;letter-spacing:.01em}
.hd-attrs{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:12px}
.hd-attr{background:#f7f8f6;padding:8px 10px;border-radius:10px}
.hd-attr-k{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:rgba(22,52,34,0.35);margin-bottom:2px;font-weight:600}
.hd-attr-v{font-size:11px;color:#163422;font-weight:500}
.hd-note{font-size:11px;color:#4c644e;line-height:1.6;border-top:1px solid rgba(22,52,34,0.06);padding-top:10px;font-style:italic;opacity:.8}

/* Alternatives */
.alt-sec{margin-top:40px;background:#f7f8f6;border:1px solid rgba(22,52,34,0.06);padding:28px;border-radius:20px}
.alt-title{font-family:'Cormorant Garamond',serif;font-size:22px;color:#163422;margin-bottom:18px;font-weight:400;font-style:italic;letter-spacing:-.01em}
.alt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.alt-item{background:#ffffff;padding:14px;border-radius:12px;border:1px solid rgba(22,52,34,0.06);transition:box-shadow .2s}
.alt-item:hover{box-shadow:0 2px 12px rgba(22,52,34,0.07)}
.alt-c{font-family:'Cormorant Garamond',serif;font-size:16px;color:#163422;margin-bottom:2px;font-weight:500;font-style:italic}
.alt-s{font-style:italic;font-size:10px;color:#99baa1;margin-bottom:5px}
.alt-r{font-size:11px;color:#4c644e;line-height:1.5}

@media print{
  .hdr,.res-actions-primary,.res-actions-secondary,.pc-actions,.toast{display:none!important}
  .res-wrap{padding:0 20px}
  .pc,.hd-card{break-inside:avoid;box-shadow:none!important;border:1px solid #ddd!important;transform:none!important}
  .cat-hdr{position:static!important;background:white!important}
  .res-tabs{display:none!important}
}

.btn-reset{background:transparent;border:1px solid rgba(232,240,232,0.14);border-radius:6px;color:rgba(232,240,232,0.4);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:500;padding:8px 18px;transition:all .2s}
.btn-reset:hover{border-color:rgba(232,240,232,0.32);color:rgba(232,240,232,0.75)}
.btn-action{background:rgba(232,240,232,0.07);border:1px solid rgba(232,240,232,0.14);border-radius:6px;color:rgba(232,240,232,0.5);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:500;padding:8px 18px;transition:all .2s}
.btn-action:hover{background:rgba(232,240,232,0.14);border-color:rgba(232,240,232,0.3);color:#e8f0e8}
.btn-save{background:linear-gradient(135deg,#163422,#2d4b37);border:none;border-radius:9999px;color:#ffffff;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;padding:9px 18px;transition:all .2s;box-shadow:0 1px 6px rgba(22,52,34,0.18)}
.btn-save:hover{opacity:.9}
.btn-save:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.btn-pdf{background:linear-gradient(135deg,#163422,#2d4b37);border:none;border-radius:9999px;color:#ffffff;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;padding:9px 18px;transition:all .2s;box-shadow:0 1px 6px rgba(22,52,34,0.18)}
.btn-pdf:hover{opacity:.9}

.tbl-header-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px}
.tbl-title{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:400;font-style:italic;color:#163422;letter-spacing:-.01em}
.tbl-wrap{overflow-x:auto;border:1px solid rgba(22,52,34,0.08);border-radius:16px;overflow:hidden}
table{width:100%;border-collapse:collapse;font-size:11px;min-width:1100px}
thead{background:#f3f4f2}
th{padding:11px 13px;text-align:left;font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:rgba(22,52,34,0.4);font-weight:700;border-bottom:1px solid rgba(22,52,34,0.06);white-space:nowrap}
td{padding:10px 13px;color:#4c644e;border-bottom:1px solid rgba(22,52,34,0.04);vertical-align:top;line-height:1.5}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(22,52,34,0.015)}
.td-sci{font-style:italic;color:#99baa1}
.td-cat-hdr td{background:rgba(200,235,208,0.2);color:#163422;font-weight:700;font-size:9px;letter-spacing:.1em;text-transform:uppercase;border-top:1px solid rgba(22,52,34,0.06);border-bottom:1px solid rgba(22,52,34,0.06);padding:8px 13px}
.td-traits{display:flex;flex-wrap:wrap;gap:4px}
.td-t{font-size:8px;padding:2px 8px;border-radius:9999px;background:rgba(200,235,208,0.35);color:#163422;border:1px solid rgba(22,52,34,0.08);white-space:nowrap;letter-spacing:.04em;text-transform:uppercase;font-weight:700}

.hd-section{margin-bottom:40px}
.hd-sec-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;font-style:italic;color:#163422;margin-bottom:16px;display:flex;align-items:center;gap:10px;letter-spacing:-.01em}
.hd-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;background:transparent}
.hd-card{background:#ffffff;padding:20px;transition:all .2s;border-radius:20px;border:1px solid rgba(22,52,34,0.08)}
.hd-card:hover{border-color:rgba(22,52,34,0.16);box-shadow:0 4px 20px rgba(22,52,34,0.07)}
.hd-card-name{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:500;font-style:italic;color:#163422;margin-bottom:3px;letter-spacing:-.01em}
.hd-card-sub{font-size:11px;color:#99baa1;margin-bottom:14px;font-style:italic;font-weight:400}
.hd-attrs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.hd-attr{background:#f3f4f2;padding:8px 10px;border-radius:10px}
.hd-attr-k{font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:rgba(22,52,34,0.35);margin-bottom:2px;font-weight:600}
.hd-attr-v{font-size:12px;color:#163422;font-weight:500}
.hd-note{font-size:11px;color:#4c644e;line-height:1.6;border-top:1px solid rgba(22,52,34,0.06);padding-top:10px;font-style:italic;opacity:.8}

.alt-sec{margin-top:40px;background:#f3f4f2;border:1px solid rgba(22,52,34,0.06);padding:28px;border-radius:20px}
.alt-title{font-family:'Cormorant Garamond',serif;font-size:24px;color:#163422;margin-bottom:18px;font-weight:400;font-style:italic;letter-spacing:-.01em}
.alt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.alt-item{background:#ffffff;padding:14px;border-radius:12px;border:1px solid rgba(22,52,34,0.06)}
.alt-c{font-family:'Cormorant Garamond',serif;font-size:16px;color:#163422;margin-bottom:2px;font-weight:500;font-style:italic}
.alt-s{font-style:italic;font-size:10px;color:#99baa1;margin-bottom:5px}
.alt-r{font-size:11px;color:#4c644e;line-height:1.5}

.divider{border:none;border-top:1px solid rgba(22,52,34,0.06);margin:40px 0}
.err{background:rgba(220,40,40,0.04);border:1px solid rgba(220,40,40,0.14);border-radius:12px;color:rgba(170,25,25,0.8);font-size:12px;padding:14px 18px;margin-top:14px;line-height:1.6}
.err-page{min-height:calc(100vh - 69px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px}
.err-page-icon{font-size:48px;margin-bottom:24px}
.err-page-title{font-family:'Garet',sans-serif;font-size:32px;font-weight:400;color:#1a1a1a;margin-bottom:12px}
.err-page-msg{font-size:14px;color:rgba(26,26,26,0.5);line-height:1.8;max-width:480px;margin-bottom:36px}
.err-page-actions{display:flex;gap:12px}

@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ── Page enter ── */
@keyframes appIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.app{animation:appIn .35s ease-out}

/* ── Step fade ── */
@keyframes stepIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes stepOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-8px)}}
.step-visible{animation:stepIn .22s ease-out forwards}
.step-hidden{animation:stepOut .15s ease-in forwards;pointer-events:none}

/* ── Dot progress ── */
.step-dots{display:flex;gap:7px;align-items:center;padding:0 56px 36px;margin-top:-12px}
.step-dot{width:6px;height:6px;border-radius:9999px;background:rgba(22,52,34,0.1);transition:all .3s ease;flex-shrink:0}
.step-dot.active{width:22px;background:#163422}
.step-dot.done{background:rgba(22,52,34,0.3)}
@media(max-width:900px){.step-dots{padding:0 24px 28px}}

/* ── Toast ── */
@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes toastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(6px)}}
.toast{position:fixed;bottom:28px;right:28px;background:#163422;color:#c8ebd0;padding:14px 22px;border-radius:14px;font-size:13px;font-weight:500;z-index:300;box-shadow:0 8px 32px rgba(22,52,34,0.3);display:flex;align-items:center;gap:10px;font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:.01em;animation:toastIn .25s ease-out}
.toast-icon{width:20px;height:20px;background:rgba(200,235,208,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}

/* ── Btn spinner ── */
@keyframes spin{to{transform:rotate(360deg)}}
.btn-spinner{width:13px;height:13px;border:2px solid rgba(200,235,208,0.25);border-top-color:rgba(200,235,208,0.8);border-radius:50%;animation:spin .75s linear infinite;display:inline-block;vertical-align:middle;margin-right:4px}

/* ── Mobile nav ── */
.hdr-mobile-menu{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;background:none;border:none}
.hdr-mobile-menu span{width:20px;height:1.5px;background:rgba(232,240,232,0.6);border-radius:2px;display:block;transition:all .2s}
.mobile-dropdown{display:none;position:absolute;top:100%;right:0;background:#163422;border:1px solid rgba(200,235,208,0.1);border-radius:12px;padding:8px;min-width:160px;box-shadow:0 8px 32px rgba(0,0,0,0.2);z-index:99;margin-top:6px}
.mobile-dropdown button{display:block;width:100%;padding:10px 16px;background:none;border:none;color:rgba(232,240,232,0.65);font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;cursor:pointer;text-align:left;border-radius:8px;transition:background .15s}
.mobile-dropdown button:hover{background:rgba(200,235,208,0.08);color:#e8f0e8}
.hdr-nav-wrap{display:flex;align-items:center;gap:10px;position:relative}

@media(max-width:600px){
  .hdr{padding:14px 20px}.main,.res-wrap{padding:32px 16px 60px}
  .g2,.div-cards,.harm-grid,.pt-grid{grid-template-columns:1fr}.mood-grid{grid-template-columns:1fr 1fr}
  .cards,.hd-cards,.alt-grid{grid-template-columns:1fr}.res-title{font-size:30px}.stp-title{font-size:36px}
  .hdr-btns{display:none}
  .hdr-mobile-menu{display:flex}
  .stp-title{font-size:38px}
}`;

const togArr=(a,v)=>a.includes(v)?a.filter(x=>x!==v):[...a,v];
function Bdg({text,type="g"}){return <span className={`bp bp-${type}`}>{text}</span>;}
function ColorDot({c}){const v=COLOR_HEX[c]||"#888";const g=v.startsWith("linear");return <span className="cdot" style={{background:g?undefined:v,backgroundImage:g?v:undefined}}/>;}

const imageCache = {};
function usePlantImage(scientificName) {
  const [imgUrl, setImgUrl] = useState(null);
  useEffect(() => {
    if (!scientificName) return;
    if (imageCache[scientificName]) { setImgUrl(imageCache[scientificName]); return; }
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName)}`)
      .then(r => r.json())
      .then(data => { const url = data?.thumbnail?.source || null; imageCache[scientificName] = url; setImgUrl(url); })
      .catch(() => setImgUrl(null));
  }, [scientificName]);
  return imgUrl;
}
function AltCard({ alt, onSelect }) {
  const imgUrl = usePlantImage(alt.scientificName || alt.commonName);
  return (
    <div style={{background:'#ffffff',border:'1px solid rgba(22,52,34,0.08)',borderRadius:'16px',marginBottom:'10px',overflow:'hidden'}}>
      {imgUrl
        ? <img src={imgUrl} alt={alt.commonName} style={{width:'100%',height:'140px',objectFit:'cover',objectPosition:'center',display:'block'}}/>
        : <div style={{width:'100%',height:'140px',background:'linear-gradient(135deg,#e8f4e8,#f3f7f0)'}}></div>
      }
      <div style={{padding:'14px'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'15px',fontWeight:700,color:'#163422',marginBottom:2,letterSpacing:'-.01em'}}>{alt.commonName}</div>
        {alt.scientificName&&<div style={{fontStyle:'italic',fontSize:'11px',color:'#99baa1',marginBottom:8}}>{alt.scientificName}</div>}
        <div style={{fontSize:'11px',color:'#4c644e',marginBottom:12,lineHeight:1.7}}>{alt.reason}</div>
        <button onClick={onSelect} style={{width:'100%',padding:'10px',border:'none',background:'linear-gradient(135deg,#163422,#2d4b37)',color:'#ffffff',fontSize:'11px',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'.06em',textTransform:'uppercase',fontWeight:700,borderRadius:'9999px'}}>
          Use this plant
        </button>
      </div>
    </div>
  );
}

function PlantCard({p, onRemove, onReplace}){
  const imgUrl = usePlantImage(p.scientificName);

  // Water level: Low=1, Moderate=2, High=3
  const waterLevel = p.water==='Low'?1:p.water==='High'?3:2;

  // Height display
  const heightDisplay = p.controllableHeight || p.maxHeight || '—';

  // Form display
  const formDisplay = p.form ? p.form.split('/')[0].trim() : '—';

  if(p.loading) return (
    <div className="pc">
      <div className="pc-img-wrap" style={{background:'linear-gradient(90deg,#f0f2ef 25%,#e8ece7 50%,#f0f2ef 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>
      <div className="pc-body">
        <div style={{height:16,background:'linear-gradient(90deg,#f0f2ef 25%,#e8ece7 50%,#f0f2ef 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite',borderRadius:6,marginBottom:8,width:'70%'}}/>
        <div style={{height:10,background:'linear-gradient(90deg,#f0f2ef 25%,#e8ece7 50%,#f0f2ef 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite',borderRadius:6,width:'45%'}}/>
      </div>
    </div>
  );

  const badges=[];
  if(p.evergreen)badges.push({l:'Evergreen',c:'bp-g'});
  if(p.nativeLocal)badges.push({l:'Native',c:'bp-t'});
  if(p.droughtTolerant)badges.push({l:'Drought Tolerant',c:'bp-a'});
  if(p.saltTolerant)badges.push({l:'Salt Tolerant',c:'bp-b'});
  if(p.humidityTolerant)badges.push({l:'Humidity',c:'bp-b'});
  if(p.windResistant)badges.push({l:'Wind Resistant',c:'bp-p'});
  if(p.slabSuitable)badges.push({l:'Slab OK',c:'bp-a'});
  if(p.fragrant)badges.push({l:'Fragrant',c:'bp-p'});
  if(p.lowMaintenance)badges.push({l:'Low Maintenance',c:'bp-g'});
  if(p.slopeStabiliser)badges.push({l:'Slope',c:'bp-t'});

  return(
    <div className="pc">
      <div className="pc-img-wrap">
        {imgUrl
          ? <img src={imgUrl} alt={p.commonName} loading="lazy"/>
          : <div className="pc-img-placeholder"></div>
        }
      </div>
      <div className="pc-body">
        <div className="pc-common">{p.commonName}</div>
        {p.scientificName&&<div className="pc-sci">{p.scientificName}</div>}
        <div className="pc-key-specs">
          <div className="pc-spec">
            <div className="pc-spec-val">{heightDisplay}</div>
            <div className="pc-spec-key">Height</div>
          </div>
          <div className="pc-spec">
            <div className="pc-water">
              {[1,2,3].map(i=><span key={i} className={`pc-drop${i<=waterLevel?' filled':''}`}>💧</span>)}
            </div>
            <div className="pc-spec-key">Water</div>
          </div>
          <div className="pc-spec">
            <div className="pc-spec-val" style={{fontSize:10}}>{formDisplay}</div>
            <div className="pc-spec-key">Form</div>
          </div>
        </div>
        {badges.length>0&&<div className="pbadges">{badges.slice(0,4).map((b,i)=><span key={i} className={`bp ${b.c}`}>{b.l}</span>)}</div>}
        {p.note&&<div className="pnote">{p.note}</div>}
        <div className="pc-actions">
          <button className="pc-act-btn" onClick={onReplace}>↻ Replace</button>
          <button className="pc-act-btn danger" onClick={onRemove}>✕ Remove</button>
        </div>
      </div>
    </div>
  );
}

function SpecTable({rows,meta}){
  const groups=[];
  rows.forEach(r=>{const last=groups[groups.length-1];if(last&&last.name===r.category)last.plants.push(r);else groups.push({name:r.category,plants:[r]});});
  let n=0;
  const handlePdf=()=>{
    const tbl=document.querySelector('.tbl-wrap');
    if(!tbl)return;
    const win=window.open('','_blank');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>LandPal. — Specification Table</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11px;color:#252e1e;background:#fff;padding:12mm}
      h1{font-size:18px;font-weight:300;margin-bottom:4px;font-family:Georgia,serif;color:#2a3a18}
      .meta{font-size:10px;color:#7a9a50;margin-bottom:14px}
      table{width:100%;border-collapse:collapse}
      th{background:#f0f7e8;padding:7px 9px;text-align:left;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#5a8040;font-weight:600;border-bottom:2px solid #c8dca8;white-space:nowrap}
      td{padding:7px 9px;border-bottom:1px solid #eef3e8;vertical-align:top;line-height:1.4;color:#3a4a28}
      .cat-row td{background:#e8f4d8;font-weight:600;font-size:10px;letter-spacing:.06em;text-transform:uppercase;border-top:2px solid #b0c890;color:#3a5820;padding:7px 9px}
      .sci{font-style:italic;color:#7a9a50}
      .traits{display:flex;flex-wrap:wrap;gap:3px}
      .trait{font-size:8px;padding:1px 5px;border-radius:5px;background:#e4f0d4;color:#4a6030;border:1px solid #c0d4a0;white-space:nowrap}
      @page{size:A3 landscape;margin:15mm}
    </style></head><body>`);
    win.document.write(`<h1>Landscape Specification Table — LandPal.</h1><div class="meta">${meta||''}</div>`);
    win.document.write(tbl.outerHTML);
    win.document.write('</body></html>');
    win.document.close();win.focus();
    setTimeout(()=>win.print(),400);
  };
  return(
    <div>
      <div className="tbl-header-row">
        <div className="tbl-title">Full Specification Table</div>
        <button className="btn-pdf" onClick={handlePdf}>↓ Download as PDF</button>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>#</th><th>Common Name</th><th>Botanical Name</th><th>Max Height</th><th>Controllable Ht.</th><th>Spread</th><th>Root Depth</th><th>Water</th><th>Bloom Colour</th><th>Bloom Season</th><th>Foliage</th><th>Form</th><th>Type</th><th>Traits</th></tr></thead>
          <tbody>
            {groups.map(group=>(
              <React.Fragment key={"g-"+group.name}>
                <tr className="td-cat-hdr"><td colSpan={14}>{CAT_ICONS[group.name]||""}&nbsp; {group.name} — {group.plants.length} species</td></tr>
                {group.plants.map((r,j)=>{n++;const num=n;return(
                  <tr key={group.name+j}>
                    <td style={{color:"#4c644e",fontWeight:600}}>{num}</td>
                    <td style={{fontWeight:600,color:"#163422"}}>{r.commonName}</td>
                    <td className="td-sci">{r.scientificName||"—"}</td>
                    <td style={{whiteSpace:'nowrap'}}>{r.maxHeight||"—"}</td><td style={{whiteSpace:'nowrap'}}>{r.controllableHeight||"—"}</td>
                    <td style={{whiteSpace:'nowrap'}}>{r.spread||"—"}</td><td style={{whiteSpace:'nowrap'}}>{r.rootDepth||"—"}</td>
                    <td style={{whiteSpace:'nowrap'}}>{r.water||"—"}</td><td>{r.bloomColor||"—"}</td>
                    <td style={{whiteSpace:'nowrap'}}>{r.bloomSeason||"—"}</td><td>{r.foliageColor||"—"}</td>
                    <td style={{whiteSpace:'nowrap'}}>{r.form||"—"}</td>
                    <td style={{whiteSpace:'nowrap'}}>{r.evergreen===true?"Evergreen":r.evergreen===false?"Deciduous":"—"}</td>
                    <td><div className="td-traits">{(r.traits||[]).map((t,k)=><span key={k} className="td-t">{t}</span>)}</div></td>
                  </tr>
                );})}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App({ session, onGoHome }){
  const[step,setStep]=useState(0);
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState(null);
  const[editableResult,setEditableResult]=useState(null);
  const[error,setError]=useState(null);
  const[showHistory,setShowHistory]=useState(false);
  const[isSaving,setIsSaving]=useState(false);
  const[isSaved,setIsSaved]=useState(false);
  const [generatingBrief, setGeneratingBrief] = useState(false)
  const[replacingPlant,setReplacingPlant]=useState(null);
  const[stepVisible,setStepVisible]=useState(true);
  const[toast,setToast]=useState(null);
  const[isGenerating,setIsGenerating]=useState(false);
  const[mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const[activeTab,setActiveTab]=useState('softscape');
  const topRef=useRef(null);

  const showToast=(msg,icon='✓')=>{setToast({msg,icon});setTimeout(()=>setToast(null),3200);};

  const goToStep=(n)=>{
    setStepVisible(false);
    setTimeout(()=>{
      setStep(n);
      setStepVisible(true);
      topRef.current?.scrollIntoView({behavior:'smooth'});
    },160);
  };

  const[form,setForm]=useState({
    country:"",region:"",
    projectType:"",diversity:"moderate",
    paletteType:"softscape",
    hasBasement:false,basementSlabDepth:"",
    hasRaisedPlanters:false,raisedPlanterHeight:"",planterHeightAiSuggest:false,
    rooftopType:"",rooftopSlabDepth:"",rooftopPlanterHeight:"",rooftopContainerSize:"",
    styles:[],plantTypes:[],
    harmony:"",mood:"",colors:[],
    bloomingTarget:[],evergreen:"",foliageTexture:[],seasonalNote:"",
    conditions:[],
    hdCharacter:"",hdOrigin:"",hdMaterials:[],hdFinishes:[],hdZones:[],hdColors:[],hdPatterns:[],
    brief:""
  });
  const[autoConditions,setAutoConditions]=useState([]);

  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const tog=(k,v)=>setForm(f=>({...f,[k]:togArr(f[k],v)}));

  useEffect(()=>{
    const auto=REGION_AUTO_CONDITIONS[form.region]||[];
    setAutoConditions(auto);
    setForm(f=>({...f,conditions:[...new Set([...auto,...f.conditions.filter(c=>!autoConditions.includes(c))])]}));
  },[form.region]);

  const setHarmony=h=>{set("harmony",h);set("colors",[]);};
  const toggleColor=c=>{
    const cur=form.colors;
    if(cur.includes(c)){set("colors",cur.filter(x=>x!==c));return;}
    if(!isChromatic(c)){set("colors",[...cur,c]);return;}
    const curCh=cur.filter(isChromatic);const anchor=curCh[0];const maxC=maxChromatic(form.harmony);
    if(curCh.length>=maxC){const nc=anchor?[anchor,...curCh.slice(1,-1),c]:[c];set("colors",[...cur.filter(x=>!isChromatic(x)),...nc]);}
    else set("colors",[...cur,c]);
  };

  const styleState=s=>{
    if(form.styles.length===0)return"open";
    if(form.styles.includes(s))return"on";
    return form.styles.every(sel=>(STYLE_COMPAT[sel]||[]).includes(s))?"open":"dim";
  };

  const isRooftop=form.projectType==="Rooftop Garden";
  const regions=COUNTRY_SUB_REGIONS[form.country]||[];

  const getStepDefs=pt=>{
    const base=[{id:"location",label:"Location"},{id:"project",label:"Project"},{id:"palette-type",label:"Type"}];
    const soft=[
      {id:"style",label:"Style",section:"Softscape"},
      {id:"plants",label:"Plants",section:"Softscape"},
      {id:"colour",label:"Colour",section:"Softscape"},
      {id:"conditions",label:"Conditions",section:"Softscape"},
    ];
    const hard=[
      {id:"hd-materials",label:"Materials",section:"Hardscape"},
      {id:"hd-zones",label:"Zones",section:"Hardscape"},
    ];
    const end=[{id:"brief",label:"Brief"}];
    if(pt==="softscape")return[...base,...soft,...end];
    if(pt==="hardscape")return[...base,...hard,...end];
    if(pt==="both")return[...base,...soft,...hard,...end];
    return base;
  };
  const stepDefs=getStepDefs(form.paletteType);
  const currentId=stepDefs[step]?.id;
  const totalSteps=stepDefs.length;
  const isLast=step===totalSteps-1;

  const buildSoftPrompt=()=>{
    let slabCtx="In-ground planting — no basement slab";
    if(isRooftop){
      if(form.rooftopType==="slab")slabCtx=`Rooftop on concrete slab — soil depth: ${form.rooftopSlabDepth||"unspecified"}`;
      else if(form.rooftopType==="fixed-planter")slabCtx=`Rooftop with fixed built-in planters — base depth: ${form.rooftopSlabDepth||"unspecified"}, planter height: ${form.rooftopPlanterHeight||"AI to suggest"}`;
      else if(form.rooftopType==="movable")slabCtx=`Rooftop with movable containers — max size: ${form.rooftopContainerSize||"unspecified"}`;
    }else if(form.hasBasement){
      const ph=form.planterHeightAiSuggest?"AI to suggest (typical: 60cm shrubs, 1.2m trees, 1.5m palms)":(form.raisedPlanterHeight||"unspecified");
      slabCtx=`Basement slab under planting — base soil depth: ${form.basementSlabDepth||"unspecified"}${form.hasRaisedPlanters?`. Fixed raised planters in design — planter wall height: ${ph}. Total = base + planter height.`:""}`;
    }
    return[
      "You are a senior landscape architect and horticulturalist. Generate a complete plant palette. Return ONLY valid JSON — no markdown, no preamble.",
      `COUNTRY: ${form.country||"Not specified"}`,`REGION: ${form.region||"Not specified"}`,
      `PROJECT TYPE: ${form.projectType||"Not specified"}`,`DIVERSITY: ${form.diversity}`,
      `PLANTING CONTEXT: ${slabCtx}`,
      `STYLE(S): ${form.styles.join(", ")||"Not specified"}`,
      `PLANT TYPES: ${form.plantTypes.join(", ")||"All appropriate"}`,
      `COLOURS: ${form.colors.join(", ")||"Not specified"}`,`HARMONY: ${form.harmony||"Not specified"}`,
      `MOOD: ${form.mood||"Not specified"}`,`BLOOM SEASONS: ${form.bloomingTarget.join(", ")||"Not specified"}`,
      `EVERGREEN/DECIDUOUS: ${form.evergreen||"No preference"}`,
      `FOLIAGE TEXTURE: ${form.foliageTexture.join(", ")||"Not specified"}`,
      form.seasonalNote?`SEASONAL NOTE: ${form.seasonalNote}`:"",
      `CONDITIONS: ${form.conditions.join(", ")||"None"}`,
      `BRIEF: ${form.brief||"General landscape design"}`,
      `\nFEASIBILITY: Prioritise (1) climate tolerances, (2) slab/root depth, (3) functional needs, (4) aesthetics. Never leave categories empty. Add feasibilityNotes if any trade-offs were made.\n\nReturn valid JSON only — no markdown:\n{"strategy":"string","feasibilityNotes":"null or string","categories":[{"name":"string","plants":[{"commonName":"","scientificName":"","maxHeight":"","controllableHeight":"","spread":"","rootDepth":"","form":"","water":"Very Low/Low/Moderate/High","foliageColor":"","foliageTexture":"","bloomColor":"null or string","bloomSeason":"null or Spring/Summer/Autumn/Winter/Year-round","evergreen":true,"saltTolerant":false,"droughtTolerant":false,"humidityTolerant":false,"windResistant":false,"slabSuitable":false,"nativeLocal":false,"lowMaintenance":false,"fragrant":false,"slopeStabiliser":false,"note":"one sentence"}]}],"alternatives":[{"commonName":"","scientificName":"","reason":""}]}\nMax 5 alternatives. Notes must be one short sentence.`
    ].filter(Boolean).join("\n");
  };

  const buildHardPrompt=()=>[
    "You are a senior landscape architect specialising in hardscape and material specification. Generate a complete hardscape material palette. Return ONLY valid JSON — no markdown, no preamble.",
    `COUNTRY / REGION: ${form.country||"Not specified"} — ${form.region||"Not specified"}`,
    `PROJECT TYPE: ${form.projectType||"Not specified"}`,
    `MATERIAL CHARACTER: ${form.hdCharacter||"Not specified"}`,
    `MATERIAL ORIGIN: ${form.hdOrigin||"Not specified"}`,
    `PREFERRED MATERIALS: ${form.hdMaterials.join(", ")||"AI to suggest"}`,
    `PREFERRED FINISHES: ${form.hdFinishes.join(", ")||"Not specified"}`,
    `USAGE ZONES: ${form.hdZones.join(", ")||"All typical zones"}`,
    `COLOUR PALETTE: ${form.hdColors.map(c=>c.label||c).join(", ")||"Not specified"}`,
    `PATTERNS: ${form.hdPatterns.join(", ")||"Not specified"}`,
    form.styles.length?`SOFTSCAPE STYLE (coordinate with): ${form.styles.join(", ")}`:"",
    `BRIEF: ${form.brief||"General landscape hardscape"}`,
    `\nReturn valid JSON only — no markdown:\n{"hardscapeStrategy":"string","hardscapeCategories":[{"zone":"string","materials":[{"name":"","type":"Natural Stone/Manufactured/Wood & Composite","origin":"Local/Imported/Either","finish":"","color":"","size":"","pattern":"","slipResistance":"High/Medium/Low","heatRetention":"High/Medium/Low","maintenance":"Low/Medium/High","cost":"Budget/Mid-range/Premium","note":"one sentence"}]}],"hardscapeAlternatives":[{"name":"","reason":""}]}\nMax 5 alternatives.`
  ].filter(Boolean).join("\n");

  const callAPI=async prompt=>{
    let res;
    try{
      res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt})});
    }catch(err){
      if(err.message.includes('Failed to fetch')||err.message.includes('NetworkError'))
        throw new Error('Could not reach the server. Please check your connection and try again.');
      throw err;
    }
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||"API error");
    const clean=data.text.replace(/```json[\s\S]*?```/g,m=>m.slice(7,-3)).replace(/```/g,"").trim();
    try{return JSON.parse(clean);}
    catch(e){
      let fixed=clean;
      const opens=[...fixed].reduce((acc,c)=>{if(c==="{")acc.push("}");else if(c==="[")acc.push("]");else if(c==="}"||c==="]")acc.pop();return acc;},[]);
      fixed+=opens.reverse().join("");
      try{return JSON.parse(fixed);}
      catch(e2){throw new Error("Response was too long and could not be parsed. Try reducing palette diversity to Moderate or Minimal.");}
    }
  };

  const rebuildSpecTable = (categories) => {
    return (categories || []).flatMap(cat =>
      (cat.plants || []).map(p => ({
        commonName: p.commonName,
        scientificName: p.scientificName,
        category: cat.name,
        maxHeight: p.maxHeight,
        controllableHeight: p.controllableHeight,
        spread: p.spread,
        rootDepth: p.rootDepth,
        water: p.water,
        bloomColor: p.bloomColor,
        bloomSeason: p.bloomSeason,
        foliageColor: p.foliageColor,
        form: p.form,
        evergreen: p.evergreen,
        traits: [
          p.saltTolerant && 'Salt Tolerant',
          p.droughtTolerant && 'Drought Tolerant',
          p.humidityTolerant && 'Humidity Tolerant',
          p.windResistant && 'Wind Resistant',
          p.slabSuitable && 'Slab Suitable',
          p.fragrant && 'Fragrant',
          p.lowMaintenance && 'Low Maintenance',
          p.nativeLocal && 'Native / Local',
          p.slopeStabiliser && 'Slope Stabiliser',
        ].filter(Boolean)
      }))
    );
  };

  const removePlant = (catName, plantIndex) => {
    setEditableResult(prev => {
      const removedPlant = prev.categories.find(c => c.name === catName)?.plants[plantIndex];
      const updatedCategories = prev.categories.map(cat =>
        cat.name === catName
          ? { ...cat, plants: cat.plants.filter((_, i) => i !== plantIndex) }
          : cat
      );
      return {
        ...prev,
        categories: updatedCategories,
        specTable: rebuildSpecTable(updatedCategories),
        alternatives: removedPlant
          ? [...(prev.alternatives || []), { commonName: removedPlant.commonName, scientificName: removedPlant.scientificName, reason: 'Previously removed from palette' }]
          : (prev.alternatives || [])
      };
    });
    setIsSaved(false);
  };

  const replacePlant = async (catName, plantIndex, alt) => {
  setReplacingPlant(null)
  const placeholder = { commonName: alt.commonName, scientificName: alt.scientificName || '', loading: true, category: catName }
  setEditableResult(prev => {
    const updatedCategories = prev.categories.map(cat =>
      cat.name === catName
        ? { ...cat, plants: cat.plants.map((p, i) => i === plantIndex ? placeholder : p) }
        : cat
    )
    return { ...prev, categories: updatedCategories, alternatives: (prev.alternatives || []).filter(a => a.commonName !== alt.commonName) }
  })
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `You are a senior landscape architect. Return ONLY valid JSON — no markdown, no preamble.\n\nGive me the full horticultural data for this plant:\nCommon name: ${alt.commonName}\nScientific name: ${alt.scientificName || ''}\nContext: ${form.country}, ${form.region}, ${form.projectType}\n\nReturn exactly this JSON structure:\n{"commonName":"","scientificName":"","maxHeight":"","controllableHeight":"","spread":"","rootDepth":"","form":"","water":"Low/Moderate/High","foliageColor":"","foliageTexture":"","bloomColor":"","bloomSeason":"","evergreen":true,"saltTolerant":false,"droughtTolerant":false,"humidityTolerant":false,"windResistant":false,"slabSuitable":false,"nativeLocal":false,"lowMaintenance":false,"fragrant":false,"slopeStabiliser":false,"note":"one sentence justification"}` })
    })
    const data = await res.json()
    const clean = data.text.replace(/```json[\s\S]*?```/g, m => m.slice(7,-3)).replace(/```/g,'').trim()
    const fullPlant = { ...JSON.parse(clean), category: catName }
    setEditableResult(prev => {
      const updatedCategories = prev.categories.map(cat =>
        cat.name === catName
          ? { ...cat, plants: cat.plants.map(p => p.commonName === placeholder.commonName && p.loading ? fullPlant : p) }
          : cat
      )
      return { ...prev, categories: updatedCategories, specTable: rebuildSpecTable(updatedCategories) }
    })
  } catch (e) {
    setError('Could not fetch plant details. Please try again.')
  }
  setIsSaved(false)
}

 const addPlant = async (catName, alt) => {
  const placeholder = { commonName: alt.commonName, scientificName: alt.scientificName || '', loading: true, category: catName }
  setEditableResult(prev => {
    const updatedCategories = prev.categories.map(cat =>
      cat.name === catName
        ? { ...cat, plants: [...cat.plants, placeholder] }
        : cat
    )
    return { ...prev, categories: updatedCategories, alternatives: (prev.alternatives || []).filter(a => a.commonName !== alt.commonName) }
  })
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `You are a senior landscape architect. Return ONLY valid JSON — no markdown, no preamble.\n\nGive me the full horticultural data for this plant:\nCommon name: ${alt.commonName}\nScientific name: ${alt.scientificName || ''}\nContext: ${form.country}, ${form.region}, ${form.projectType}\n\nReturn exactly this JSON structure:\n{"commonName":"","scientificName":"","maxHeight":"","controllableHeight":"","spread":"","rootDepth":"","form":"","water":"Low/Moderate/High","foliageColor":"","foliageTexture":"","bloomColor":"","bloomSeason":"","evergreen":true,"saltTolerant":false,"droughtTolerant":false,"humidityTolerant":false,"windResistant":false,"slabSuitable":false,"nativeLocal":false,"lowMaintenance":false,"fragrant":false,"slopeStabiliser":false,"note":"one sentence justification"}` })
    })
    const data = await res.json()
    const clean = data.text.replace(/```json[\s\S]*?```/g, m => m.slice(7,-3)).replace(/```/g,'').trim()
    const fullPlant = { ...JSON.parse(clean), category: catName }
    setEditableResult(prev => {
      const updatedCategories = prev.categories.map(cat =>
        cat.name === catName
          ? { ...cat, plants: cat.plants.map(p => p.commonName === placeholder.commonName && p.loading ? fullPlant : p) }
          : cat
      )
      return { ...prev, categories: updatedCategories, specTable: rebuildSpecTable(updatedCategories) }
    })
  } catch (e) {
    setError('Could not fetch plant details. Please try again.')
  }
  setIsSaved(false)
}
  const autoGenerateBrief = async () => {
  setGeneratingBrief(true)
  setError(null)
  try {
    const prompt = `You are a senior landscape architect. Based on the following project parameters, write a concise professional design brief of 3-5 sentences that summarises the project intent, key design priorities, and any important constraints. Write it as if you are the designer briefing a colleague.

COUNTRY: ${form.country||'Not specified'}
REGION: ${form.region||'Not specified'}
PROJECT TYPE: ${form.projectType||'Not specified'}
STYLE(S): ${form.styles.join(', ')||'Not specified'}
PLANT TYPES: ${form.plantTypes.join(', ')||'All appropriate'}
COLOURS: ${form.colors.join(', ')||'Not specified'}
MOOD: ${form.mood||'Not specified'}
CONDITIONS: ${form.conditions.join(', ')||'None'}
DIVERSITY: ${form.diversity}
ON SLAB: ${form.hasBasement ? 'Yes, basement slab — soil depth ' + form.basementSlabDepth : 'No'}

Write only the brief text, no headings or labels.`

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    let data
    try { data = await res.json() } catch { throw new Error('Server returned an invalid response. Is the local API server running on port 3001?') }
    if (!res.ok) throw new Error(data?.error || `Server error ${res.status}`)
    if (data.text) set('brief', data.text.trim())
    else throw new Error('No text returned from API')
  } catch (e) {
    setError('Auto-generate failed: ' + e.message)
  } finally {
    setGeneratingBrief(false)
  }
}
  const handleSave = async () => {
    if (isSaving || isSaved) return;
    setIsSaving(true);
    try {
      const title = [form.country, form.region, form.projectType].filter(Boolean).join(' · ');
      await savePalette(session.user.id, title, form, editableResult);
      setIsSaved(true);
      showToast('Palette saved successfully');
    } catch (e) {
      setError('Could not save palette. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPalette = (p) => {
    setForm(p.params);
    setResult(p.result);
    setEditableResult(p.result);
    setIsSaved(true);
  };

  const generate=async()=>{
    setIsGenerating(true);
    await new Promise(r=>setTimeout(r,200));
    setLoading(true);setError(null);setResult(null);setEditableResult(null);setIsGenerating(false);
    topRef.current?.scrollIntoView({behavior:"smooth"});
    try{
      let combined={};
      if(form.paletteType==="softscape"||form.paletteType==="both"){
        const soft=await callAPI(buildSoftPrompt());
        const specTable=(soft.categories||[]).flatMap(cat=>(cat.plants||[]).map(p=>({
          commonName:p.commonName,scientificName:p.scientificName,category:cat.name,
          maxHeight:p.maxHeight,controllableHeight:p.controllableHeight,spread:p.spread,
          rootDepth:p.rootDepth,water:p.water,bloomColor:p.bloomColor,bloomSeason:p.bloomSeason,
          foliageColor:p.foliageColor,form:p.form,evergreen:p.evergreen,
          traits:[p.saltTolerant&&"Salt Tolerant",p.droughtTolerant&&"Drought Tolerant",
            p.humidityTolerant&&"Humidity Tolerant",p.windResistant&&"Wind Resistant",
            p.slabSuitable&&"Slab Suitable",p.fragrant&&"Fragrant",p.lowMaintenance&&"Low Maintenance",
            p.nativeLocal&&"Native / Local",p.slopeStabiliser&&"Slope Stabiliser"].filter(Boolean)
        })));
        combined={...combined,...soft,specTable};
      }
      if(form.paletteType==="hardscape"||form.paletteType==="both"){
        const hard=await callAPI(buildHardPrompt());
        combined={...combined,hardscapeStrategy:hard.hardscapeStrategy,
          hardscapeCategories:hard.hardscapeCategories,hardscapeAlternatives:hard.hardscapeAlternatives};
      }
      setResult(combined);
      setEditableResult(combined);
      setIsSaved(false);
    }catch(e){setError("Generation failed: "+e.message);}
    finally{setLoading(false);}
  };

  const meta=[form.country,form.region?.replace("__c:",""),form.projectType,...form.styles].filter(Boolean).join(" · ");

  const stepMap={
    "location":()=>(
      <>
        <div className="stp-title">Where is<br/><em>the project?</em></div>
        <div className="stp-desc">Climate, soil conditions, and rainfall are the foundation of any correct landscape selection.</div>
        <div className="sect">
          <div className="sl">Country</div>
          <select value={form.country} onChange={e=>{set("country",e.target.value);set("region","");}}>
            <option value="">Select a country or climate preset…</option>
            {COUNTRY_GROUPS.map(g=><optgroup key={g.group} label={g.group}>{g.countries.map(c=><option key={c}>{c}</option>)}</optgroup>)}
          </select>
        </div>
        {regions.length>0&&<div className="sect">
          <div className="sl">Sub-Region / Ecological Zone</div>
          <select value={form.region} onChange={e=>set("region",e.target.value)}>
            <option value="">Select sub-region…</option>
            {regions.map(r=><option key={r}>{r}</option>)}
          </select>
          {REGION_HINTS[form.region]&&<div className="hint-box">{REGION_HINTS[form.region]}</div>}
        </div>}
        <div className="sect">
          <div className="sl">Additional Location Context (optional)</div>
          <input placeholder="e.g. Coastal site at 31°N, sandy loam soil, ~150mm annual rainfall" value={form.region.startsWith("__c:")?form.region.slice(4):""} onChange={e=>set("region",e.target.value?"__c:"+e.target.value:"")}/>
        </div>
      </>
    ),

    "project":()=>(
      <>
        <div className="stp-title">Project <em>setup</em></div>
        <div className="stp-desc">Define the project type, the scale of the palette, and any structural constraints on planting.</div>
        <div className="sect">
          <div className="sl">Project Type</div>
          <div className="tags">{PROJECT_TYPES.map(t=><div key={t} className={`tag ${form.projectType===t?"on":""}`} onClick={()=>set("projectType",t)}>{t}</div>)}</div>
        </div>
        <div className="sect">
          <div className="sl">Palette Diversity</div>
          <div className="div-cards">{DIVERSITY.map(d=><div key={d.val} className={`div-card ${form.diversity===d.val?"on":""}`} onClick={()=>set("diversity",d.val)}><div className="div-card-lbl">{d.label}</div><div className="div-card-sub">{d.sub}</div></div>)}</div>
        </div>
        {isRooftop?(
          <div className="sect">
            <div className="sl">Rooftop Planting Method</div>
            <div className="radio-stack">
              {[{val:"slab",label:"Soil layer directly on roof slab",sub:"Fixed growing medium depth over the waterproofed structure."},
                {val:"fixed-planter",label:"Fixed raised planters built into the design",sub:"Planter walls add height to the base slab depth in specific areas."},
                {val:"movable",label:"Movable / freestanding containers",sub:"Separate pots or troughs not fixed to the structure. Selection limited by container size."}
              ].map(opt=>(
                <div key={opt.val} className={`r-card ${form.rooftopType===opt.val?"on":""}`} onClick={()=>set("rooftopType",opt.val)}>
                  <div className="r-dot">{form.rooftopType===opt.val&&<div className="r-inner"/>}</div>
                  <div><div className="r-lbl">{opt.label}</div><div className="r-sub">{opt.sub}</div></div>
                </div>
              ))}
            </div>
            {form.rooftopType==="slab"&&<div style={{marginTop:14}}><div className="sl">Soil Depth on Roof Slab</div><input placeholder="e.g. 30 cm, 60 cm" value={form.rooftopSlabDepth} onChange={e=>set("rooftopSlabDepth",e.target.value)}/></div>}
            {form.rooftopType==="fixed-planter"&&<div className="g2" style={{marginTop:14}}>
              <div><div className="sl">Base Depth on Slab</div><input placeholder="e.g. 20 cm" value={form.rooftopSlabDepth} onChange={e=>set("rooftopSlabDepth",e.target.value)}/></div>
              <div><div className="sl">Planter Wall Height</div><input placeholder="e.g. 40 cm, 60 cm" value={form.rooftopPlanterHeight} onChange={e=>set("rooftopPlanterHeight",e.target.value)}/></div>
              {form.rooftopSlabDepth&&form.rooftopPlanterHeight&&<div style={{gridColumn:"1/-1"}}><div className="info-box">Total effective depth in planters ≈ {form.rooftopSlabDepth} + {form.rooftopPlanterHeight}.</div></div>}
            </div>}
            {form.rooftopType==="movable"&&<div style={{marginTop:14}}><div className="sl">Max Container Size</div><input placeholder="e.g. 60×60 cm, 1 m diameter" value={form.rooftopContainerSize} onChange={e=>set("rooftopContainerSize",e.target.value)}/><div className="info-box" style={{marginTop:10}}>Movable containers limit root depth — focus on shrubs, grasses, perennials, and compact plants.</div></div>}
          </div>
        ):(
          <div className="sect">
            <div className="sl">Is there a basement under the planting?</div>
            <div style={{fontSize:12,color:"#7a8a68",marginBottom:12,lineHeight:1.7}}>A basement slab restricts root depth and determines which plants are structurally viable.</div>
            <div className="tgl-row" style={{marginBottom:16}}>
              <div className={`tgl ${form.hasBasement?"on":""}`} onClick={()=>set("hasBasement",!form.hasBasement)}><div className="tgl-k"/></div>
              <span className="tgl-lbl">{form.hasBasement?"Yes — basement slab under the planting":"No — direct in-ground planting"}</span>
            </div>
            {form.hasBasement&&<>
              <div className="sl" style={{marginTop:4}}>Soil Depth Available Above the Basement Slab</div>
              <input placeholder="e.g. 60 cm, 80 cm, 1.2 m" value={form.basementSlabDepth} onChange={e=>set("basementSlabDepth",e.target.value)} style={{marginBottom:20}}/>
              <div className="sl">Will the design include fixed raised planters?</div>
              <div style={{fontSize:12,color:"#7a8a68",marginBottom:10,lineHeight:1.7}}>Fixed raised planters are walls built into the design above FFL. Their wall height adds to the base soil depth in those specific areas.</div>
              <div className="tgl-row" style={{marginBottom:form.hasRaisedPlanters?16:0}}>
                <div className={`tgl ${form.hasRaisedPlanters?"on":""}`} onClick={()=>set("hasRaisedPlanters",!form.hasRaisedPlanters)}><div className="tgl-k"/></div>
                <span className="tgl-lbl">{form.hasRaisedPlanters?"Yes — fixed raised planters in the design":"No raised planters"}</span>
              </div>
              {form.hasRaisedPlanters&&<div style={{marginTop:4}}>
                <div className="sl">Raised Planter Wall Height (above FFL)</div>
                <div style={{display:"flex",gap:10,marginBottom:14}}>
                  <div className={`div-card ${!form.planterHeightAiSuggest?"on":""}`} style={{flex:1,padding:"13px 16px"}} onClick={()=>set("planterHeightAiSuggest",false)}><div className="div-card-lbl" style={{fontSize:13}}>✏ Specify a height</div><div className="div-card-sub">Enter the planter wall height myself</div></div>
                  <div className={`div-card ${form.planterHeightAiSuggest?"on":""}`} style={{flex:1,padding:"13px 16px"}} onClick={()=>set("planterHeightAiSuggest",true)}><div className="div-card-lbl" style={{fontSize:13}}>✦ AI suggests depths</div><div className="div-card-sub">AI recommends appropriate depths based on plant types</div></div>
                </div>
                {form.planterHeightAiSuggest?<div className="info-box">AI will suggest depths — typical: 30–40 cm ground covers, 60 cm shrubs, 1.2 m trees, 1.5 m palms. Greater depth = more structural load.</div>
                :<input placeholder="e.g. 60 cm for shrubs, 1.2 m for tree areas" value={form.raisedPlanterHeight} onChange={e=>set("raisedPlanterHeight",e.target.value)}/>}
                <div className="depth-note" style={{marginTop:10}}>Reference minimums: Ground covers 30–40 cm · Shrubs 60 cm · Trees 1.2 m · Palms 1.5 m. Each 30 cm adds structural load and cost.
                  {form.basementSlabDepth&&!form.planterHeightAiSuggest&&form.raisedPlanterHeight&&<span> | Total in planter areas ≈ {form.basementSlabDepth} + {form.raisedPlanterHeight}.</span>}
                </div>
              </div>}
            </>}
          </div>
        )}
      </>
    ),

    "palette-type":()=>(
      <>
        <div className="stp-title">What would you<br/><em>like to generate?</em></div>
        <div className="stp-desc">Choose whether you want a softscape palette (plants), a hardscape palette (materials and paving), or a complete landscape palette with both.</div>
        <div className="sect">
          <div className="pt-grid">
            {[
              {val:"softscape",img:imgSoftscape,label:"Softscape",sub:"Plant palette — species selection, bloom, root depth, water needs, conditions"},
              {val:"hardscape",img:imgHardscape,label:"Hardscape",sub:"Material palette — paving, stone, tiles, finishes, patterns, zones"},
              {val:"both",img:imgBoth,label:"Both",sub:"Complete landscape palette — full softscape and hardscape together"},
            ].map(opt=>(
              <div key={opt.val} className={`pt-card ${form.paletteType===opt.val?"on":""}`} onClick={()=>set("paletteType",opt.val)}>
                <img src={opt.img} alt={opt.label} className="pt-img"/>
                <div className="pt-body">
                  <div className="pt-label">{opt.label}</div>
                  <div className="pt-sub">{opt.sub}</div>
                </div>
              </div>
            ))}
          </div>
          {form.paletteType&&(
            <div className="info-box" style={{marginTop:16}}>
              {form.paletteType==="softscape"&&"You'll go through: Style → Plant Categories → Colour & Mood → Special Conditions → Brief."}
              {form.paletteType==="hardscape"&&"You'll go through: Materials & Character → Zones, Colour & Pattern → Brief."}
              {form.paletteType==="both"&&"You'll go through all softscape steps, then hardscape steps, then a shared brief. Both palettes will be generated and presented together."}
            </div>
          )}
        </div>
      </>
    ),

    "style":()=>(
      <>
        <div className="stp-title">Planting <em>style</em></div>
        <div className="stp-desc">Select a primary style — compatible styles stay available, incompatible ones dim.</div>
        <div className="sect">
          <div className="sl">Select Style(s)</div>
          {form.styles.length>0&&<div style={{fontSize:11,color:"#4c644e",marginBottom:10,lineHeight:1.6}}>Active: <strong style={{color:"#163422"}}>{form.styles.join(", ")}</strong> <button className="link-btn" style={{marginLeft:8}} onClick={()=>set("styles",[])}>Clear all</button></div>}
          <div className="tags">{STYLES.map(s=>{const st=styleState(s);return <div key={s} className={`tag ${st==="on"?"on":""} ${st==="dim"?"dim":""}`} onClick={()=>st!=="dim"&&tog("styles",s)} title={st==="dim"?"Not compatible with current selection":""}>{s}</div>;})}</div>
        </div>
      </>
    ),

    "plants":()=>(
      <>
        <div className="stp-title">Plant <em>categories</em></div>
        <div className="stp-desc">Select the categories you need. Leave blank and AI will suggest an appropriate mix.</div>
        <div className="sect">
          <div className="sl">Plant Types</div>
          <div className="tags">
            <div className={`tag sel-all ${form.plantTypes.length===PLANT_TYPES.length?"on":""}`} onClick={()=>set("plantTypes",form.plantTypes.length===PLANT_TYPES.length?[]:[...PLANT_TYPES])}>{form.plantTypes.length===PLANT_TYPES.length?"✓ All Selected":"Select All"}</div>
            {PLANT_TYPES.map(t=><div key={t} className={`tag ${form.plantTypes.includes(t)?"on":""}`} onClick={()=>tog("plantTypes",t)}>{t}</div>)}
          </div>
        </div>
      </>
    ),

    "colour":()=>{
      const availSet=getAvailSet(form.harmony,form.colors);
      const anchor=form.colors.find(c=>isChromatic(c));
      const chromCount=form.colors.filter(c=>isChromatic(c)).length;
      const hints={
        monochromatic:anchor?`Anchor: ${anchor}. Monochromatic — only this hue available.`:"Select one colour — palette uses shades and tints of that hue only.",
        analogous:anchor?`Anchor: ${anchor}. Colours ±2 on the wheel are open. (${chromCount}/3)`:"Select your base colour — adjacent wheel colours will unlock.",
        complementary:anchor?`Anchor: ${anchor}. Complement cluster now available. (${chromCount}/2)`:"Select your primary colour — its opposite will unlock.",
        triadic:anchor?`Anchor: ${anchor}. Two triadic partners available. (${chromCount}/3)`:"Select your first colour — two evenly-spaced partners will unlock.",
        neutral:"Foliage tones, silvers, and whites only — no chromatic bloom colours.",
      };
      return(
        <>
            <div className="stp-title">Colour, mood &<br/><em>seasonality</em></div>
          <div className="stp-desc">Set harmony and mood first — this filters the colour picker to only show what works together.</div>
          <div className="sect"><div className="sl">1 — Colour Harmony</div><div className="harm-grid">{HARMONIES.map(h=><div key={h.val} className={`harm-card ${form.harmony===h.val?"on":""}`} onClick={()=>setHarmony(h.val)}><div className="harm-name">{h.label}</div><div className="harm-desc">{h.desc}</div></div>)}</div></div>
          <div className="sect"><div className="sl">2 — Mood / Atmosphere</div><div className="mood-grid">{MOODS.map(m=><div key={m.val} className={`mood-card ${form.mood===m.val?"on":""}`} onClick={()=>set("mood",m.val)}><span className="mood-icon">{m.icon}</span><span className="mood-lbl">{m.label}</span></div>)}</div></div>
          <div className="sect">
            <div className="sl">3 — Colours</div>
            {form.harmony&&<div className="colour-hint">{hints[form.harmony]}</div>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:10,marginTop:4}}>{ALL_COLORS_ORDER.map(c=>{const avail=availSet.includes(c),on=form.colors.includes(c);const hex=COLOR_HEX[c]||'#888';const isGrad=hex.startsWith('linear');return <div key={c} className={`ctag ${on?"on":""} ${!avail?"dim":""}`} onClick={()=>avail&&toggleColor(c)}><span className="ctag-swatch" style={isGrad?{backgroundImage:hex}:{background:hex}}/><span className="ctag-name">{c}</span></div>;})}</div>
            {form.colors.length>0&&<div style={{marginTop:8}}><button className="link-btn" onClick={()=>set("colors",[])}>Clear colours</button></div>}
          </div>
          <div className="sect"><div className="sl">Blooming Target Seasons</div><div className="tags">{["Spring (Mar–May)","Summer (Jun–Aug)","Autumn (Sep–Nov)","Winter (Dec–Feb)","Year-round"].map(s=><div key={s} className={`tag ${form.bloomingTarget.includes(s)?"on":""}`} onClick={()=>tog("bloomingTarget",s)}>{s}</div>)}</div></div>
          <div className="sect"><div className="sl">Evergreen / Deciduous Preference</div><div className="tags">{["Fully Evergreen","Mostly Evergreen","Mix of Both","Mostly Deciduous","No Preference"].map(v=><div key={v} className={`tag ${form.evergreen===v?"on":""}`} onClick={()=>set("evergreen",v)}>{v}</div>)}</div></div>
          <div className="sect"><div className="sl">Preferred Foliage Texture</div><div className="tags">{FOLIAGE_TEXTURES.map(t=><div key={t} className={`tag ${form.foliageTexture.includes(t)?"on":""}`} onClick={()=>tog("foliageTexture",t)}>{t}</div>)}</div></div>
          <div className="sect"><div className="sl">Seasonal / Functional Note</div><textarea placeholder="e.g. Deciduous trees on south side for summer shade but winter sun. Colour peak in spring…" value={form.seasonalNote} onChange={e=>set("seasonalNote",e.target.value)} style={{minHeight:80}}/></div>
        </>
      );
    },

    "conditions":()=>(
      <>
        <div className="stp-title">Special <em>conditions</em></div>
        <div className="stp-desc">Location-specific conditions are pre-checked. Add any extra requirements your project needs.</div>
        {autoConditions.length>0&&<div className="info-box" style={{marginBottom:20}}><strong style={{color:"#163422"}}>Auto-selected from {form.region||form.country}:</strong> {autoConditions.join(", ")}. You can deselect these if they don't apply.</div>}
        <div className="sect"><div className="sl">Tolerances & Traits</div>
          <div className="tags">{CONDITIONS.map(c=>{const isAuto=autoConditions.includes(c),isOn=form.conditions.includes(c);return <div key={c} className={`tag ${isAuto?"auto":isOn?"on":""}`} onClick={()=>tog("conditions",c)}>{c}</div>;})}</div>
        </div>
      </>
    ),

    "hd-materials":()=>(
      <>
        <div className="stp-title">Hardscape <em>materials</em></div>
        <div className="stp-desc">Define the character and origin of the paving palette, then select specific materials and finishes.</div>
        <div className="sect"><div className="sl">Material Character</div><div className="div-cards">{HD_CHARACTER.map(h=><div key={h.val} className={`div-card ${form.hdCharacter===h.val?"on":""}`} onClick={()=>set("hdCharacter",h.val)}><div className="div-card-lbl">{h.label}</div><div className="div-card-sub">{h.sub}</div></div>)}</div></div>
        <div className="sect"><div className="sl">Material Origin</div><div className="tags">{HD_ORIGIN.map(o=><div key={o} className={`tag ${form.hdOrigin===o?"on":""}`} onClick={()=>set("hdOrigin",o)}>{o}</div>)}</div></div>
        <div className="sect">
          <div className="sl">Specific Materials</div>
          <div style={{fontSize:12,color:"#4c644e",marginBottom:10,lineHeight:1.7}}>Select materials you want to include. Leave blank and AI will suggest based on character and region.</div>
          <div className="tags">
            <div className={`tag sel-all ${form.hdMaterials.length===HD_MATERIALS.length?"on":""}`} onClick={()=>set("hdMaterials",form.hdMaterials.length===HD_MATERIALS.length?[]:[...HD_MATERIALS])}>{form.hdMaterials.length===HD_MATERIALS.length?"✓ All":"Select All"}</div>
            {HD_MATERIALS.map(m=><div key={m} className={`tag ${form.hdMaterials.includes(m)?"on":""}`} onClick={()=>tog("hdMaterials",m)}>{m}</div>)}
          </div>
        </div>
        <div className="sect"><div className="sl">Preferred Finishes</div><div className="tags">{HD_FINISHES.map(f=><div key={f} className={`tag ${form.hdFinishes.includes(f)?"on":""}`} onClick={()=>tog("hdFinishes",f)}>{f}</div>)}</div></div>
      </>
    ),

    "hd-zones":()=>(
      <>
        <div className="stp-title">Zones, colour &<br/><em>pattern</em></div>
        <div className="stp-desc">Define where the materials go, the colour tones you want, and preferred laying patterns.</div>
        <div className="sect">
          <div className="sl">Usage Zones</div>
          <div className="tags">
            <div className={`tag sel-all ${form.hdZones.length===HD_ZONES.length?"on":""}`} onClick={()=>set("hdZones",form.hdZones.length===HD_ZONES.length?[]:[...HD_ZONES])}>{form.hdZones.length===HD_ZONES.length?"✓ All Zones":"Select All Zones"}</div>
            {HD_ZONES.map(z=><div key={z} className={`tag ${form.hdZones.includes(z)?"on":""}`} onClick={()=>tog("hdZones",z)}>{z}</div>)}
          </div>
        </div>
        <div className="sect">
          <div className="sl">Colour Tones</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:10,marginTop:4}}>{HD_COLORS.map(c=>{const on=form.hdColors.some(x=>(x.label||x)===c.label);return <div key={c.label} className={`ctag ${on?"on":""}`} onClick={()=>set("hdColors",on?form.hdColors.filter(x=>(x.label||x)!==c.label):[...form.hdColors,c])}><span className="ctag-swatch" style={{background:c.hex}}/><span className="ctag-name">{c.label}</span></div>;})}</div>
        </div>
        <div className="sect"><div className="sl">Laying Patterns</div><div className="tags">{HD_PATTERNS.map(p=><div key={p} className={`tag ${form.hdPatterns.includes(p)?"on":""}`} onClick={()=>tog("hdPatterns",p)}>{p}</div>)}</div></div>
      </>
    ),

   "brief":()=>(
  <>
    <div className="stp-title">Design <em>brief</em></div>
    <div className="stp-desc">Add any extra notes, or let AI write a brief based on your selections.</div>
    <div className="sect">
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <button onClick={autoGenerateBrief} disabled={generatingBrief} style={{
          background:'linear-gradient(135deg,#163422,#2d4b37)',border:'none',
          color:'#ffffff',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",
          fontSize:'12px',letterSpacing:'.04em',fontWeight:700,
          padding:'10px 22px',transition:'all .2s',opacity:generatingBrief?0.5:1,
          borderRadius:'9999px',boxShadow:'0 2px 8px rgba(22,52,34,0.18)'
        }}>
          {generatingBrief ? '✦ Writing…' : '✦ Auto-generate brief'}
        </button>
      </div>
      <textarea
        placeholder="Write your brief here, or click Auto-generate above…"
        value={form.brief}
        onChange={e=>set('brief',e.target.value)}
        style={{minHeight:200}}
      />
    </div>
    {error&&<div className="err">⚠ {error}</div>}
  </>
),
  };

  if(result&&!loading){
    const hasSoft=!!(editableResult?.strategy||editableResult?.categories?.length);
    const hasHard=!!(editableResult?.hardscapeStrategy||editableResult?.hardscapeCategories?.length);
    return(
      <>
        <style>{FONTS+CSS}</style>
        <div className="app" ref={topRef}>
          {showHistory && (
            <History
              session={session}
              onLoad={handleLoadPalette}
              onClose={() => setShowHistory(false)}
            />
          )}
          {replacingPlant && (
            <div style={{position:'fixed',top:0,right:0,width:'360px',height:'100vh',background:'#f9faf8',borderLeft:'1px solid rgba(22,52,34,0.1)',zIndex:100,display:'flex',flexDirection:'column',boxShadow:'-8px 0 32px rgba(22,52,34,0.1)'}}>
              <div style={{padding:'24px',borderBottom:'1px solid rgba(22,52,34,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'18px',fontWeight:800,color:'#163422',letterSpacing:'-.01em'}}>Choose a replacement</h2>
                <button onClick={() => setReplacingPlant(null)} style={{background:'rgba(22,52,34,0.06)',border:'none',width:'32px',height:'32px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#163422',fontSize:'16px',lineHeight:1}}>✕</button>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
                {(editableResult?.alternatives||[]).length === 0 && (
                  <p style={{color:'rgba(22,52,34,0.4)',fontSize:'13px',textAlign:'center',marginTop:'40px',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>No alternatives available.</p>
                )}
                {(editableResult?.alternatives||[]).map((alt, i) => (
  <AltCard
    key={i}
    alt={alt}
    onSelect={() => replacePlant(replacingPlant.catName, replacingPlant.plantIndex, alt)}
  />
))}
              </div>
            </div>
          )}
          <header className="hdr">
            <div className="hdr-brand"><div><div className="hdr-name" onClick={onGoHome} style={{cursor:'pointer'}}>LandPal.</div></div></div>
            <div className="hdr-nav-wrap">
              <div className="hdr-btns" style={{display:'flex',alignItems:'center',gap:8}}>
                <button onClick={()=>setShowHistory(true)} className="btn-action">History</button>
                <button onClick={()=>supabase.auth.signOut()} className="btn-reset">Sign out</button>
              </div>
              <button className="hdr-mobile-menu" onClick={()=>setMobileMenuOpen(o=>!o)} aria-label="Menu">
                <span/><span/><span/>
              </button>
              {mobileMenuOpen&&(
                <div className="mobile-dropdown">
                  <button onClick={()=>{setShowHistory(true);setMobileMenuOpen(false);}}>History</button>
                  <button onClick={()=>supabase.auth.signOut()}>Sign out</button>
                </div>
              )}
            </div>
          </header>
          <div className="res-wrap">
            <div className="res-hdr">
              <div className="res-hdr-left">
                <div className="res-eyebrow">Landscape Palette</div>
                <div className="res-title">{[form.country, form.region?.replace('__c:',''), form.projectType].filter(Boolean)[0] || 'Your Project'}</div>
                <div className="res-meta">{meta}</div>
              </div>
              <div className="res-hdr-right">
                <div className="res-actions-primary">
                  <button onClick={handleSave} disabled={isSaving||isSaved} className="btn-save">
                    {isSaving?'Saving…':isSaved?'✓ Saved':'Save'}
                  </button>
                  <button className="btn-reset" onClick={()=>{setResult(null);setEditableResult(null);setStep(0);setIsSaved(false);}}>← New</button>
                </div>
                <div className="res-actions-secondary">
                  <button onClick={() => setShowHistory(true)} className="btn-action">History</button>
                  <button onClick={() => exportToPptx(editableResult, form)} className="btn-action">↓ PPTX</button>
                  <button onClick={() => exportToDxf(editableResult, form)} className="btn-action">↓ DXF</button>
                </div>
              </div>
            </div>
            {/* Stats bar */}
            <div className="res-stats">
              {hasSoft&&<div className="res-stat"><div className="res-stat-val">{(editableResult?.categories||[]).reduce((n,c)=>n+(c.plants?.length||0),0)}</div><div className="res-stat-lbl">Plants</div></div>}
              {hasSoft&&<div className="res-stat"><div className="res-stat-val">{(editableResult?.categories||[]).length}</div><div className="res-stat-lbl">Categories</div></div>}
              {hasHard&&<div className="res-stat"><div className="res-stat-val">{(editableResult?.hardscapeCategories||[]).length}</div><div className="res-stat-lbl">Zones</div></div>}
              <div className="res-stat"><div className="res-stat-val">{new Date().getFullYear()}</div><div className="res-stat-lbl">Generated</div></div>
            </div>
            {/* Tabs — only when both exist */}
            {hasSoft&&hasHard&&(
              <div className="res-tabs">
                <button className={`res-tab${activeTab==='softscape'?' active':''}`} onClick={()=>setActiveTab('softscape')}>Softscape</button>
                <button className={`res-tab${activeTab==='hardscape'?' active':''}`} onClick={()=>setActiveTab('hardscape')}>◈ Hardscape</button>
              </div>
            )}
            {error&&<div className="err" style={{margin:'0 0 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span>⚠ {error}</span>
              <button onClick={()=>setError(null)} style={{background:'none',border:'none',color:'rgba(220,120,100,0.7)',cursor:'pointer',fontSize:16,lineHeight:1,padding:'0 0 0 12px'}}>✕</button>
            </div>}
            {(!hasHard||activeTab==='softscape')&&hasSoft&&<>
              {hasHard&&<div className="sec-banner">Softscape</div>}
              {editableResult?.strategy&&<div className="strat-box"><div className="strat-lbl">Design Strategy & Rationale</div><div className="strat-txt">{editableResult.strategy}</div></div>}
              {editableResult?.feasibilityNotes&&editableResult.feasibilityNotes!=="null"&&<div className="feasibility-box"><div className="feasibility-lbl">⚠ Feasibility Notes</div><div className="feasibility-txt">{editableResult.feasibilityNotes}</div></div>}
              {(editableResult?.categories||[]).map((cat,i)=>(
                <div key={i}>
                  <div className="cat-sec">
                    <div className="cat-hdr"><span className="cat-icon">{CAT_ICONS[cat.name]||""}</span><span className="cat-name">{cat.name}</span><span className="cat-cnt">{cat.plants?.length} plants</span></div>
                    <div className="cards">
                      {(cat.plants||[]).map((p,j)=>(
                        <PlantCard
                          key={j}
                          p={p}
                          onRemove={() => removePlant(cat.name, j)}
                          onReplace={() => setReplacingPlant({ catName: cat.name, plantIndex: j })}
                        />
                      ))}
                    </div>
                    {(editableResult?.alternatives||[]).filter(a =>
                      !editableResult.categories.flatMap(c=>c.plants).find(p=>p.commonName===a.commonName)
                    ).length > 0 && (
                      <div style={{marginTop:16}}>
                        <div style={{fontSize:9,color:'rgba(200,169,110,0.45)',marginBottom:10,letterSpacing:'.18em',textTransform:'uppercase'}}>Add from alternatives</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {(editableResult?.alternatives||[])
                            .filter(a => !editableResult.categories.flatMap(c=>c.plants).find(p=>p.commonName===a.commonName))
                            .map((alt,k) => (
                              <button key={k} onClick={() => addPlant(cat.name, alt)} style={{padding:'6px 14px',border:'1px solid rgba(22,52,34,0.15)',background:'transparent',color:'#4c644e',fontSize:'10px',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'.06em',textTransform:'uppercase',borderRadius:'9999px'}}>
                                + {alt.commonName}
                              </button>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                  {i<(editableResult?.categories||[]).length-1&&<hr className="divider"/>}
                </div>
              ))}
              {editableResult?.specTable?.length>0&&<><hr className="divider"/><SpecTable rows={editableResult.specTable} meta={meta}/></>}
              {editableResult?.alternatives?.length>0&&<><hr className="divider"/><div className="alt-sec"><div className="alt-title">Softscape Alternatives</div><div className="alt-grid">{editableResult.alternatives.map((a,i)=><div key={i} className="alt-item"><div className="alt-c">{a.commonName}</div>{a.scientificName&&<div className="alt-s">{a.scientificName}</div>}<div className="alt-r">{a.reason}</div></div>)}</div></div></>}
            </>}
            {(!hasSoft||activeTab==='hardscape')&&hasHard&&<>
              {hasSoft&&<hr className="divider"/>}
              {hasSoft&&<div className="sec-banner">🪨 Hardscape</div>}
              {!hasSoft&&<div className="strat-box" style={{marginBottom:28}}><div className="strat-lbl">Project</div><div className="strat-txt">{meta}</div></div>}
              {editableResult?.hardscapeStrategy&&<div className="strat-box"><div className="strat-lbl">Material Strategy & Rationale</div><div className="strat-txt">{editableResult.hardscapeStrategy}</div></div>}
              {(editableResult?.hardscapeCategories||[]).map((zone,i)=>(
                <div key={i} className="hd-section">
                  <div className="hd-sec-title"><span>◈</span>{zone.zone}</div>
                  <div className="hd-cards">{(zone.materials||[]).map((m,j)=>(
                    <div key={j} className="hd-card">
                      {m.color&&<div className="hd-card-swatch" style={{background:HD_COLORS.find(c=>c.label===m.color)?.hex||'#d4b896'}}/>}
                      <div className="hd-card-body">
                      <div className="hd-card-name">{m.name}</div>
                      <div className="hd-card-sub">{m.type}{m.origin?` · ${m.origin}`:""}</div>
                      <div className="hd-attrs">
                        {m.finish&&<div className="hd-attr"><div className="hd-attr-k">Finish</div><div className="hd-attr-v">{m.finish}</div></div>}
                        {m.color&&<div className="hd-attr"><div className="hd-attr-k">Colour</div><div className="hd-attr-v">{m.color}</div></div>}
                        {m.size&&<div className="hd-attr"><div className="hd-attr-k">Size / Format</div><div className="hd-attr-v">{m.size}</div></div>}
                        {m.pattern&&<div className="hd-attr"><div className="hd-attr-k">Pattern</div><div className="hd-attr-v">{m.pattern}</div></div>}
                        {m.slipResistance&&<div className="hd-attr"><div className="hd-attr-k">Slip Resistance</div><div className="hd-attr-v">{m.slipResistance}</div></div>}
                        {m.heatRetention&&<div className="hd-attr"><div className="hd-attr-k">Heat Retention</div><div className="hd-attr-v">{m.heatRetention}</div></div>}
                        {m.maintenance&&<div className="hd-attr"><div className="hd-attr-k">Maintenance</div><div className="hd-attr-v">{m.maintenance}</div></div>}
                        {m.cost&&<div className="hd-attr"><div className="hd-attr-k">Cost Range</div><div className="hd-attr-v">{m.cost}</div></div>}
                      </div>
                      {m.note&&<div className="hd-note">{m.note}</div>}
                      </div>
                    </div>
                  ))}</div>
                  {i<(editableResult?.hardscapeCategories||[]).length-1&&<hr className="divider"/>}
                </div>
              ))}
              {editableResult?.hardscapeAlternatives?.length>0&&<><hr className="divider"/><div className="alt-sec"><div className="alt-title">Hardscape Alternatives</div><div className="alt-grid">{editableResult.hardscapeAlternatives.map((a,i)=><div key={i} className="alt-item"><div className="alt-c">{a.name}</div><div className="alt-r">{a.reason}</div></div>)}</div></div></>}
            </>}
            <div style={{textAlign:"center",marginTop:40,marginBottom:40,padding:"0 16px"}}><button className="btn-gen" style={{width:'100%',maxWidth:360}} onClick={()=>{setResult(null);setEditableResult(null);setStep(0);setIsSaved(false);}}>← Generate Another Palette</button></div>
          </div>
        </div>
        {toast&&(
          <div className="toast">
            <div className="toast-icon">{toast.icon}</div>
            {toast.msg}
          </div>
        )}
      </>
    );
  }

  if(loading)return(
    <>
      <style>{FONTS+CSS}</style>
      <div className="app" ref={topRef}>
        <header className="hdr"><div className="hdr-brand"><div><div className="hdr-name" onClick={onGoHome} style={{cursor:'pointer'}}>LandPal.</div></div></div></header>
        <div className="loading">
          <div className="loading-t">Generating your landscape palette…</div>
          <div className="loading-s">{form.paletteType==="both"?"Running softscape then hardscape analysis — this may take a moment…":"Analysing location, conditions, and design brief"}</div>
          <div className="spin"><span/><span/><span/></div>
        </div>
      </div>
    </>
  );

  if(error&&!loading&&!result)return(
    <>
      <style>{FONTS+CSS}</style>
      <div className="app" ref={topRef}>
        <header className="hdr"><div className="hdr-brand"><div><div className="hdr-name" onClick={()=>{setError(null);goToStep(0);}} style={{cursor:'pointer'}}>LandPal.</div></div></div></header>
        <div className="err-page">
          <div className="err-page-icon">⚠</div>
          <div className="err-page-title">Something went wrong</div>
          <div className="err-page-msg">{error}</div>
          <div className="err-page-actions">
            <button className="btn-next" onClick={()=>{setError(null);generate();}}>Try Again</button>
            <button className="btn-back" onClick={()=>{setError(null);goToStep(0);}}>← Start Over</button>
          </div>
        </div>
      </div>
    </>
  );

  const StepContent=stepMap[currentId];
  const canNext=currentId==="location"?!!form.country:currentId==="palette-type"?!!form.paletteType:true;
  const genLabel=form.paletteType==="softscape"?"Softscape Palette":form.paletteType==="hardscape"?"Hardscape Palette":form.paletteType==="both"?"Full Landscape Palette":"Palette";

  return(
    <>
      <style>{FONTS+CSS}</style>
      <div className="app" ref={topRef}>
        {showHistory && (
          <History
            session={session}
            onLoad={handleLoadPalette}
            onClose={() => setShowHistory(false)}
          />
        )}
        <header className="hdr">
          <div className="hdr-brand">
            <div><div className="hdr-name" onClick={onGoHome} style={{cursor:'pointer'}}>LandPal.</div></div>
          </div>
          <div className="hdr-nav-wrap">
            {/* Desktop buttons */}
            <div className="hdr-btns" style={{display:'flex',alignItems:'center',gap:8}}>
              <button onClick={()=>setShowHistory(true)} className="btn-action">History</button>
              <button onClick={()=>supabase.auth.signOut()} className="btn-reset">Sign out</button>
            </div>
            {/* Mobile hamburger */}
            <button className="hdr-mobile-menu" onClick={()=>setMobileMenuOpen(o=>!o)} aria-label="Menu">
              <span/><span/><span/>
            </button>
            {mobileMenuOpen&&(
              <div className="mobile-dropdown">
                <button onClick={()=>{setShowHistory(true);setMobileMenuOpen(false);}}>History</button>
                <button onClick={()=>supabase.auth.signOut()}>Sign out</button>
              </div>
            )}
          </div>
        </header>
        <div className="wizard-body">
          {currentId === 'location' && (
            <>
              <div className="wizard-globe-bg">
                <GlobeView country={form.country&&!form.country.startsWith('__')?form.country:null}/>
              </div>
              <div className="wizard-globe-fade"/>
            </>
          )}
          {currentId === 'project' && (
            <>
              <div className="wizard-photo-bg" style={{backgroundImage:`url(${imgProjectSetup})`}}/>
              <div className="wizard-photo-fade"/>
            </>
          )}
          <div className="wizard-left">
            <div className={`main ${stepVisible?'step-visible':'step-hidden'}`} style={currentId==='palette-type'?{maxWidth:'none',paddingRight:56}:{}}>
              {StepContent?StepContent():<div style={{color:"rgba(22,52,34,0.3)",padding:"40px 0"}}>Loading step…</div>}
              <div className="nav">
                <button className="btn-back" style={{visibility:step===0?"hidden":"visible"}} onClick={()=>goToStep(step-1)}>← Back</button>
                {!isLast
                  ?<button className="btn-next" disabled={!canNext} onClick={()=>goToStep(step+1)}>Continue →</button>
                  :<button className="btn-gen" disabled={isGenerating} onClick={generate}>
                    {isGenerating?<><span className="btn-spinner"/>Generating…</>:<>✦ Generate {genLabel}</>}
                  </button>
                }
              </div>
            </div>
            {/* Dot progress */}
            <div className="step-dots">
              {stepDefs.map((_,i)=>(
                <div key={i} className={`step-dot ${i===step?'active':i<step?'done':''}`}/>
              ))}
            </div>
          </div>
          {STEP_IMAGES[currentId] && currentId !== 'location' && currentId !== 'project' && currentId !== 'palette-type' && (
            <>
              <div className="wizard-photo-bg" style={{backgroundImage:`url(${STEP_IMAGES[currentId]})`,transition:"background-image .4s ease"}}/>
              <div className="wizard-photo-fade"/>
            </>
          )}
        </div>
        {/* Toast */}
        {toast&&(
          <div className="toast">
            <div className="toast-icon">{toast.icon}</div>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
