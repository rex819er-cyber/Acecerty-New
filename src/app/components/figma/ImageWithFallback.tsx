import React, { useState } from 'react'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        {(() => {
          const combined = `${src ?? ''} ${alt ?? ''}`.toLowerCase();
          const CATEGORY_IMAGES = [
            {
              keys: ['cissp', 'cism', 'ceh', 'chfi', 'security', 'cgrc', 'cdpse'],
              url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
            },
            {
              keys: ['cisa', '70-764', '70-765', 'audit', 'compliance', 'governance'],
              url: 'https://images.unsplash.com/photo-1772588627757-32365608b421?w=800&q=80',
            },
            {
              keys: ['200-301', '220-1001', '220-1002', 'n10-008', 'ccnp', 'casp', 'pt0', 'linux', 'unix', 'network'],
              url: 'https://images.unsplash.com/photo-1775519520461-6b6e068d9250?w=800&q=80',
            },
            {
              keys: ['aws', 'azure', 'cloud', 'cka', 'ccsp', 'kubernetes'],
              url: 'https://images.unsplash.com/photo-1673813497649-9b1ff22e6185?w=800&q=80',
            },
            {
              keys: ['pmp', 'pmirmp', 'agile', 'scrum', 'xp-1', 'project management'],
              url: 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=800&q=80',
            },
            {
              keys: ['python', 'developer', 'programming', 'software'],
              url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
            },
            {
              keys: ['itil', 'service management', 'it service'],
              url: 'https://images.unsplash.com/photo-1580894899378-92e56886cd4d?w=800&q=80',
            },
          ];
          const match = CATEGORY_IMAGES.find(({ keys }) => keys.some((k) => combined.includes(k)));
          const fallbackUrl = match?.url ?? 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=800&q=80';
          return (
            <img
              src={fallbackUrl}
              alt={alt ?? 'Course image'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              data-original-url={src}
            />
          );
        })()}
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
