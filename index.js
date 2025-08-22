const { VK, createCollectIterator } = require("vk-io");
const commands = [];
const database = require("./databases.js");
global.Config = require("./jsons/config.json"); // ponyal

const util = require("util");
const queryAsync = util.promisify(database.query).bind(database);
const databaseQuery = util.promisify(database.query);
require("dotenv").config();
const mutedUsersInfo = {};
global.mutedUsersInfo = mutedUsersInfo;

const silenceConf = {};
global.silenceConf = silenceConf;

const { getUserRole } = require("./util.js");

const { Keyboard } = require("vk-io");
const vk = new VK({
  token: process.env.VK_TOKEN,
});
global.vk = vk;
const golubev = new VK({
  token: "vk1.a.rGKTOCIHaHSG4NCtx4GVxCOu67ydcX1WMy7dv-sTgV8jZSBts0x_XSwWKOmMD5dJFyhHfUIU3n49DIqXBBDU7MKay2263CoP8OXdGsFnO-ctqfm_WU0ZhRGYEQ65s5yn2SnIA58RVOGpqqB-zYYlP3Ur1iwMUDHhbW3R7zL_f8fkMzWDD94PMQnHW-zm4kPHbmqeJJMjOPLVq5zJ-iD9ug",
});
global.golubev = golubev;
const utils = require("./util.js");
global.utils = utils;
const hnd = ["cmds"];
hnd.forEach((handler) => {
  require(`./handlers/${handler}.js`)(commands);
});

