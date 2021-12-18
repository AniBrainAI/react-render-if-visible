/********************************************************************************
 *** Description: Altered source of RenderedIfVisible NPM package due to stutter
 ***              effect when directly using the package.
 ***
 *** https://dev.to/angus_russell/super-simple-list-virtualization-in-react-with-intersectionobserver-3o6g
 *** https://github.com/NightCafeStudio/react-render-if-visible/blob/main/src/render-if-visible.tsx
 ********************************************************************************/

import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Dictionary } from '../types/common';

const isServer = typeof window === 'undefined'

type Props = {
  background?: string,
  innerStyle?: Dictionary,
  /** An estimate of the element's height/width */
  defaultHeight?: number
  defaultWidth?: number,
  /** How far outside the viewport in pixels should elements be considered visible?  */
  visibleOffset?: number
  root?: HTMLElement | null
  children: ReactNode
}

const RenderIfVisible = ({
  background = 'var(--color-bg)',
  innerStyle = null,
  defaultHeight = 300,
  defaultWidth = 300,
  visibleOffset = 1000,
  root = null,
  children
}: Props) => {
  const [isVisible, setIsVisible] = useState<boolean>(isServer)
  const intersectionRef = useRef<HTMLDivElement>(null)

  // Set visibility with intersection observer
  useEffect(() => {
    if (intersectionRef.current) {
      const observer = new IntersectionObserver(
        entries => {
          if (typeof window !== undefined && window.requestIdleCallback) {
            window.requestIdleCallback(
              () => setIsVisible(entries[0].isIntersecting),
              {
                timeout: 600
              }
            )
          } else {
            setIsVisible(entries[0].isIntersecting)
          }
        },
        { root, rootMargin: `${visibleOffset}px 0px ${visibleOffset}px 0px` }
      )
      observer.observe(intersectionRef.current)
      return () => {
        if (intersectionRef.current) {
          observer.unobserve(intersectionRef.current)
        }
      }
    }
    return () => { }
  }, [intersectionRef])

  return (
    <div ref={intersectionRef}>
      {isVisible ? (
        <>{children}</>
      ) : (
        innerStyle ? (
          <div style={{ height: `${defaultHeight}px`, width: `${defaultWidth}px` }}>
            <div style={innerStyle} />
          </div>
        ) : (
          <div style={{ height: `${defaultHeight}px`, width: `${defaultWidth}px`, background: background }} />
        )
      )}
    </div>
  )
}

export default RenderIfVisible
