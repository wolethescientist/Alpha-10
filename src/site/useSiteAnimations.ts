import type { RefObject } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap'

/**
 * Declarative scroll animations for marketing pages. Mark elements with data attributes:
 *  data-split="lines|words|chars"  text rises out of a mask (data-immediate plays on load)
 *  data-scrub-words                words brighten as the paragraph scrolls past
 *  data-fade / data-stagger        fade-up for one element / its children
 *  data-parallax="0.2"             vertical drift relative to scroll
 *  data-count="1000"               counts up (data-decimals, data-prefix, data-suffix)
 *  data-draw                       SVG strokes draw in
 *  data-line                       hairline grows from the left
 *  data-clip                       block wipes in from the bottom
 */
export function useSiteAnimations(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const mm = gsap.matchMedia()
      mm.add({ reduce: '(prefers-reduced-motion: reduce)', ok: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
        if (ctx.conditions?.reduce) return
        const q = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel))
        const delay = 0.55 // let the page-transition curtain clear first

        q('[data-split]').forEach((el) => {
          const type = (el.dataset.split as 'lines' | 'words' | 'chars') || 'lines'
          const immediate = el.hasAttribute('data-immediate')
          SplitText.create(el, {
            type: type === 'chars' ? 'lines,chars' : type,
            mask: 'lines',
            autoSplit: true,
            linesClass: 'split-line',
            onSplit(self) {
              const targets = type === 'chars' ? self.chars : type === 'words' ? self.words : self.lines
              return gsap.from(targets, {
                yPercent: 115,
                rotate: type === 'chars' ? 4 : 0,
                duration: type === 'chars' ? 1.1 : 1.2,
                ease: 'expo.out',
                stagger: type === 'chars' ? 0.022 : type === 'words' ? 0.04 : 0.09,
                delay: immediate ? delay + Number(el.dataset.delay ?? 0) : 0,
                scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 88%' },
              })
            },
          })
        })

        q('[data-scrub-words]').forEach((el) => {
          const split = SplitText.create(el, { type: 'words' })
          gsap.fromTo(split.words, { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } })
        })

        q('[data-fade]').forEach((el) => {
          const immediate = el.hasAttribute('data-immediate')
          gsap.from(el, {
            y: 46,
            autoAlpha: 0,
            duration: 1.2,
            ease: 'expo.out',
            delay: immediate ? delay + Number(el.dataset.delay ?? 0.3) : Number(el.dataset.delay ?? 0),
            scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 90%' },
          })
        })

        q('[data-stagger]').forEach((el) => {
          gsap.from(el.children, { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%' } })
        })

        q('[data-parallax]').forEach((el) => {
          const speed = Number(el.dataset.parallax || 0.2)
          gsap.fromTo(el, { yPercent: -speed * 50 }, { yPercent: speed * 50, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
        })

        q('[data-count]').forEach((el) => {
          const to = Number(el.dataset.count)
          const decimals = Number(el.dataset.decimals ?? 0)
          const fmt = (n: number) => `${el.dataset.prefix ?? ''}${n.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${el.dataset.suffix ?? ''}`
          const obj = { v: 0 }
          el.textContent = fmt(0)
          gsap.to(obj, { v: to, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => (el.textContent = fmt(obj.v)) })
        })

        q('[data-draw] path, path[data-draw]').forEach((p, i) => {
          const immediate = p.closest('[data-immediate]')
          gsap.from(p, { drawSVG: '0%', duration: 2.2, ease: 'power2.inOut', delay: immediate ? delay + i * 0.12 : i * 0.08, scrollTrigger: immediate ? undefined : { trigger: p, start: 'top 90%' } })
        })

        q('[data-line]').forEach((el) => {
          gsap.from(el, { scaleX: 0, transformOrigin: 'left center', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%' } })
        })

        q('[data-clip]').forEach((el) => {
          gsap.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } })
        })
      })
      // fonts change line breaks; re-measure once they're in
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  )
}
