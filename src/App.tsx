import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowRight, BookOpen, Check, Clock, Globe2, Languages, MousePointerClick, Search, Users, X } from 'lucide-react'
import { DotGlobeHero } from '@/components/ui/globe-hero'
import { COUNTRY_COORDINATES, FlagGlobe } from '@/components/ui/flag-globe'
import { FLAGS, INDIVIDUAL_RATE, LANGUAGES, LANGUAGE_BY_COUNTRY, LEVELS, PORTFOLIO_URL, countryRu, type Language } from '@/data'
import { cn } from '@/lib/utils'

const money = (n: number) => Math.round(n / 500) * 500 === n ? n.toLocaleString('ru-RU') + ' ₸' : (Math.round(n / 500) * 500).toLocaleString('ru-RU') + ' ₸'
const MARKERS = LANGUAGES.flatMap((l) => l.countries.map((code) => ({ code, label: `${countryRu(code)} — ${l.name.toLowerCase()}` })))
const ALL_COUNTRIES = Object.keys(COUNTRY_COORDINATES).filter((c) => c !== 'AQ').map((code) => ({ code, name: countryRu(code) }))

type Option =
  | { kind: 'lang'; lang: Language }
  | { kind: 'country'; code: string; name: string; lang?: Language }

function Flag({ code, className }: { code: string; className?: string }) {
  const F = FLAGS[code]
  return F ? <F className={cn('block rounded-[3px] shadow-sm', className)} /> : null
}

