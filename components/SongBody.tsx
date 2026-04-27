import styles from './catalog-ui.module.css'

function isFullLineTranslation(line: string) {
  return /^\*(?!\*)(.+)\*$/.test(line)
}

function getTranslationText(line: string) {
  if (isFullLineTranslation(line)) {
    return line.replace(/^\*/, '').replace(/\*$/, '').trim()
  }

  return null
}

function parseHeading(line: string) {
  const match = line.match(/^(#{1,6})\s+(.+)$/)
  if (!match) {
    return null
  }

  const [, hashes, text] = match
  return { level: hashes.length, text: text.trim() }
}

function isLyricSpeakerLabel(line: string) {
  return /^\[[^\]]+\]$/.test(line)
}

function isSupplementLine(line: string) {
  return line.startsWith('>')
}

function stripSupplementMarker(line: string) {
  return line.replace(/^>\s?/, '').trim()
}

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  for (match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    const inner = token.slice(1, -1)

    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-strong-${match.index}`}>{token.slice(2, -2)}</strong>,
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(<em key={`${keyPrefix}-em-${match.index}`}>{inner}</em>)
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(<code key={`${keyPrefix}-code-${match.index}`}>{inner}</code>)
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

export function SongBody({ body }: { body: string | null }) {
  if (!body) {
    return <div className={styles.bodyCard}>未設定</div>
  }

  const lines = body.split('\n')

  return (
    <div className={styles.bodyCard}>
      {(() => {
        const elements: React.ReactNode[] = []
        let sectionMode: 'default' | 'lyrics' = 'default'

        for (let i = 0; i < lines.length; i++) {
          const rawLine = lines[i]
          const line = rawLine.trim()

          if (!line) {
            continue
          }

          const rawKey = `${i}-${line}`
          const heading = parseHeading(line)
          if (heading) {
            if (heading.text.toUpperCase() === 'LYRICS') {
              sectionMode = 'lyrics'
            } else if (heading.text.toUpperCase() === 'EXPLANATION') {
              sectionMode = 'default'
            }

            if (heading.level === 1) {
              elements.push(
                <h2 className={styles.bodySectionHeading} key={rawKey}>
                  {parseInline(heading.text, rawKey)}
                </h2>,
              )
            } else {
              elements.push(
                <h3 className={styles.bodySubheading} key={rawKey}>
                  {parseInline(heading.text, rawKey)}
                </h3>,
              )
            }
            continue
          }

          if (isSupplementLine(line)) {
            const supplementLines: string[] = []

            while (i < lines.length) {
              const currentLine = lines[i].trim()
              if (!currentLine || !isSupplementLine(currentLine)) {
                break
              }

              const content = stripSupplementMarker(currentLine)
              if (content) {
                supplementLines.push(content)
              }
              i += 1
            }

            i -= 1

            if (supplementLines.length > 0) {
              elements.push(
                <aside className={styles.bodySupplement} key={rawKey}>
                  <div className={styles.bodySupplementLabel}>Supplement</div>
                  <div className={styles.bodySupplementBody}>
                    {supplementLines.map((supplementLine, supplementIndex) => (
                      <p key={`${rawKey}-supplement-${supplementIndex}`}>
                        {parseInline(supplementLine, `${rawKey}-supplement-${supplementIndex}`)}
                      </p>
                    ))}
                  </div>
                </aside>,
              )
            }
            continue
          }

          if (sectionMode === 'lyrics') {
            if (isLyricSpeakerLabel(line)) {
              elements.push(
                <div className={styles.bodyLyricLabel} key={rawKey}>
                  {line}
                </div>,
              )
              continue
            }

            const translation = getTranslationText(line)
            if (translation) {
              elements.push(
                <p className={styles.bodyTranslation} key={rawKey}>
                  {parseInline(translation, rawKey)}
                </p>,
              )
              continue
            }

            const nextLine = lines[i + 1]?.trim()
            const nextTranslation = nextLine ? getTranslationText(nextLine) : null

            if (nextTranslation) {
              elements.push(
                <div className={styles.bodyLyricPair} key={rawKey}>
                  <p className={styles.bodyLyricEn}>{parseInline(line, `${rawKey}-en`)}</p>
                  <p className={styles.bodyLyricJa}>{parseInline(nextTranslation, `${rawKey}-ja`)}</p>
                </div>,
              )
              i += 1
              continue
            }

            elements.push(
              <p className={styles.bodyQuote} key={rawKey}>
                {parseInline(line, rawKey)}
              </p>,
            )
            continue
          }

          elements.push(
            <p className={styles.bodyNote} key={rawKey}>
              {parseInline(line, rawKey)}
            </p>,
          )
        }

        return elements
      })()}
    </div>
  )
}
