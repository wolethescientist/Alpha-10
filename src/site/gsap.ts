import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Flip } from 'gsap/Flip'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin, Flip, useGSAP)

gsap.defaults({ ease: 'power3.out', duration: 1 })

export const EASE_OUT = 'expo.out'
export const EASE_IN_OUT = 'power4.inOut'

export { DrawSVGPlugin, Flip, gsap, ScrollSmoother, ScrollTrigger, SplitText, useGSAP }
