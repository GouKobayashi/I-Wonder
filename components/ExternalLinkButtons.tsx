import styles from './catalog-ui.module.css'

type ExternalLinkButtonItem = {
  href: string
  label: string
}

function keyForLabel(label: string) {
  return label.trim().toLowerCase()
}

function Logo({ service }: { service: 'spotify' | 'youtube' | 'apple' }) {
  if (service === 'spotify') {
    return (
      <svg
        className={styles.externalButtonIcon}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.57 14.48a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 0 1-.33-1.46c4.56-1.04 8.46-.6 11.55 1.29.35.21.46.68.25 1.03Zm1.48-3.29a.9.9 0 0 1-1.24.3c-3.23-1.99-8.15-2.57-11.95-1.42a.9.9 0 0 1-.52-1.73c4.34-1.31 9.73-.66 13.46 1.63.42.26.56.81.3 1.22l-.05.01Zm.13-3.48c-3.87-2.3-10.26-2.51-13.95-1.39a1.05 1.05 0 0 1-.61-2c4.25-1.29 11.33-1.04 15.82 1.63a1.05 1.05 0 1 1-1.07 1.76l-.19-.1Z"
        />
      </svg>
    )
  }

  if (service === 'youtube') {
    return (
      <svg
        className={styles.externalButtonIcon}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M21.6 7.2a3 3 0 0 0-2.12-2.12C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.48.48A3 3 0 0 0 2.4 7.2 31.3 31.3 0 0 0 2 12c0 1.6.14 3.2.4 4.8a3 3 0 0 0 2.12 2.12c1.88.48 7.48.48 7.48.48s5.6 0 7.48-.48a3 3 0 0 0 2.12-2.12c.26-1.58.4-3.19.4-4.8 0-1.6-.14-3.2-.4-4.8ZM10.2 15V9l5.2 3-5.2 3Z"
        />
      </svg>
    )
  }

  return (
    <svg
      className={styles.externalButtonIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M16.5 2.5c-1.1 0-2 .9-2 2v9.4a3.8 3.8 0 1 0 1.5 3V8.2l5.5-1.2V4.5c0-1.2-1-2.1-2.2-1.9l-2.8.4ZM8.7 4.3c-1.2.2-2.2 1.2-2.2 2.4v9.1a3.8 3.8 0 1 0 1.5 3V8.7l5.5-1.1V5.1c0-1.3-1.2-2.3-2.5-2.1l-2.3.3Z"
      />
    </svg>
  )
}

export function ExternalLinkButtons({
  links,
}: {
  links: ExternalLinkButtonItem[]
}) {
  return (
    <div className={styles.actions}>
      {links.map((link) => {
        const key = keyForLabel(link.label)
        const service =
          key === 'spotify' ? 'spotify' : key === 'youtube' ? 'youtube' : key === 'apple music' ? 'apple' : null

        return (
          <a
            key={link.href}
            className={[
              styles.externalButton,
              service === 'spotify' ? styles.externalButtonSpotify : null,
              service === 'youtube' ? styles.externalButtonYoutube : null,
              service === 'apple' ? styles.externalButtonAppleMusic : null,
            ]
              .filter(Boolean)
              .join(' ')}
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            {service ? <Logo service={service} /> : null}
            {link.label}
          </a>
        )
      })}
    </div>
  )
}
