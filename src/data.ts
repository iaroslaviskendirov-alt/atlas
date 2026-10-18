import type { FlagSvg } from '@/components/ui/flag-globe'
import {
  AE, AR, AT, AU, BR, CA, CL, CN, CO, CZ, DE, EG, ES, FI, FR, GB, GE, GR, ID, IE, IL, IN, IR, IT, JO, JP, KR, KZ,
  MA, MX, NL, NO, NZ, PE, PL, PT, SA, SE, TH, TR, TW, UA, US, VN,
} from 'country-flag-icons/react/3x2'

// Только флаги стран, где есть курсы — весь набор из 250 флагов сайту не нужен.
export const FLAGS: Record<string, FlagSvg> = {
  AE, AR, AT, AU, BR, CA, CL, CN, CO, CZ, DE, EG, ES, FI, FR, GB, GE, GR, ID, IE, IL, IN, IR, IT, JO, JP, KR, KZ,
  MA, MX, NL, NO, NZ, PE, PL, PT, SA, SE, TH, TR, TW, UA, US, VN,
}

export type Level = 1 | 2 | 3 | 4 | 5

// Сложность — для русскоговорящего ученика, от 1 (легко) до 5 (очень сложно).
export const LEVELS: Record<Level, { name: string; months: number; price: number; perWeek: number; color: string }> = {
  1: { name: 'Лёгкий', months: 7, price: 28000, perWeek: 2, color: '#4ade80' },
  2: { name: 'Умеренный', months: 8, price: 32000, perWeek: 2, color: '#a3e635' },
  3: { name: 'Средний', months: 10, price: 36000, perWeek: 3, color: '#facc15' },
  4: { name: 'Сложный', months: 12, price: 42000, perWeek: 3, color: '#fb923c' },
  5: { name: 'Очень сложный', months: 16, price: 48000, perWeek: 3, color: '#f87171' },
}
export const INDIVIDUAL_RATE = 2.2 // индивидуальные занятия дороже групповых

export interface Language {
  id: string
  name: string // «Испанский»
  native: string // «Español»
  level: Level
  countries: string[] // первая страна — «главная» для поиска по языку
  about: string
  highlights: string[]
}