function Difficulty({ level, size = 'md' }: { level: number; size?: 'sm' | 'md' }) {
  const color = LEVELS[level as 1].color
  return (
    <div className="flex items-center gap-1" aria-label={`Сложность ${level} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn('rounded-full', size === 'sm' ? 'h-1.5 w-4' : 'h-2 w-7')}
          style={{ background: i <= level ? color : 'var(--border)' }} />
      ))}
    </div>
  )
}

export default function App() {
  const [selected, setSelected] = useState<{ lang: Language; country: string } | null>(null)
  const [focus, setFocus] = useState<{ code: string; key: number } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [openList, setOpenList] = useState(false)
  const [cursor, setCursor] = useState(0)
  const [searching, setSearching] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (text: string) => {
    setToast(text)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  const focusCountry = (code: string) => setFocus({ code, key: Date.now() })

  const openCountry = (code: string) => {
    focusCountry(code)
    const lang = LANGUAGE_BY_COUNTRY[code]
    if (lang) {
      setSelected({ lang, country: code })
      setToast(null)
    } else {
      setSelected(null)
      showToast(`${countryRu(code)}: курса по языку этой страны пока нет`)
    }
  }
  const openLanguage = (lang: Language, scroll = false) => {
    openCountry(lang.countries[0])
    if (scroll) document.getElementById('explore')?.scrollIntoView({ block: 'start' })
  }

  // ---- поиск: языки и страны ----
  const options = useMemo<Option[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const langs = LANGUAGES.filter((l) => l.name.toLowerCase().startsWith(q) || l.native.toLowerCase().startsWith(q))
      .map((lang): Option => ({ kind: 'lang', lang }))
    const starts = ALL_COUNTRIES.filter((c) => c.name.toLowerCase().startsWith(q))
    const contains = ALL_COUNTRIES.filter((c) => !c.name.toLowerCase().startsWith(q) && c.name.toLowerCase().includes(q))
    const countries = [...starts, ...contains]
      .sort((a, b) => Number(!!LANGUAGE_BY_COUNTRY[b.code]) - Number(!!LANGUAGE_BY_COUNTRY[a.code]))
      .map((c): Option => ({ kind: 'country', ...c, lang: LANGUAGE_BY_COUNTRY[c.code] }))
    return [...langs, ...countries].slice(0, 8)
  }, [query])

  const choose = (o: Option) => {
    if (o.kind === 'lang') openLanguage(o.lang)
    else openCountry(o.code)
    setQuery(o.kind === 'lang' ? o.lang.name : o.name)
    setOpenList(false)
  }
  const onSearchKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!options.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpenList(true); setCursor((c) => (c + 1) % options.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => (c - 1 + options.length) % options.length) }
    else if (e.key === 'Enter') { e.preventDefault(); choose(options[Math.min(cursor, options.length - 1)]) }
    else if (e.key === 'Escape') setOpenList(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const sortedLanguages = useMemo(() => [...LANGUAGES].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name, 'ru')), [])

  return (
    <div className="min-h-svh bg-background font-sans text-foreground">
      {/* ---------- Первый экран ---------- */}
      <DotGlobeHero rotationSpeed={0.004} className="h-svh bg-gradient-to-br from-background via-background/95 to-muted/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/30" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-primary/5 blur-3xl" />

        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-10">
          <div className="font-display text-lg font-semibold tracking-[0.2em]">ATLAS</div>
          <a href="#courses" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Все курсы</a>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl space-y-10 px-6 py-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="relative inline-flex items-center gap-3 rounded-full border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 px-5 py-2.5 shadow-2xl backdrop-blur-xl">
              <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
              <span className="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">Школа языков и перевода</span>
              <span className="h-2 w-2 animate-ping rounded-full bg-primary [animation-delay:.5s]" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}
              className="font-display text-5xl leading-[0.95] font-extrabold tracking-tight select-none sm:text-7xl lg:text-8xl">
              <span className="mb-3 block text-3xl font-normal text-foreground/70 sm:text-5xl lg:text-6xl">Говорите</span>
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent">с целым миром</span>
                <motion.span initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 1.2, ease: 'easeOut' }}
                  className="absolute -bottom-4 left-0 h-2 rounded-full bg-gradient-to-r from-primary via-primary/80 to-transparent shadow-lg shadow-primary/50" />
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }}
              className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {LANGUAGES.length} языков — от лёгкого испанского до японского. Найдите страну на глобусе и узнайте, сколько займёт обучение и{' '}
              <span className="rounded-md bg-primary/15 px-2 py-0.5 font-semibold text-foreground">сколько оно стоит</span>.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.a href="#explore" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}
              className="group relative inline-flex min-h-14 items-center gap-3 overflow-hidden rounded-xl bg-primary px-8 font-semibold text-primary-foreground shadow-xl shadow-primary/25">
              <Globe2 className="h-5 w-5" /> Выбрать язык на глобусе
              <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
            </motion.a>
            <motion.a href="#courses" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}
              className="inline-flex min-h-14 items-center gap-3 rounded-xl border-2 border-border bg-background/60 px-8 font-semibold backdrop-blur-xl transition-colors hover:border-primary/50">
              <BookOpen className="h-5 w-5" /> Все курсы и цены
            </motion.a>
          </motion.div>
        </div>
      </DotGlobeHero>

      {/* ---------- Глобус с поиском ---------- */}
      <section id="explore" className="mx-auto max-w-6xl px-5 pt-20 pb-10">
        <div className="text-center">
          <div className="text-xs font-bold tracking-[0.3em] text-primary uppercase">Выберите язык</div>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Куда отправимся?</h2>
          <p className="mt-3 text-muted-foreground">Нажмите на флаг или найдите страну — глобус сам повернётся к ней.</p>
        </div>

        {/* Поиск */}
        <div className="relative mx-auto mt-8 max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpenList(true); setCursor(0) }}
            onFocus={() => { setOpenList(true); setSearching(true) }}
            onBlur={() => setTimeout(() => { setOpenList(false); setSearching(false) }, 150)}
            onKeyDown={onSearchKey}
            placeholder="Страна или язык: Япония, испанский…"
            aria-label="Поиск страны или языка"
            role="combobox"
            aria-expanded={openList && options.length > 0}
            aria-controls="search-list"
            aria-activedescendant={openList && options.length ? `opt-${cursor}` : undefined}
            className="min-h-14 w-full rounded-2xl border border-border bg-muted/60 pr-12 pl-12 text-base shadow-lg outline-none backdrop-blur transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Очистить поиск"
              className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <AnimatePresence>
            {openList && options.length > 0 && (
              <motion.ul id="search-list" role="listbox" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-[#0b1222] p-1.5 shadow-2xl">
                {options.map((o, i) => (
                  <li key={o.kind === 'lang' ? `l-${o.lang.id}` : `c-${o.code}`} id={`opt-${i}`} role="option" aria-selected={i === cursor}
                    onMouseDown={(e) => { e.preventDefault(); choose(o) }} onMouseEnter={() => setCursor(i)}
                    className={cn('flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5', i === cursor && 'bg-accent')}>
                    {o.kind === 'lang' ? (
                      <>
                        <Languages className="h-5 w-5 flex-none text-primary" />
                        <span className="flex-1"><b>{o.lang.name}</b> <span className="text-muted-foreground">· {o.lang.native}</span></span>
                        <span className="text-xs text-muted-foreground">{o.lang.countries.length} {o.lang.countries.length === 1 ? 'страна' : 'стран(ы)'}</span>
                      </>
                    ) : (
                      <>
                        {o.lang ? <Flag code={o.code} className="h-4 w-6 flex-none" /> : <span className="h-4 w-6 flex-none rounded-[3px] bg-border" />}
                        <span className="flex-1">{o.name}</span>
                        <span className={cn('text-xs', o.lang ? 'text-primary' : 'text-muted-foreground')}>{o.lang ? o.lang.name : 'нет курса'}</span>
                      </>
                    )}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_400px]">
          <div className="relative mx-auto w-full max-w-[600px]">
            <FlagGlobe
              markers={MARKERS}
              flags={FLAGS}
              altitude={0.12}
              rotationSpeed={0.12}
              autoRotate={!selected && !searching}
              activeCode={selected?.country ?? null}
              focusCode={focus?.code ?? null}
              focusKey={focus?.key}
              onFlagClick={openCountry}
              className="mx-auto"
              style={{ width: 'min(600px, 100%, 78vh)' }}
            />
            <AnimatePresence>
              {toast && (
                <motion.div role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-x-0 bottom-2 mx-auto w-fit max-w-[90%] rounded-full border border-border bg-[#0b1222] px-5 py-2.5 text-center text-sm shadow-xl">
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Окно курса: справа на компьютере */}
          <div className="hidden lg:block">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.lang.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }}>
                  <CoursePanel {...selected} onClose={() => setSelected(null)} onCountry={openCountry} />
                </motion.div>
              ) : (
                <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Hint />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Окно курса: снизу на телефоне */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 flex items-end bg-black/30 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} className="max-h-[72svh] w-full overflow-y-auto rounded-t-3xl">
              <CoursePanel key={selected.lang.id} {...selected} onClose={() => setSelected(null)} onCountry={openCountry} sheet />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Все курсы ---------- */}
      <section id="courses" className="mx-auto max-w-6xl px-5 pt-16 pb-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-bold tracking-[0.3em] text-primary uppercase">Все курсы</div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">От лёгкого к сложному</h2>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {([1, 2, 3, 4, 5] as const).map((l) => (
              <span key={l} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: LEVELS[l].color }} />{LEVELS[l].name}</span>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedLanguages.map((l) => (
            <button key={l.id} type="button" onClick={() => openLanguage(l, true)}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted">
              <Flag code={l.countries[0]} className="h-8 w-12 flex-none" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold">{l.name}</span>
                  <span className="flex-none text-sm text-primary">{money(LEVELS[l.level].price)}<span className="text-muted-foreground">/мес</span></span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Difficulty level={l.level} size="sm" />
                  <span className="text-xs text-muted-foreground">{LEVELS[l.level].months} мес до B1</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Как проходит обучение ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Users, title: 'Группы до 8 человек', text: 'Или индивидуально — в удобное время, онлайн и офлайн.' },
            { icon: Languages, title: 'Модуль перевода', text: 'В каждом курсе: письменный перевод, деловые письма и устный последовательный.' },
            { icon: Check, title: 'Пробный урок бесплатно', text: 'Определим уровень и подберём группу за 30 минут.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-muted/40 p-6">
              <f.icon className="h-6 w-6 text-primary" />
              <div className="mt-4 font-semibold">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl border-t border-border px-5 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <div><span className="font-display font-semibold tracking-[0.2em] text-foreground">ATLAS</span> · школа языков и перевода</div>
          <a href={PORTFOLIO_URL} className="hover:text-foreground">Сделал Ярослав ↗</a>
        </div>
        <p className="mt-3 text-xs opacity-70">Концепт сайта: школа, цены и сроки вымышленные. Сложность указана примерно, для русскоговорящих.</p>
      </footer>
    </div>
  )
}

function Hint() {
  return (
    <div className="rounded-3xl border border-border bg-muted/40 p-7">
      <MousePointerClick className="h-7 w-7 text-primary" />
      <h3 className="mt-4 font-display text-xl font-semibold">Как выбрать курс</h3>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        <li>· Нажмите на флаг на глобусе</li>
        <li>· Или найдите страну или язык в поиске сверху</li>
        <li>· Крутите глобус мышкой или стрелками ← →</li>
      </ul>
      <div className="mt-6 space-y-2 border-t border-border pt-5">
        {([1, 3, 5] as const).map((l) => (
          <div key={l} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{LEVELS[l].name}</span>
            <span>от {money(LEVELS[l].price)}/мес</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CoursePanel({ lang, country, onClose, onCountry, sheet }: {
  lang: Language; country: string; onClose: () => void; onCountry: (code: string) => void; sheet?: boolean
}) {
  const [individual, setIndividual] = useState(false)
  const [signup, setSignup] = useState<'idle' | 'form' | 'done'>('idle')
  const [name, setName] = useState('')
  const lvl = LEVELS[lang.level]
  const perMonth = individual ? lvl.price * INDIVIDUAL_RATE : lvl.price

  return (
    <div role="dialog" aria-label={`Курс: ${lang.name} язык`}
      className={cn('relative border border-border bg-[#0b1222] p-6 shadow-2xl', sheet ? 'rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]' : 'rounded-3xl')}>
      {sheet && <div className="mx-auto -mt-2 mb-4 h-1.5 w-10 rounded-full bg-border" />}
      <button type="button" onClick={onClose} aria-label="Закрыть" className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent">
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-4 pr-10">
        <Flag code={country} className="h-10 w-15 flex-none" />
        <div>
          <div className="font-display text-2xl font-semibold">{lang.name}</div>
          <div className="text-sm text-muted-foreground">{lang.native} · {countryRu(country)}</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{lang.about}</p>

      {lang.countries.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {lang.countries.map((c) => (
            <button key={c} type="button" onClick={() => onCountry(c)} title={countryRu(c)}
              className={cn('rounded-md p-0.5 transition-transform hover:scale-110', c === country && 'ring-2 ring-primary')}>
              <Flag code={c} className="h-4 w-6" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Сложность</span>
          <span className="text-sm font-semibold" style={{ color: lvl.color }}>{lvl.name}</span>
        </div>
        <div className="mt-2"><Difficulty level={lang.level} /></div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{lvl.months} мес до B1</div>
          <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />{lvl.perWeek} занятия / нед</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-sm font-semibold">
        {[false, true].map((ind) => (
          <button key={String(ind)} type="button" onClick={() => setIndividual(ind)} aria-pressed={individual === ind}
            className={cn('min-h-10 rounded-lg transition-colors', individual === ind ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {ind ? 'Индивидуально' : 'В группе'}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="font-display text-3xl font-semibold">{money(perMonth)}</div>
          <div className="text-xs text-muted-foreground">в месяц</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">до B1 ≈<br /><span className="text-sm font-semibold text-foreground">{money(perMonth * lvl.months)}</span></div>
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        {lang.highlights.map((h) => (
          <li key={h} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-primary" />{h}</li>
        ))}
        <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-primary" />Модуль перевода: тексты, письма, устный перевод</li>
      </ul>

      <div className="mt-6">
        {signup === 'idle' && (
          <button type="button" onClick={() => setSignup('form')}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition-transform hover:scale-[1.01]">
            Записаться на пробный урок <ArrowRight className="h-4 w-4" />
          </button>
        )}
        {signup === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); if (name.trim().length > 1) setSignup('done') }} className="flex gap-2">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" aria-label="Ваше имя" autoComplete="given-name"
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-border bg-muted px-4 outline-none focus:border-primary" />
            <button type="submit" disabled={name.trim().length < 2} className="min-h-12 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-40">Ок</button>
          </form>
        )}
        {signup === 'done' && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm">
            <b>{name.trim()}, вы записаны на пробный урок ({lang.name.toLowerCase()})!</b>
            <p className="mt-1 text-muted-foreground">Это концепт-сайт, поэтому заявка никуда не отправилась.</p>
          </div>
        )}
      </div>
    </div>
  )
}