const domainPatterns = {
  ru: /\.ru\b/,
  рф: /\.рф\b/,
  moscow: /\.moscow\b/,
  beer: /\.beer\b/,
  cc: /\.cc\b/,
  com: /\.com\b/,
  me: /\.me\b/,
  su: /\.su\b/,
  net: /\.net\b/,
  gg: /\.gg\b/,
  org: /\.org\b/,
  info: /\.info\b/,
  name: /\.name\b/,
  pw: /\.pw\b/,
  дети: /\.дети\b/,
  онлайн: /\.онлайн\b/,
  сайт: /\.сайт\b/,
  academy: /\.academy\b/,
  accountant: /\.accountant\b/,
  accountants: /\.accountants\b/,
  actor: /\.actor\b/,
  adult: /\.adult\b/,
  aero: /\.aero\b/,
  agency: /\.agency\b/,
  apartments: /\.apartments\b/,
  app: /\.app\b/,
  art: /\.art\b/,
  associates: /\.associates\b/,
  attorney: /\.attorney\b/,
  auction: /\.auction\b/,
  audio: /\.audio\b/,
  auto: /\.auto\b/,
  baby: /\.baby\b/,
  band: /\.band\b/,
  bar: /\.bar\b/,
  bargains: /\.bargains\b/,
  beer: /\.beer\b/,
  best: /\.best\b/,
  bet: /\.bet\b/,
  bid: /\.bid\b/,
  bike: /\.bike\b/,
  bingo: /\.bingo\b/,
  black: /\.black\b/,
  blackfriday: /\.blackfriday\b/,
  blue: /\.blue\b/,
  boutique: /\.boutique\b/,
  broker: /\.broker\b/,
  build: /\.build\b/,
  builders: /\.builders\b/,
  business: /\.business\b/,
  buzz: /\.buzz\b/,
  bzh: /\.bzh\b/,
  cab: /\.cab\b/,
  cafe: /\.cafe\b/,
  cam: /\.cam\b/,
  camera: /\.camera\b/,
  camp: /\.camp\b/,
  capital: /\.capital\b/,
  car: /\.car\b/,
  cards: /\.cards\b/,
  care: /\.care\b/,
  career: /\.career\b/,
  careers: /\.careers\b/,
  cars: /\.cars\b/,
  casa: /\.casa\b/,
  cash: /\.cash\b/,
  casino: /\.casino\b/,
  cat: /\.cat\b/,
  catering: /\.catering\b/,
  center: /\.center\b/,
  chat: /\.chat\b/,
  cheap: /\.cheap\b/,
  christmas: /\.christmas\b/,
  church: /\.church\b/,
  city: /\.city\b/,
  claims: /\.claims\b/,
  cleaning: /\.cleaning\b/,
  click: /\.click\b/,
  clinic: /\.clinic\b/,
  clothing: /\.clothing\b/,
  cloud: /\.cloud\b/,
  club: /\.club\b/,
  coach: /\.coach\b/,
  codes: /\.codes\b/,
  coffee: /\.coffee\b/,
  college: /\.college\b/,
  community: /\.community\b/,
  company: /\.company\b/,
  computer: /\.computer\b/,
  condos: /\.condos\b/,
  construction: /\.construction\b/,
  consulting: /\.consulting\b/,
  contractors: /\.contractors\b/,
  cooking: /\.cooking\b/,
  cool: /\.cool\b/,
  country: /\.country\b/,
  coupons: /\.coupons\b/,
  courses: /\.courses\b/,
  credit: /\.credit\b/,
  creditcard: /\.creditcard\b/,
  cricket: /\.cricket\b/,
  cruises: /\.cruises\b/,
  dance: /\.dance\b/,
  date: /\.date\b/,
  dating: /\.dating\b/,
  deals: /\.deals\b/,
  degree: /\.degree\b/,
  delivery: /\.delivery\b/,
  democrat: /\.democrat\b/,
  dental: /\.dental\b/,
  dentist: /\.dentist\b/,
  desi: /\.desi\b/,
  design: /\.design\b/,
  dev: /\.dev\b/,
  diamonds: /\.diamonds\b/,
  diet: /\.diet\b/,
  digital: /\.digital\b/,
  direct: /\.direct\b/,
  directory: /\.directory\b/,
  discount: /\.discount\b/,
  dog: /\.dog\b/,
  domains: /\.domains\b/,
  download: /\.download\b/,
  earth: /\.earth\b/,
  eco: /\.eco\b/,
  education: /\.education\b/,
  email: /\.email\b/,
  energy: /\.energy\b/,
  engineer: /\.engineer\b/,
  engineering: /\.engineering\b/,
  enterprises: /\.enterprises\b/,
  equipment: /\.equipment\b/,
  estate: /\.estate\b/,
  eus: /\.eus\b/,
  events: /\.events\b/,
  exchange: /\.exchange\b/,
  exnet: /\.exnet\b/,
  expert: /\.expert\b/,
  exposed: /\.exposed\b/,
  express: /\.express\b/,
  fail: /\.fail\b/,
  faith: /\.faith\b/,
  family: /\.family\b/,
  fans: /\.fans\b/,
  farm: /\.farm\b/,
  fashion: /\.fashion\b/,
  feedback: /\.feedback\b/,
  film: /\.film\b/,
  finance: /\.finance\b/,
  financial: /\.financial\b/,
  fish: /\.fish\b/,
  fishing: /\.fishing\b/,
  fit: /\.fit\b/,
  fitness: /\.fitness\b/,
  flights: /\.flights\b/,
  florist: /\.florist\b/,
  flowers: /\.flowers\b/,
  fm: /\.fm\b/,
  football: /\.football\b/,
  forex: /\.forex\b/,
  forsale: /\.forsale\b/,
  foundation: /\.foundation\b/,
  frl: /\.frl\b/,
  fun: /\.fun\b/,
  fund: /\.fund\b/,
  furniture: /\.furniture\b/,
  futbol: /\.futbol\b/,
  fyi: /\.fyi\b/,
  gallery: /\.gallery\b/,
  game: /\.game\b/,
  games: /\.games\b/,
  garden: /\.garden\b/,
  gent: /\.gent\b/,
  gift: /\.gift\b/,
  gifts: /\.gifts\b/,
  gives: /\.gives\b/,
  glass: /\.glass\b/,
  global: /\.global\b/,
  gmbh: /\.gmbh\b/,
  gold: /\.gold\b/,
  golf: /\.golf\b/,
  graphics: /\.graphics\b/,
  gratis: /\.gratis\b/,
  green: /\.green\b/,
  gripe: /\.gripe\b/,
  group: /\.group\b/,
  guide: /\.guide\b/,
  guitars: /\.guitars\b/,
  guru: /\.guru\b/,
  haus: /\.haus\b/,
  health: /\.health\b/,
  healthcare: /\.healthcare\b/,
  help: /\.help\b/,
  hiphop: /\.hiphop\b/,
  hiv: /\.hiv\b/,
  hockey: /\.hockey\b/,
  holdings: /\.holdings\b/,
  holiday: /\.holiday\b/,
  horse: /\.horse\b/,
  hospital: /\.hospital\b/,
  host: /\.host\b/,
  hosting: /\.hosting\b/,
  house: /\.house\b/,
  how: /\.how\b/,
  icu: /\.icu\b/,
  immo: /\.immo\b/,
  immobilien: /\.immobilien\b/,
  industries: /\.industries\b/,
  ink: /\.ink\b/,
  institute: /\.institute\b/,
  insure: /\.insure\b/,
  international: /\.international\b/,
  investments: /\.investments\b/,
  jetzt: /\.jetzt\b/,
  jewelry: /\.jewelry\b/,
  jobs: /\.jobs\b/,
  juegos: /\.juegos\b/,
  kaufen: /\.kaufen\b/,
  kim: /\.kim\b/,
  kitchen: /\.kitchen\b/,
  kiwi: /\.kiwi\b/,
  land: /\.land\b/,
  lawyer: /\.lawyer\b/,
  lease: /\.lease\b/,
  legal: /\.legal\b/,
  lgbt: /\.lgbt\b/,
  life: /\.life\b/,
  lighting: /\.lighting\b/,
  limited: /\.limited\b/,
  limo: /\.limo\b/,
  link: /\.link\b/,
  live: /\.live\b/,
  llc: /\.llc\b/,
  loan: /\.loan\b/,
  loans: /\.loans\b/,
  lol: /\.lol\b/,
  love: /\.love\b/,
  ltd: /\.ltd\b/,
  ltda: /\.ltda\b/,
  luxe: /\.luxe\b/,
  luxury: /\.luxury\b/,
  maison: /\.maison\b/,
  management: /\.management\b/,
  market: /\.market\b/,
  marketing: /\.marketing\b/,
  markets: /\.markets\b/,
  mba: /\.mba\b/,
  media: /\.media\b/,
  memorial: /\.memorial\b/,
  men: /\.men\b/,
  menu: /\.menu\b/,
  mobi: /\.mobi\b/,
  moda: /\.moda\b/,
  moe: /\.moe\b/,
  mom: /\.mom\b/,
  money: /\.money\b/,
  monster: /\.monster\b/,
  movie: /\.movie\b/,
  network: /\.network\b/,
  ninja: /\.ninja\b/,
  observer: /\.observer\b/,
  one: /\.one\b/,
  onl: /\.onl\b/,
  online: /\.online\b/,
  ooo: /\.ooo\b/,
  page: /\.page\b/,
  partners: /\.partners\b/,
  parts: /\.parts\b/,
  party: /\.party\b/,
  pet: /\.pet\b/,
  photo: /\.photo\b/,
  photography: /\.photography\b/,
  photos: /\.photos\b/,
  physio: /\.physio\b/,
  pics: /\.pics\b/,
  pictures: /\.pictures\b/,
  pink: /\.pink\b/,
  pizza: /\.pizza\b/,
  plumbing: /\.plumbing\b/,
  plus: /\.plus\b/,
  poker: /\.poker\b/,
  porn: /\.porn\b/,
  press: /\.press\b/,
  pro: /\.pro\b/,
  productions: /\.productions\b/,
  promo: /\.promo\b/,
  properties: /\.properties\b/,
  property: /\.property\b/,
  protection: /\.protection\b/,
  pub: /\.pub\b/,
  qpon: /\.qpon\b/,
  racing: /\.racing\b/,
  realty: /\.realty\b/,
  recipes: /\.recipes\b/,
  red: /\.red\b/,
  rehab: /\.rehab\b/,
  reisen: /\.reisen\b/,
  rent: /\.rent\b/,
  rentals: /\.rentals\b/,
  repair: /\.repair\b/,
  report: /\.report\b/,
  rest: /\.rest\b/,
  restaurant: /\.restaurant\b/,
  reviews: /\.reviews\b/,
  rip: /\.rip\b/,
  rocks: /\.rocks\b/,
  rodeo: /\.rodeo\b/,
  run: /\.run\b/,
  sale: /\.sale\b/,
  salon: /\.salon\b/,
  sarl: /\.sarl\b/,
  school: /\.school\b/,
  schule: /\.schule\b/,
  science: /\.science\b/,
  security: /\.security\b/,
  services: /\.services\b/,
  sex: /\.sex\b/,
  sexy: /\.sexy\b/,
  shiksha: /\.shiksha\b/,
  shoes: /\.shoes\b/,
  shop: /\.shop\b/,
  shopping: /\.shopping\b/,
  show: /\.show\b/,
  singles: /\.singles\b/,
  site: /\.site\b/,
  ski: /\.ski\b/,
  soccer: /\.soccer\b/,
  social: /\.social\b/,
  software: /\.software\b/,
  solar: /\.solar\b/,
  solutions: /\.solutions\b/,
  soy: /\.soy\b/,
  space: /\.space\b/,
  storage: /\.storage\b/,
  store: /\.store\b/,
  stream: /\.stream\b/,
  studio: /\.studio\b/,
  study: /\.study\b/,
  sucks: /\.sucks\b/,
  supplies: /\.supplies\b/,
  supply: /\.supply\b/,
  support: /\.support\b/,
  surf: /\.surf\b/,
  surgery: /\.surgery\b/,
  systems: /\.systems\b/,
  tattoo: /\.tattoo\b/,
  tax: /\.tax\b/,
  taxi: /\.taxi\b/,
  team: /\.team\b/,
  tech: /\.tech\b/,
  technology: /\.technology\b/,
  tel: /\.tel\b/,
  tennis: /\.tennis\b/,
  theater: /\.theater\b/,
  theatre: /\.theatre\b/,
  tienda: /\.tienda\b/,
  tips: /\.tips\b/,
  tires: /\.tires\b/,
  today: /\.today\b/,
  tools: /\.tools\b/,
  top: /\.top\b/,
  tours: /\.tours\b/,
  town: /\.town\b/,
  toys: /\.toys\b/,
  trade: /\.trade\b/,
  trading: /\.trading\b/,
  training: /\.training\b/,
  tube: /\.tube\b/,
  tv: /\.tv\b/,
  university: /\.university\b/,
  uno: /\.uno\b/,
  vacations: /\.vacations\b/,
  ventures: /\.ventures\b/,
  vet: /\.vet\b/,
  viajes: /\.viajes\b/,
  video: /\.video\b/,
  villas: /\.villas\b/,
  vin: /\.vin\b/,
  vip: /\.vip\b/,
  vision: /\.vision\b/,
  vodka: /\.vodka\b/,
  vote: /\.vote\b/,
  voto: /\.voto\b/,
  voyage: /\.voyage\b/,
  wang: /\.wang\b/,
  watch: /\.watch\b/,
  webcam: /\.webcam\b/,
  website: /\.website\b/,
  wedding: /\.wedding\b/,
  whoswho: /\.whoswho\b/,
  wiki: /\.wiki\b/,
  win: /\.win\b/,
  wine: /\.wine\b/,
  work: /\.work\b/,
  works: /\.works\b/,
  world: /\.world\b/,
  wtf: /\.wtf\b/,
  xxx: /\.xxx\b/,
  xyz: /\.xyz\b/,
  yoga: /\.yoga\b/,
  zone: /\.zone\b/,
  realestate: /\.realestate\b/,
  fan: /\.fan\b/,
  art: /\.art\b/,
  bar: /\.bar\b/,
  college: /\.college\b/,
  design: /\.design\b/,
  dev: /\.dev\b/,
  feedback: /\.feedback\b/,
  host: /\.host\b/,
  ink: /\.ink\b/,
  love: /\.love\b/,
  observer: /\.observer\b/,
  online: /\.online\b/,
  press: /\.press\b/,
  protection: /\.protection\b/,
  radio_am: /\.radio\.am\b/,
  radio_fm: /\.radio\.fm\b/,
  realty: /\.realty\b/,
  rent: /\.rent\b/,
  rest: /\.rest\b/,
  security: /\.security\b/,
  shop: /\.shop\b/,
  site: /\.site\b/,
  space: /\.space\b/,
  store: /\.store\b/,
  tattoo: /\.tattoo\b/,
  tech: /\.tech\b/,
  tel: /\.tel\b/,
  theatre: /\.theatre\b/,
  tv: /\.tv\b/,
  website: /\.website\b/,
  wiki: /\.wiki\b/,
  xyz: /\.xyz\b/,
  eu: /\.eu\b/,
  eu_com: /\.eu\.com\b/,
  at: /\.at\b/,
  co_at: /\.co\.at\b/,
  or_at: /\.or\.at\b/,
  be: /\.be\b/,
  ch: /\.ch\b/,
  cz: /\.cz\b/,
  es: /\.es\b/,
  com_es: /\.com\.es\b/,
  nom_es: /\.nom\.es\b/,
  org_es: /\.org\.es\b/,
  gb_net: /\.gb\.net\b/,
  gr_com: /\.gr\.com\b/,
  hu_net: /\.hu\.net\b/,
  im: /\.im\b/,
  co_im: /\.co\.im\b/,
  com_im: /\.com\.im\b/,
  net_im: /\.net\.im\b/,
  org_im: /\.org\.im\b/,
  li: /\.li\b/,
  lt: /\.lt\b/,
  lu: /\.lu\b/,
  lv: /\.lv\b/,
  ans_lv: /\.ans\.lv\b/,
  com_lv: /\.com\.lv\b/,
  conf_lv: /\.conf\.lv\b/,
  edu_lv: /\.edu\.lv\b/,
  id_lv: /\.id\.lv\b/,
  net_lv: /\.net\.lv\b/,
  org_lv: /\.org\.lv\b/,
  me: /\.me\b/,
  nl: /\.nl\b/,
  pl: /\.pl\b/,
  com_pl: /\.com\.pl\b/,
  net_pl: /\.net\.pl\b/,
  org_pl: /\.org\.pl\b/,
  info_pl: /\.info\.pl\b/,
  biz_pl: /\.biz\.pl\b/,
  edu_pl: /\.edu\.pl\b/,
  nom_pl: /\.nom\.pl\b/,
  shop_pl: /\.shop\.pl\b/,
  waw_pl: /\.waw\.pl\b/,
  se_net: /\.se\.net\b/,
  si: /\.si\b/,
  sk: /\.sk\b/,
  co_uk: /\.co\.uk\b/,
  org_uk: /\.org\.uk\b/,
  me_uk: /\.me\.uk\b/,
  uk_com: /\.uk\.com\b/,
  uk_net: /\.uk\.net\b/,
  london: /\.london\b/,
  gr: /\.gr\b/,
  ro: /\.ro\b/,
  com_ro: /\.com\.ro\b/,
  fi: /\.fi\b/,
  de: /\.de\b/,
  com_de: /\.com\.de\b/,
  de_com: /\.de\.com\b/,
  berlin: /\.berlin\b/,
  koeln: /\.koeln\b/,
  cologne: /\.cologne\b/,
  hamburg: /\.hamburg\b/,
  wien: /\.wien\b/,
  bayern: /\.bayern\b/,
  scot: /\.scot\b/,
  brussels: /\.brussels\b/,
  vlaanderen: /\.vlaanderen\b/,
  wales: /\.wales\b/,
  cymru: /\.cymru\b/,
  melbourne: /\.melbourne\b/,
  lat: /\.lat\b/,
  gent: /\.gent\b/,
  saarland: /\.saarland\b/,
  ist: /\.ist\b/,
  istanbul: /\.istanbul\b/,
  asia: /\.asia\b/,
  ae: /\.ae\b/,
  ae_org: /\.ae\.org\b/,
  af: /\.af\b/,
  com_af: /\.com\.af\b/,
  net_af: /\.net\.af\b/,
  org_af: /\.org\.af\b/,
  ai: /\.ai\b/,
  cn_com: /\.cn\.com\b/,
  cx: /\.cx\b/,
  christmas: /\.christmas\b/,
  in: /\.in\b/,
  co_in: /\.co\.in\b/,
  net_in: /\.net\.in\b/,
  in_net: /\.in\.net\b/,
  org_in: /\.org\.in\b/,
  gen_in: /\.gen\.in\b/,
  firm_in: /\.firm\.in\b/,
  ind_in: /\.ind\.in\b/,
  io: /\.io\b/,
  jp: /\.jp\b/,
  jp_net: /\.jp\.net\b/,
  jpn_com: /\.jpn\.com\b/,
  tokyo: /\.tokyo\b/,
  nagoya: /\.nagoya\b/,
  yokohama: /\.yokohama\b/,
  la: /\.la\b/,
  mn: /\.mn\b/,
  my: /\.my\b/,
  com_my: /\.com\.my\b/,
  net_my: /\.net\.my\b/,
  org_my: /\.org\.my\b/,
  pk: /\.pk\b/,
  ph: /\.ph\b/,
  com_ph: /\.com\.ph\b/,
  net_ph: /\.net\.ph\b/,
  org_ph: /\.org\.ph\b/,
  qa: /\.qa\b/,
  sa_com: /\.sa\.com\b/,
  tl: /\.tl\b/,
  tw: /\.tw\b/,
  com_tw: /\.com\.tw\b/,
  idv_tw: /\.idv\.tw\b/,
  club_tw: /\.club\.tw\b/,
  ebiz_tw: /\.ebiz\.tw\b/,
  game_tw: /\.game\.tw\b/,
  to: /\.to\b/,
  us: /\.us\b/,
  us_com: /\.us\.com\b/,
  us_org: /\.us\.org\b/,
  ag: /\.ag\b/,
  co_ag: /\.co\.ag\b/,
  com_ag: /\.com\.ag\b/,
  net_ag: /\.net\.ag\b/,
  org_ag: /\.org\.ag\b/,
  nom_ag: /\.nom\.ag\b/,
  br_com: /\.br\.com\b/,
  bz: /\.bz\b/,
  co_bz: /\.co\.bz\b/,
  com_bz: /\.com\.bz\b/,
  net_bz: /\.net\.bz\b/,
  org_bz: /\.org\.bz\b/,
  quebec: /\.quebec\b/,
  cl: /\.cl\b/,
  com_co: /\.com\.co\b/,
  co_com: /\.co\.com\b/,
  net_co: /\.net\.co\b/,
  nom_co: /\.nom\.co\b/,
  ec: /\.ec\b/,
  com_ec: /\.com\.ec\b/,
  net_ec: /\.net\.ec\b/,
  info_ec: /\.info\.ec\b/,
  pro_ec: /\.pro\.ec\b/,
  med_ec: /\.med\.ec\b/,
  fin_ec: /\.fin\.ec\b/,
  gl: /\.gl\b/,
  co_gl: /\.co\.gl\b/,
  com_gl: /\.com\.gl\b/,
  net_gl: /\.net\.gl\b/,
  org_gl: /\.org\.gl\b/,
  gs: /\.gs\b/,
  gy: /\.gy\b/,
  co_gy: /\.co\.gy\b/,
  com_gy: /\.com\.gy\b/,
  net_gy: /\.net\.gy\b/,
  hn: /\.hn\b/,
  com_hn: /\.com\.hn\b/,
  net_hn: /\.net\.hn\b/,
  org_hn: /\.org\.hn\b/,
  ht: /\.ht\b/,
  com_ht: /\.com\.ht\b/,
  net_ht: /\.net\.ht\b/,
  org_ht: /\.org\.ht\b/,
  info_ht: /\.info\.ht\b/,
  lc: /\.lc\b/,
  co_lc: /\.co\.lc\b/,
  com_lc: /\.com\.lc\b/,
  net_lc: /\.net\.lc\b/,
  org_lc: /\.org\.lc\b/,
  mx: /\.mx\b/,
  com_mx: /\.com\.mx\b/,
  mex_com: /\.mex\.com\b/,
  pe: /\.pe\b/,
  com_pe: /\.com\.pe\b/,
  net_pe: /\.net\.pe\b/,
  org_pe: /\.org\.pe\b/,
  sr: /\.sr\b/,
  sx: /\.sx\b/,
  vc: /\.vc\b/,
  com_vc: /\.com\.vc\b/,
  net_vc: /\.net\.vc\b/,
  org_vc: /\.org\.vc\b/,
  co_ve: /\.co\.ve\b/,
  com_ve: /\.com\.ve\b/,
  vegas: /\.vegas\b/,
  nyc: /\.nyc\b/,
  miami: /\.miami\b/,
  boston: /\.boston\b/,
  ac: /\.ac\b/,
  africa: /\.africa\b/,
  as: /\.as\b/,
  cc: /\.cc\b/,
  cm: /\.cm\b/,
  co_cm: /\.co\.cm\b/,
  com_cm: /\.com\.cm\b/,
  net_cm: /\.net\.cm\b/,
  fm: /\.fm\b/,
  radio_fm: /\.radio\.fm\b/,
  gg: /\.gg\b/,
  je: /\.je\b/,
  ly: /\.ly\b/,
  com_ly: /\.com\.ly\b/,
  ms: /\.ms\b/,
  mu: /\.mu\b/,
  com_mu: /\.com\.mu\b/,
  net_mu: /\.net\.mu\b/,
  org_mu: /\.org\.mu\b/,
  nf: /\.nf\b/,
  com_nf: /\.com\.nf\b/,
  net_nf: /\.net\.nf\b/,
  org_nf: /\.org\.nf\b/,
  ng: /\.ng\b/,
  com_ng: /\.com\.ng\b/,
  nu: /\.nu\b/,
  nz: /\.nz\b/,
  co_nz: /\.co\.nz\b/,
  net_nz: /\.net\.nz\b/,
  org_nz: /\.org\.nz\b/,
  com_sb: /\.com\.sb\b/,
  net_sb: /\.net\.sb\b/,
  org_sb: /\.org\.sb\b/,
  sc: /\.sc\b/,
  com_sc: /\.com\.sc\b/,
  net_sc: /\.net\.sc\b/,
  org_sc: /\.org\.sc\b/,
  sh: /\.sh\b/,
  so: /\.so\b/,
  st: /\.st\b/,
  tk: /\.tk\b/,
  ws: /\.ws\b/,
};

