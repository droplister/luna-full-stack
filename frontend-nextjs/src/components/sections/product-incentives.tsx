import { TruckIcon, CheckBadgeIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface ProductIncentivesProps {
  shippingInformation?: string
  warrantyInformation?: string
}

export function ProductIncentives({ shippingInformation, warrantyInformation }: ProductIncentivesProps) {
  return (
    <div className="bg-white">
      <h2 className="sr-only">Why you should buy from us</h2>
      <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-12 lg:space-x-24">
          {shippingInformation && (
            <div className="flex items-center text-sm font-medium text-indigo-600">
              <TruckIcon aria-hidden="true" className="mr-2 size-6 flex-none" />
              <p>{shippingInformation}</p>
            </div>
          )}
          <div className="flex items-center text-sm font-medium text-indigo-600">
            <CheckBadgeIcon aria-hidden="true" className="mr-2 size-6 flex-none" />
            <p>No questions asked returns</p>
          </div>
          {warrantyInformation && warrantyInformation.toLowerCase() !== 'no warranty' && (
            <div className="flex items-center text-sm font-medium text-indigo-600">
              <CalendarIcon aria-hidden="true" className="mr-2 size-6 flex-none" />
              <p>{warrantyInformation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