export const LANGUAGES: Language[] = [
  { id: 'en', name: 'Английский', native: 'English', level: 2, countries: ['GB', 'US', 'CA', 'AU', 'NZ', 'IE'],
    about: 'Язык международного общения, IT и бизнеса — самый востребованный в переводе.',
    highlights: ['Британский и американский варианты', 'Деловая переписка и созвоны', 'Технический перевод для IT'] },
  { id: 'es', name: 'Испанский', native: 'Español', level: 1, countries: ['ES', 'MX', 'AR', 'CO', 'CL', 'PE'],
    about: 'Читается почти как пишется — быстрый старт и 20+ стран, где на нём говорят.',
    highlights: ['Испанский Испании и Латинской Америки', 'Разговорная практика с первого урока', 'Перевод туристических и деловых текстов'] },
  { id: 'it', name: 'Итальянский', native: 'Italiano', level: 1, countries: ['IT'],
    about: 'Мелодичный и логичный: произношение даётся русскоговорящим легко.',
    highlights: ['Язык искусства, моды и гастрономии', 'Много разговорной практики', 'Перевод меню, договоров и переписки'] },
  { id: 'pt', name: 'Португальский', native: 'Português', level: 1, countries: ['PT', 'BR'],
    about: 'Близок к испанскому, а бразильский вариант — один из самых популярных в мире.',
    highlights: ['Европейский и бразильский варианты', 'Носовые звуки — разберём отдельно', 'Деловой перевод для Бразилии'] },
  { id: 'pl', name: 'Польский', native: 'Polski', level: 1, countries: ['PL'],
    about: 'Славянский язык: много знакомых слов, но есть свои «ложные друзья переводчика».',
    highlights: ['Быстрый выход на разговорный уровень', 'Ложные друзья переводчика', 'Документы для учёбы и работы в Польше'] },
  { id: 'uk', name: 'Украинский', native: 'Українська', level: 1, countries: ['UA'],
    about: 'Близкий славянский язык — основное внимание лексике и произношению.',
    highlights: ['Отличия от русского — по полочкам', 'Чтение и письмо с первого месяца', 'Перевод документов'] },
  { id: 'fr', name: 'Французский', native: 'Français', level: 2, countries: ['FR'],
    about: 'Изящная грамматика и непростое произношение — разберём оба по шагам.',
    highlights: ['Произношение и аудирование', 'Язык дипломатии и международных организаций', 'Письменный и устный перевод'] },
  { id: 'de', name: 'Немецкий', native: 'Deutsch', level: 2, countries: ['DE', 'AT'],
    about: 'Строгая логика и падежи, знакомые по русскому — для учёбы и работы в Европе.',
    highlights: ['Подготовка к Goethe-экзаменам', 'Технический и юридический перевод', 'Немецкий для переезда'] },
  { id: 'nl', name: 'Нидерландский', native: 'Nederlands', level: 2, countries: ['NL'],
    about: 'Похож и на английский, и на немецкий — если знаете один из них, будет проще.',
    highlights: ['Быстрый старт через английский', 'Язык для работы в Нидерландах', 'Деловая переписка'] },
  { id: 'sv', name: 'Шведский', native: 'Svenska', level: 2, countries: ['SE'],
    about: 'Простая грамматика и мелодичная интонация — скандинавский язык для старта.',
    highlights: ['Интонация и тоны ударения', 'Скандинавские языки понимают друг друга', 'Перевод для IT и дизайна'] },
  { id: 'no', name: 'Норвежский', native: 'Norsk', level: 2, countries: ['NO'],
    about: 'Близок к шведскому и датскому — открывает сразу всю Скандинавию.',
    highlights: ['Букмол — основной письменный стандарт', 'Работа и учёба в Норвегии', 'Перевод документов'] },
  { id: 'cs', name: 'Чешский', native: 'Čeština', level: 2, countries: ['CZ'],
    about: 'Славянский язык с латиницей и непривычными звуками вроде «ř».',
    highlights: ['Учёба в чешских вузах', 'Ложные друзья переводчика', 'Перевод документов'] },
  { id: 'id', name: 'Индонезийский', native: 'Bahasa Indonesia', level: 2, countries: ['ID'],
    about: 'Без падежей, родов и спряжений — один из самых простых азиатских языков.',
    highlights: ['Латиница и простая грамматика', 'Бали и Юго-Восточная Азия', 'Деловое общение'] },
  { id: 'kk', name: 'Казахский', native: 'Қазақ тілі', level: 3, countries: ['KZ'],
    about: 'Тюркский язык с сингармонизмом и агглютинацией — для жизни и работы в Казахстане.',
    highlights: ['Новый латинский и кириллический алфавит', 'Госслужба и документы', 'Разговорный казахский'] },
  { id: 'tr', name: 'Турецкий', native: 'Türkçe', level: 3, countries: ['TR'],
    about: 'Слова «собираются» из частей, как конструктор — логично, но непривычно.',
    highlights: ['Агглютинация без страха', 'Туризм и торговля', 'Перевод сериалов и контента'] },
  { id: 'el', name: 'Греческий', native: 'Ελληνικά', level: 3, countries: ['GR'],
    about: 'Свой алфавит, который русскоговорящим кажется знакомым — кириллица выросла из него.',
    highlights: ['Алфавит за первую неделю', 'Корни научной лексики', 'Перевод для туризма'] },
  { id: 'fi', name: 'Финский', native: 'Suomi', level: 4, countries: ['FI'],
    about: '15 падежей и совсем другая логика — зато читается так, как пишется.',
    highlights: ['Падежи шаг за шагом', 'Работа и учёба в Финляндии', 'Деловой перевод'] },
  { id: 'he', name: 'Иврит', native: 'עברית', level: 4, countries: ['IL'],
    about: 'Письмо справа налево и система корней — красивый и очень логичный язык.',
    highlights: ['Чтение без огласовок', 'Система трёхбуквенных корней', 'Перевод документов для репатриации'] },
  { id: 'fa', name: 'Персидский', native: 'فارسی', level: 4, countries: ['IR'],
    about: 'Арабская вязь, но простая грамматика — язык великой поэзии.',
    highlights: ['Арабская графика', 'Литература и поэзия', 'Перевод деловой переписки'] },
  { id: 'hi', name: 'Хинди', native: 'हिन्दी', level: 4, countries: ['IN'],
    about: 'Письменность деванагари и звуки, которых нет в русском.',
    highlights: ['Деванагари с нуля', 'IT-аутсорс и бизнес с Индией', 'Перевод контента'] },
  { id: 'th', name: 'Тайский', native: 'ภาษาไทย', level: 4, countries: ['TH'],
    about: 'Пять тонов и свой алфавит — но грамматика очень простая.',
    highlights: ['Тоны с первого урока', 'Тайский для жизни и туризма', 'Разговорная практика'] },
  { id: 'vi', name: 'Вьетнамский', native: 'Tiếng Việt', level: 4, countries: ['VN'],
    about: 'Латиница с диакритикой и шесть тонов — главное поставить слух.',
    highlights: ['Тоны и диакритика', 'Бизнес во Вьетнаме', 'Перевод переписки'] },
  { id: 'ka', name: 'Грузинский', native: 'ქართული', level: 4, countries: ['GE'],
    about: 'Уникальный алфавит и сложные глаголы — язык, который не спутать ни с чем.',
    highlights: ['Мхедрули — грузинский алфавит', 'Туризм и переезд', 'Разговорный грузинский'] },
  { id: 'ar', name: 'Арабский', native: 'العربية', level: 5, countries: ['AE', 'SA', 'EG', 'MA', 'JO'],
    about: 'Литературный арабский и диалекты, письмо справа налево — один из самых сложных и востребованных.',
    highlights: ['Литературный арабский (фусха)', 'Диалекты Египта и Залива', 'Деловой и юридический перевод'] },
  { id: 'zh', name: 'Китайский', native: '中文', level: 5, countries: ['CN', 'TW'],
    about: 'Иероглифы и четыре тона — язык самой большой экономики Азии.',
    highlights: ['Тоны и пиньинь', 'Подготовка к HSK', 'Перевод для торговли и логистики'] },
  { id: 'ja', name: 'Японский', native: '日本語', level: 5, countries: ['JP'],
    about: 'Три системы письма и вежливые формы — для фанатов культуры и бизнеса.',
    highlights: ['Хирагана, катакана и кандзи', 'Подготовка к JLPT', 'Перевод аниме, игр и манги'] },
  { id: 'ko', name: 'Корейский', native: '한국어', level: 5, countries: ['KR'],
    about: 'Алфавит хангыль учится за пару дней, а вот грамматика и вежливость — надолго.',
    highlights: ['Хангыль за первую неделю', 'Подготовка к TOPIK', 'Перевод K-контента'] },
]

export const LANGUAGE_BY_COUNTRY: Record<string, Language> = Object.fromEntries(
  LANGUAGES.flatMap((l) => l.countries.map((c) => [c, l])),
)

let ruNames: Intl.DisplayNames | null = null
export function countryRu(code: string) {
  try {
    ruNames ??= new Intl.DisplayNames(['ru'], { type: 'region' })
    return ruNames.of(code) ?? code
  } catch {
    return code
  }
}

export const PORTFOLIO_URL = 'https://iaroslaviskendirov-alt.github.io/'