const detectLinks = (text) => {
  console.log("Input text:", text);

  const linkRegex =
    /\b(?:https?:\/\/|ftp:\/\/|www\.)?[-A-Z0-9+&@#\/%?=~_|!:,.;]*[A-Z0-9+&@#\/%=~_|]/gi;
  const matches = text.match(linkRegex);

  console.log("Matches:", matches);

  const detectedLinks = [];

  if (matches) {
    matches.forEach((link) => {
      let hostname;
      // Проверяем, содержит ли ссылка протокол
      if (
        link.startsWith("http://") ||
        link.startsWith("https://") ||
        link.startsWith("ftp://")
      ) {
        const url = new URL(link);
        hostname = url.hostname.toLowerCase();
      } else {
        // Если ссылка не содержит протокола, пробуем извлечь хост напрямую
        const urlParts = link.split("/");
        hostname = urlParts[0].toLowerCase();
      }

      console.log("Hostname:", hostname);

      // Check if the hostname matches any of the domain patterns
      for (const key in domainPatterns) {
        if (domainPatterns.hasOwnProperty(key)) {
          if (domainPatterns[key].test(hostname)) {
            detectedLinks.push({ url: link, domain: key });
            break;
          }
        }
      }
    });
  }

  console.log("Detected Links:", detectedLinks);

  return detectedLinks;
};

vk.updates.on("message", async (context, next) => {
  const { text } = context.message;
  const { senderId, peerId, payload } = context;
  const parts = text.split(" ");
  const userId = senderId;
  if (silenceConf[peerId] && silenceConf[peerId].silence === 1) {
    try {
      let userRole = await getUserRole(context.peerId, context.senderId);
      if (userRole <= 20) {
        for (const cmd of commands) {
          if (
            parts[0] === cmd.command ||
            (cmd.aliases && cmd.aliases.includes(parts[0]))
          ) {
            await cmd.execute(context);
            return; // Выход из цикла после выполнения команды
          }
        }
        try {
          await vk.api.messages.delete({
            delete_for_all: 1,
            peer_id: peerId,
            cmids: context.conversationMessageId,
          });
        } catch (error) {
          console.error(error);
        }
        return;
      }
    } catch (error) {
      console.error("Ошибка при получении роли пользователя:", error);
    }
  }

  const getLinksQuery = `
  SELECT *
  FROM conference
  WHERE conference_id = ?
`;

  database.query(getLinksQuery, [context.peerId], async (error, results) => {
    if (error) {
      console.error("Ошибка при получении настроек беседы:", error);
      return context.send("Произошла ошибка при получении настроек беседы.");
    }

    const links = results[0] && results[0].links;

    if (links) {
      const userRole = await getUserRole(context.peerId, context.senderId);
      if (userRole < 20) {
        const detectedLinks = detectLinks(context.text);

        // Check if any links are detected
        if (detectedLinks.length > 0) {
          await vk.api.messages.delete({
            delete_for_all: 1,
            peer_id: peerId,
            cmids: context.conversationMessageId,
          });

          context.send({
            message: `🔴 Удалено сообщение с ссылкой от [id${context.senderId}|пользователя]!`,
          });
        }
      }
    }
  });


  const getConferenceCooldown = (peerId) => {
    return new Promise((resolve, reject) => {
      const getCooldownQuery = `
      SELECT cooldown
      FROM conference
      WHERE conference_id = ?
    `;

      database.query(getCooldownQuery, [peerId], (error, results) => {
        if (error) {
          console.error("Ошибка при получении cooldown из базы данных:", error);
          reject(error);
          return;
        }

        const cooldown = results[0] && results[0].cooldown;
        resolve(cooldown);
      });
    });
  };

  const cooldown = await getConferenceCooldown(context.peerId);

  if (cooldown > 0) {
    const userRole = await getUserRole(context.peerId, context.senderId);
    if (userRole < 20) {
      const memberIds = [context.senderId];
      const muteMinutes = cooldown;

      try {
        await vk.api.messages.changeConversationMemberRestrictions({
          peer_id: context.peerId,
          member_ids: memberIds,
          for: muteMinutes,
          action: "ro",
        });
      } catch (error) {
        console.error("Ошибка при установке КД:", error);
      }
    }
  }

  const checkAttachmentPermissions = (
    context,
    attachmentType,
    permissionMessage
  ) => {
    return new Promise((resolve, reject) => {
      let attachs = attachmentType;

      if (attachmentType == "stickers") {
        attachs = "sticker";
      }

      if (attachmentType == "docs") {
        attachs = "doc";
      }

      if (attachmentType == "images") {
        attachs = "photo";
      }

      if (attachmentType == "video") {
        attachs = "video";
      }

      if (attachmentType == "reposts") {
        attachs = "wall";
      }

      database.query(
        "SELECT * FROM conference WHERE conference_id = ?",
        [context.peerId],
        async (error, results) => {
          if (error) {
            console.error(
              `Ошибка при запросе к базе данных для вложений типа ${attachmentType}:`,
              error
            );
            reject(error);
            return;
          }

          try {
            if (results.length > 0) {
              const { [attachmentType]: permission } = results[0];
              if (permission === 1 && context.attachments) {
                const attachmentTypes = context.attachments.map(
                  (attachment) => attachment.type
                );
                if (attachmentTypes.includes(attachs)) {
                  const userRole = await getUserRole(
                    context.peerId,
                    context.senderId
                  );
                  if (userRole < 20) {
                    //await context.send(permissionMessage);
                    await vk.api.messages.delete({
                      delete_for_all: 1,
                      peer_id: context.peerId,
                      cmids: context.conversationMessageId,
                    });
                  }
                }
              }
            }

            resolve();
          } catch (error) {
            console.error(
              `Ошибка при проверке разрешений для вложений типа ${attachmentType}:`,
              error
            );
            reject(error);
          }
        }
      );
    });
  };

  await checkAttachmentPermissions(
    context,
    "stickers",
    "❌ В данном чате запрещено отправлять стикеры."
  );
  await checkAttachmentPermissions(
    context,
    "docs",
    "❌ В данном чате запрещено отправлять документы."
  );
  await checkAttachmentPermissions(
    context,
    "images",
    "❌ В данном чате запрещено отправлять фотографии."
  );
  await checkAttachmentPermissions(
    context,
    "video",
    "❌ В данном чате запрещено отправлять видео."
  );
  await checkAttachmentPermissions(
    context,
    "reposts",
    "❌ В данном чате запрещено отправлять репосты."
  );

  const conversationId = peerId;

  // Проверяем, является ли userId положительным числом
  if (userId > 0) {
    // Проверяем, существует ли запись для данного пользователя и беседы
    const selectUserQuery = `
    SELECT messages_count
    FROM conference_${conversationId}
    WHERE user_id = ?
  `;

    database.query(selectUserQuery, [userId], async (error, results) => {
      if (error) {
        return;
      }

      if (results.length === 0) {
        // Пользователь не найден в базе данных, добавляем его
        const insertUserQuery = `
        INSERT INTO conference_${conversationId} (user_id, messages_count, coins)
        VALUES (?, 1, 1)
      `;

        database.query(
          insertUserQuery,
          [userId],
          (insertError, insertResult) => {
            if (insertError) {
              console.error("Ошибка при добавлении пользователя:", insertError);
              return context.send("❌ Произошла ошибка.");
            }
          }
        );
      } else {
        // Увеличиваем messages_count на 1
        const currentMessageCount = results[0].messages_count;
        const updatedMessageCount = currentMessageCount + 1;

        const updateMessageCountQuery = `
        UPDATE conference_${conversationId}
        SET messages_count = ?
        WHERE user_id = ?
      `;

        database.query(
          updateMessageCountQuery,
          [updatedMessageCount, userId],
          (updateError, updateResult) => {
            if (updateError) {
              console.error(
                "Ошибка при обновлении количества сообщений:",
                updateError
              );
              return context.send("❌ Произошла ошибка.");
            }
          }
        );
      }
    });
  } else {
    return;
  }
  if (context.messagePayload === '{"button":"start","event_id":51898}') {
    console.log(context.messagePayload);
    console.log(context);
    await handleStartButton(context);
    return;
  }
  try {
    for (const cmd of commands) {
      if (
        parts[0] === cmd.command ||
        (cmd.aliases && cmd.aliases.includes(parts[0]))
      ) {
        await cmd.execute(context);
        return; // Выход из цикла после выполнения команды
      }
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
  } finally {
    await next();
  }
});

function generateUniqueKey() {
  const keyLength = 5;
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";

  for (let i = 0; i < keyLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters.charAt(randomIndex);
  }

  return key;
}

vk.updates.on("message_event", async (context) => {
  const eventPayload = JSON.parse(context.eventPayload);
  console.log(context);

  const selectNicknameQuery = `
    SELECT agent_access FROM agents
    WHERE user_id = ?
  `;

  const SelectPizdecQuery = `
    SELECT blocked_users FROM conference_${context.peerId}
    WHERE user_id = ?
  `;

  async function updateAgentAccess(eventPayload, accessLevel, message, context) {
    if (!Config.developers.includes(context.userId)) return;
    
    const selectResults = await databaseQuery(selectNicknameQuery, eventPayload.button);
    
    const updateNicknameQuery = `
      UPDATE agents
      SET agent_access = ?
      WHERE user_id = ?
    `;
    
    const insertNicknameQuery = `
      INSERT INTO agents (agent_access, user_id)
      VALUES (?, ?)
    `;
  
    try {
      if (selectResults.length > 0) {
        await databaseQuery(updateNicknameQuery, [accessLevel, eventPayload.button]);
      } else {
        await databaseQuery(insertNicknameQuery, [accessLevel, eventPayload.button]);
      }
      
      await vk.api.messages.send({
        peer_id: context.peerId,
        message: message,
        random_id: generateRandom32BitNumber(),
      });
      
      await vk.api.messages.delete({
        peer_id: context.peerId,
        delete_for_all: 1,
        cmids: context.conversationMessageId,
      });
    } catch (error) {
      console.error('Произошла ошибка:', error);
      await context.send('❌ Произошла ошибка.');
    }
  }
  
  if (eventPayload.event_id === 8888) {
    updateAgentAccess(eventPayload, 2, `⭐ [id${eventPayload.button}|Пользователь] получил группу «Менеджер»`, context);
  } else if (eventPayload.event_id === 8887) {
    updateAgentAccess(eventPayload, 1, `⭐ [id${eventPayload.button}|Пользователь] получил группу «Тех. поддержка»`, context);
  } else if (eventPayload.event_id === 8886) {
    updateAgentAccess(eventPayload, 3, `⭐ [id${eventPayload.button}|Пользователь] получил группу «Администратор»`, context);
  } else if (eventPayload.event_id === 8885) {
    updateAgentAccess(eventPayload, 4, `⭐ [id${eventPayload.button}|Пользователь] получил группу «Разработчик»`, context);
  } else if (eventPayload.event_id === 5512) {
    try {
      await vk.api.messages.delete({
        peer_id: context.peerId,
        delete_for_all: 1,
        cmids: context.conversationMessageId,
      });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  } else if (eventPayload.event_id === 6910) {
    const selectResults = await databaseQuery(
      SelectPizdecQuery,
      eventPayload.button
    );
    let userRole = await getUserRole(context.peerId, context.userId);
    if (userRole >= 40) {
      if (selectResults.length > 0) {
        const pizdecyopta = `
        UPDATE conference_${context.peerId}
        SET blocked_users = ?
        WHERE user_id = ?
      `;
        const selectResults = await databaseQuery(pizdecyopta, [
          null,
          eventPayload.button,
        ]);
        let userping = await getlink(context.userId);
        await vk.api.messages.send({
          peer_id: context.peerId,
          message: `${userping} разблокировал [id${eventPayload.button}|Пользователя]`,
          random_id: generateRandom32BitNumber(),
        });
      }
    }
  }
});
async function handleStartButton(context) {
  const { peerId, senderId } = context;
  const conferenceId = peerId;
  const conversationInfo = await vk.api.messages.getConversationMembers({
    peer_id: peerId,
  });

  if (
    !conversationInfo ||
    !conversationInfo.items ||
    !Array.isArray(conversationInfo.items)
  ) {
    return context.send(
      "❌ Упс... Кажется Вы не выдали мне права администратора!"
    );
  }
  // Ищем информацию о текущем пользователе (senderId) в списке участников
  const currentUserInfo = conversationInfo.items.find(
    (item) => item.member_id === senderId
  );
  console.log(currentUserInfo);
  console.log(currentUserInfo.is_owner);
  if (!currentUserInfo.is_owner) {
    return context.send("❌ Вы не являетесь владельцем чата.");
  }

  const conferenceTableQuery = `
    CREATE TABLE IF NOT EXISTS conference (
      conference_id INT PRIMARY KEY,
      games INT DEFAULT 0,
      uniquekey TEXT,
      hello_text TEXT
    )
  `;

  let popa = generateUniqueKey();
  const checkConferenceQuery =
    "SELECT * FROM conference WHERE conference_id = ?";

  database.query(conferenceTableQuery, async (error) => {
    if (error) {
      console.error("Ошибка при создании таблицы conference:", error);
      return context.send("Произошла ошибка.");
    }

    database.query(
      checkConferenceQuery,
      [conferenceId],
      async (error, results) => {
        if (error) {
          console.error("Ошибка при запросе к базе данных:", error);
          return context.send("Произошла ошибка.");
        }

        if (results.length > 0) {
          return context.send("Беседа уже активирована");
        }

        // Создание новой записи в таблице conference
        const newConferenceData = {
          conference_id: conferenceId,
          uniquekey: popa,
        };

        const nicknamesTableQuery = `
        CREATE TABLE IF NOT EXISTS nicknames_${conferenceId} (
          user_id INT PRIMARY KEY,
          nickname VARCHAR(255)
        )
      `;

        database.query(nicknamesTableQuery, async (error) => {
          if (error) {
            console.error("Ошибка при создании таблицы ролей:", error);
            return context.send("Произошла ошибка.");
          }

          const insertConferenceQuery = "INSERT INTO conference SET ?";
          database.query(
            insertConferenceQuery,
            newConferenceData,
            async (error, result) => {
              if (error) {
                console.error(
                  "Ошибка при вставке данных в базу данных:",
                  error
                );
                return context.send("Произошла ошибка.");
              }

              // Создание таблицы для конкретной беседы, если она не существует
              const conferenceTableQuery = `
              CREATE TABLE IF NOT EXISTS conference_${conferenceId} (
                user_id INT PRIMARY KEY,
                messages_count INT,
                coins INT,
                blocked_users TEXT,
                warns INT,
                warns_history TEXT,
                chat_block BOOLEAN
              )
            `;

              database.query(conferenceTableQuery, async (error) => {
                if (error) {
                  console.error("Ошибка при создании таблицы беседы:", error);
                  return context.send("Произошла ошибка.");
                }

                const rolesTableQuery = `
              CREATE TABLE IF NOT EXISTS roles_${conferenceId} (
                user_id INT PRIMARY KEY,
                role_id INT
              )
            `;

                database.query(rolesTableQuery, async (error) => {
                  if (error) {
                    console.error("Ошибка при создании таблицы ролей:", error);
                    return context.send("Произошла ошибка.");
                  }

                  // Добавление роли пользователю в базу данных
                  const insertRoleQuery = `
                INSERT INTO roles_${conferenceId} (user_id, role_id)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
              `;

                  // Назначение роли "Владелец" пользователю при создании беседы
                  database.query(
                    insertRoleQuery,
                    [senderId, 100],
                    (error, result) => {
                      if (error) {
                        console.error(
                          'Ошибка при назначении роли "Владелец":',
                          error
                        );
                        return context.send("Произошла ошибка на роли.");
                      }

                      const builder = Keyboard.builder()
                        .urlButton({
                          label: "Чат пользователей",
                          url: "https://vk.me/join/AJQ1d56Hbih3oZDBkL8JID/i",
                        })
                        .urlButton({
                          label: "Добавить бота в чат",
                          url: "https://vk.com/app6441755_-217049045?ref=group_menu",
                        })
                        .urlButton({
                          label: "Команды",
                          url: "https://vk.com/@ebal.space-help",
                        });

                      const keyboard = builder.inline();

                      context.send({
                        message: `🌀 Фантастически, теперь я могу управлять беседой!\n\n✨ Уникальный код чата: #${popa}\n🔨 Команды бота: vk.com/@ebal.space-help`,
                        keyboard,
                      });
                    }
                  );
                });
              });
            }
          );
        });
      }
    );
  });
}

async function setChatTitle(peerId, newTitle) {
  try {
    await vk.api.messages.editChat({
      chat_id: peerId - 2000000000, // У бесед ID > 2000000000, преобразуем в chat_id
      title: newTitle,
    });

    console.log("Название беседы успешно изменено.");
  } catch (error) {
    console.error("Ошибка при изменении названия беседы:", error);
  }
}

global.setChatTitle = setChatTitle;

function generateRandom32BitNumber() {
  return Math.floor(Math.random() * Math.pow(2, 32));
}
global.generateRandom32BitNumber = generateRandom32BitNumber;
vk.updates.on("chat_invite_user", async (context) => {
  const { peerId, eventMemberId } = context;

  try {
    if (eventMemberId === -217049045) {
      // Если приглашен пользователь с ID -217049045, то отправляем сообщение с клавиатурой
      const buttonPayload = {
        button: "start",
        event_id: 51898,
      };

      const keyboard = Keyboard.builder()
        .textButton({
          label: "Активировать",
          payload: JSON.stringify(buttonPayload),
          inline: true,
          color: Keyboard.PRIMARY_COLOR,
        })
        .inline();

      const fmsg =
        "💕 Бот успешно добавлен в чат!\n\n⚙ Для полноценной работы бота, нужно нажать на название беседы и кликнуть по кнопке «Назначить администратором» возле [ebal.space|бота]\n\n📝 Команды бота: vk.com/@ebal.space-help";
      await context.send({ message: fmsg, keyboard: keyboard });
    } else {
      const getUserRoleQuery = `
        SELECT hello_text, public
        FROM conference
        WHERE conference_id = ?
      `;

      const getUserBanQuery = `
        SELECT blocked_users
        FROM conference_${peerId}
        WHERE user_id = ?
      `;
      database.query(getUserRoleQuery, [peerId], async (error, results) => {
        if (error) {
          console.error("Ошибка при получении данных беседы:", error);
          return;
        }

        if (eventMemberId < 0) {
          const userRole = await getUserRole(context.peerId, context.senderId);
          if (userRole < 20) {
            const getGroupsQuery = `
  SELECT *
  FROM conference
  WHERE conference_id = ?
`;

            database.query(
              getGroupsQuery,
              [context.peerId],
              async (error, results) => {
                if (error) {
                  console.error("Ошибка при получении настроек беседы:", error);
                  return context.send(
                    "Произошла ошибка при получении настроек беседы."
                  );
                }

                const groups = results[0] && results[0].groups;

                if (groups) {
                  vk.api.messages.removeChatUser({
                    chat_id: context.chatId,
                    member_id: eventMemberId,
                  });
                  return context.send(
                    `❌ [id${context.senderId}|Пользователь] пытался добавить сообщество при запрете.`
                  );
                }
              }
            );
          }
        }

        if (eventMemberId == -188905432 || eventMemberId == -174105461 || eventMemberId == -190582509 || eventMemberId == -178513588) {
                  vk.api.messages.removeChatUser({
                    chat_id: context.chatId,
                    member_id: eventMemberId,
                  });

                  context.send(`🤢 Эй! Вы решили заменить ebaL Manager таким способом? Может попробуем решить этот вопрос по другому?\n❓ Если Вас что-то не устраивает в моей работе, то можете написать об этом моему разработчику - vk.com/devazo, Вы точно не останетесь без ответа! Постараемся решить проблему в краткие сроки.`)
        }

        const ress = await databaseQuery(getUserBanQuery, [eventMemberId]);
        const { hello_text: helloText, public: groupLink } =
          results && results[0] ? results[0] : {};
        const { blocked_users } = ress && ress[0] ? ress[0] : {};
        if (blocked_users) {
          let jsonString = JSON.parse(blocked_users);
          let banchel = await getlink(jsonString[0].blocked_by);
          let dateObject = new Date(jsonString[0].block_until);

          let formattedDate =
            dateObject.getDate() +
            " " +
            monthName(dateObject.getMonth()) +
            " " +
            dateObject.getFullYear() +
            " года";

          await context.send({
            message: `⛔ [id${eventMemberId}|Пользователь] заблокирован в этом чате:\n\nПричина: ${jsonString[0].reason}\nЗаблокировал: ${banchel}\nДата разблокировки: ${formattedDate}`,
            disable_mentions: true,
          });
          const kickResult = await vk.api.messages.removeChatUser({
            chat_id: peerId - 2000000000,
            member_id: eventMemberId,
          });
          return;
        }
        if (groupLink && groupLink.length > 0) {
          // Если у беседы установлена ссылка на группу
          try {
            const groupId = parseInt(
              groupLink.substring(groupLink.lastIndexOf("|") + 1),
              10
            );

            // Проверяем, состоит ли приглашенный участник в группе
            const isMemberResponse = await vk.api.groups.isMember({
              group_id: groupId,
              user_id: eventMemberId,
            });

            if (!isMemberResponse) {
              await context.send(
                `⛔ Приглашенный участник должен состоять в [club${groupId}|сообществе]. Пользователь был удален из беседы.`
              );
              const kickResult = await vk.api.messages.removeChatUser({
                chat_id: peerId - 2000000000,
                member_id: eventMemberId,
              });

              return;
            }
          } catch (error) {
            console.error("Ошибка при проверке участия в группе:", error);
            return;
          }
        }

        // Продолжаем с приветственным сообщением
        if (helloText) {
          const namechela = await getlink(eventMemberId);
          await context.send(`${namechela}, ${helloText}`);
        }
      });
    }
  } catch (error) {
    console.error("Ошибка при обработке события chat_invite_user:", error);
  }
});

const startDate = new Date();

global.startDate = startDate;
vk.updates.start().catch(console.error);

setInterval(() => {
  const currentDate = new Date();

  // Перебираем конференции
  for (const conferenceId in mutedUsersInfo) {
    const mutedUsersForConference = mutedUsersInfo[conferenceId];

    // Перебираем заглушки для пользователей в конференции
    for (const numericId in mutedUsersForConference) {
      const muteInfo = mutedUsersForConference[numericId];
      const muteUntil = new Date(muteInfo.mute_until);

      // Проверяем истек ли мут
      if (currentDate >= muteUntil) {
        delete mutedUsersForConference[numericId];

        const message = `⚠ У [id${numericId}|Пользователя] закончилась блокировка чата.`;

        vk.api.messages.send({
          peer_id: conferenceId,
          message: message,
          random_id: Date.now(),
        });
      }
    }
  }
}, 1000);

setInterval(async () => {
  const currentDate = new Date();

  try {
    // Получаем все conference_id из базы данных
    const selectAllConferenceIdsQuery = `
      SELECT conference_id
      FROM conference
    `;

    const conferenceRows = await databaseQuery(selectAllConferenceIdsQuery);

    for (const { conference_id } of conferenceRows) {
      // Получаем информацию о заблокированных пользователях для каждой конференции
      const selectBlockedUsersQuery = `
        SELECT blocked_users
        FROM conference_${conference_id}
      `;

      const [blockResult] = await databaseQuery(selectBlockedUsersQuery);

      let blockedUsers =
        blockResult && blockResult.blocked_users
          ? JSON.parse(blockResult.blocked_users)
          : null;

      for (const block of blockedUsers || []) {
        const { blocked_user_id, block_until } = block;
        const blockUntilDate = new Date(block_until);

        if (currentDate >= blockUntilDate) {
          // Удаление информации о блокировке для пользователя
          const updatedBlockedUsers = blockedUsers.filter(
            (b) => b.blocked_user_id !== blocked_user_id
          );

          const updateBlockedUsersQuery = `
            UPDATE conference_${conference_id}
            SET blocked_users = ?
            WHERE user_id = ?
          `;

          const updatedBlockedUsersJSON = updatedBlockedUsers.length
            ? JSON.stringify(updatedBlockedUsers)
            : null;

          await databaseQuery(updateBlockedUsersQuery, [
            updatedBlockedUsersJSON,
            blocked_user_id,
          ]);

          const message = `⚠ У [id${blocked_user_id}|Пользователя] закончилась блокировка.`;

          vk.api.messages.send({
            peer_id: conference_id,
            message: message,
            random_id: Date.now(),
          });
        }
      }
    }
  } catch (error) {
    console.error("Ошибка при проверке блокировок:", error);
  }
}, 1000);

vk.updates.on("chat_kick_user", async (context) => {
  const { eventMemberId, senderId, peerId } = context;

  if (eventMemberId === senderId) {
    try {
      const getKickLeaveQuery = `
        SELECT kick_leave
        FROM conference
        WHERE conference_id = ?
      `;

      const [rows] = await queryAsync(getKickLeaveQuery, [peerId]);
      const kickLeaveValue = rows ? rows.kick_leave : 0;
      console.log(kickLeaveValue);
      if (kickLeaveValue === 1) {
        await vk.api.messages.removeChatUser({
          chat_id: peerId - 2000000000,
          member_id: eventMemberId,
        });
      }
    } catch (error) {
      console.error(
        "Ошибка при проверке kick_leave и кике пользователя:",
        error
      );
    }
  }
});

function monthName(month) {
  var monthNames = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return monthNames[month];
}
