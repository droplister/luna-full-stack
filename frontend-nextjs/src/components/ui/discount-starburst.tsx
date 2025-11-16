/**
 * Discount Starburst Badge
 * 20-pointed starburst badge displaying discount percentage
 * Uses violet brand color from promo bar
 */

interface DiscountStarburstProps {
  discount: number
}

export function DiscountStarburst({ discount }: DiscountStarburstProps) {
  // Only show if there's an actual discount
  if (discount <= 0) return null

  // Generate 20-pointed starburst path
  const points = 20
  const outerRadius = 30 // 60px diameter
  const innerRadius = 22 // Creates the jagged effect
  const centerX = 30
  const centerY = 30

  const generateStarburstPath = () => {
    let path = ''
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (Math.PI * i) / points
      const x = centerX + radius * Math.cos(angle - Math.PI / 2)
      const y = centerY + radius * Math.sin(angle - Math.PI / 2)
      path += `${i === 0 ? 'M' : 'L'} ${x},${y} `
    }
    return path + 'Z'
  }

  return (
    <div className="relative shrink-0" style={{ width: '60px', height: '60px' }}>
      <svg
        viewBox="0 0 60 60"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Starburst shape */}
        <path
          d={generateStarburstPath()}
          className="fill-violet-600"
        />
      </svg>

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-bold text-sm leading-none">
          {discount}%
        </span>
        <span className="text-white font-bold text-[10px] leading-none mt-0.5">
          OFF
        </span>
      </div>
    </div>
  )
}
