import styles from './catalog-ui.module.css'

function isQuoteLine(line: string) {
  return (
    line.startsWith('"') ||
    line.startsWith("'") ||
    line.startsWith('“') ||
    line.startsWith('‘') ||
    /^[A-Za-z0-9\s'",.!?()\-:;]+$/.test(line)
  )
}

function isTranslationLine(line: string) {
  return (
    line.includes('和訳') ||
    /(?:^|[：:])\s*訳/.test(line) ||
    line.includes('→')
  )
}

function isHeadingLine(line: string) {
  return /^#{1,3}\s+/.test(line) || (line.length <= 32 && /[:：]$/.test(line))
}

function isJapaneseLine(line: string) {
  return /[ぁ-んァ-ン一-龠々ー]/.test(line)
}

function normalizeLine(line: string) {
  const withoutPrefix = line
    .replace(/^(\-|\*|•)\s+/, '')
    .replace(/^・\s*/, '')
    .replace(/^>\s+/, '')
    .replace(/^>\s*/, '')

  const withoutInlineMarks = withoutPrefix
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')

  return withoutInlineMarks
    .replace(/^["'“‘]+/, '')
    .replace(/["'”’]+$/, '')
    .trim()
}

function parseCalloutLine(line: string) {
  const match = line.match(
    /^(補足|注|注意|メモ|NOTE|Note|TIP|Tip|TIPS|Tips)\s*[：:]\s*(.+)$/u,
  )
  if (!match) {
    return null
  }

  const [, rawTitle, rawBody] = match
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase()
  return { title, body: rawBody }
}

export function SongBody({ body }: { body: string | null }) {
  if (!body) {
    return <div className={styles.bodyCard}>未設定</div>
  }

  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const normalized = lines.map(normalizeLine).filter(Boolean)

  return (
    <div className={styles.bodyCard}>
      {(() => {
        const elements: React.ReactNode[] = []
        let lyricsLabelInserted = false

        for (let i = 0; i < normalized.length; i++) {
          const line = normalized[i]
          const rawKey = `${line}-${i}`

          const callout = parseCalloutLine(line)
          if (callout) {
            elements.push(
              <aside className={styles.bodyCallout} key={rawKey}>
                <div className={styles.bodyCalloutBody}>{callout.body}</div>
              </aside>,
            )
            continue
          }

          if (isHeadingLine(line)) {
            elements.push(
              <h3 className={styles.bodySubheading} key={rawKey}>
                {line.replace(/^#{1,3}\s+/, '').replace(/[:：]$/, '')}
              </h3>,
            )
            continue
          }

          const next = normalized[i + 1]
          const isLyricLike = isQuoteLine(line) || isTranslationLine(line) || isJapaneseLine(line)
          const nextIsLyricLike =
            typeof next === 'string' &&
            (isQuoteLine(next) || isTranslationLine(next) || isJapaneseLine(next))

          if (isLyricLike && !lyricsLabelInserted) {
            elements.push(
              <div className={styles.bodyInlineSectionTitle} key={`lyrics-label-${i}`}>
                Lyrics
              </div>,
            )
            lyricsLabelInserted = true
          }

          if (isLyricLike && nextIsLyricLike) {
            const a = line
            const b = next

            const aIsJa = isJapaneseLine(a) || isTranslationLine(a)
            const bIsJa = isJapaneseLine(b) || isTranslationLine(b)

            if (aIsJa !== bIsJa) {
              const en = aIsJa ? b : a
              const ja = aIsJa ? a : b

              elements.push(
                <div className={styles.bodyLyricPair} key={rawKey}>
                  <p className={styles.bodyLyricEn}>{en}</p>
                  <p className={styles.bodyLyricJa}>{ja}</p>
                </div>,
              )
              i += 1
              continue
            }
          }

          if (isTranslationLine(line) || isJapaneseLine(line)) {
            elements.push(
              <p className={styles.bodyTranslation} key={rawKey}>
                {line}
              </p>,
            )
            continue
          }

          if (isQuoteLine(line)) {
            elements.push(
              <p className={styles.bodyQuote} key={rawKey}>
                {line}
              </p>,
            )
            continue
          }

          elements.push(
            <p className={styles.bodyNote} key={rawKey}>
              {line}
            </p>,
          )
        }

        return elements
      })()}
    </div>
  )
}
