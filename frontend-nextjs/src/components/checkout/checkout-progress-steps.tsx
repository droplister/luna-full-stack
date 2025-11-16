/**
 * Checkout Progress Steps Component
 * Displays step indicator for checkout flow
 */

import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

export interface CheckoutStep {
  name: string
  href: string
  status: 'complete' | 'current' | 'upcoming'
}

interface CheckoutProgressStepsProps {
  steps: CheckoutStep[]
}

export function CheckoutProgressSteps({ steps }: CheckoutProgressStepsProps) {
  return (
    <nav aria-label="Progress" className="hidden sm:block">
      <ol role="list" className="flex space-x-4">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="flex items-center">
            {step.status === 'current' ? (
              <a href={step.href} aria-current="page" className="text-indigo-600">
                {step.name}
              </a>
            ) : step.status === 'complete' ? (
              <Link href={step.href} className="hover:text-gray-900">
                {step.name}
              </Link>
            ) : (
              <span className="text-gray-500">{step.name}</span>
            )}

            {stepIdx !== steps.length - 1 ? (
              <ChevronRightIcon aria-hidden="true" className="ml-4 size-5 text-gray-300" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
