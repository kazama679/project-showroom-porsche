'use client'

import Image from 'next/image'
import { Info } from 'lucide-react'
import {
  SelectedEquipmentGroup,
  ConfigOption,
  formatPrice,
  getOptionPriceLabel,
  MSRP_DISCLAIMER,
  ConfiguratorModel,
} from '@/utils/configurator-data'

type ConfiguratorSummaryProps = {
  model: ConfiguratorModel
  equipmentGroups: SelectedEquipmentGroup[]
  totalPrice: number
  equipmentPrice: number
  expandedGroups: Record<string, boolean>
  onToggleGroup: (groupId: string) => void
  onChangeOption: (groupId: string, optionId: string) => void
  onSave?: () => void
  onCreatePorscheCode?: () => void
  onSelectDealer?: () => void
  onTestDrive?: () => void
}

function EquipmentRow({
  option,
  onChange,
}: {
  option: ConfigOption
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        {option.image ? (
          <div className="relative w-12 h-12 rounded-md border border-light-gray-surface overflow-hidden flex-shrink-0 bg-gray-100">
            <Image src={option.image} alt={option.name} fill unoptimized className="object-cover" />
          </div>
        ) : option.color ? (
          <div
            className="w-12 h-12 rounded-md border border-light-gray-surface flex-shrink-0"
            style={{ backgroundColor: option.color }}
          />
        ) : (
          <div className="w-12 h-12 rounded-md border border-light-gray-surface bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-neutral-400">—</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-light text-near-black truncate">{option.name}</p>
          <p className="text-xs text-neutral-400 font-light">{option.code}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
        <button type="button" aria-label="More information" className="text-dark-gray hover:text-black hidden sm:block">
          <Info size={16} />
        </button>
        <span className="text-sm font-light text-dark-gray w-28 text-right">
          {getOptionPriceLabel(option)}
        </span>
        <button
          type="button"
          onClick={onChange}
          className="text-sm font-light text-link-blue hover:underline whitespace-nowrap"
        >
          Change
        </button>
      </div>
    </div>
  )
}

export function ConfiguratorSummary({
  model,
  equipmentGroups,
  totalPrice,
  equipmentPrice,
  expandedGroups,
  onToggleGroup,
  onChangeOption,
  onSave,
  onCreatePorscheCode,
  onSelectDealer,
  onTestDrive,
}: ConfiguratorSummaryProps) {
  return (
    <section id="section-summary" className="bg-white border-t border-gray-200 pt-16 pb-32">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        {/* Delivery Experience hero */}
        <div className="mb-16 text-center">
          <p className="text-sm text-dark-gray font-light mb-2">Delivery Experience</p>
          <h2 className="text-3xl md:text-4xl font-light text-near-black mb-2">
            Your dream becomes reality
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          {/* Equipment list */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-light text-near-black mb-6">Your selected equipment</h2>

            {equipmentGroups.map((group) => {
              const isExpanded = expandedGroups[group.id] !== false

              return (
                <div key={group.id} className="border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => onToggleGroup(group.id)}
                    className="w-full flex items-center justify-between py-4 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <h3 className="text-base font-light text-near-black">
                      {group.title}{' '}
                      <span className="text-neutral-400">{group.count}</span>
                    </h3>
                    <span className="text-2xl text-neutral-400 font-light leading-none">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pb-4">
                      {group.items.map((item) => (
                        <EquipmentRow
                          key={item.id}
                          option={item}
                          onChange={() => onChangeOption(group.id, item.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pricing sidebar */}
          <div className="lg:border-l lg:border-gray-200 lg:pl-8">
            <div className="sticky top-20">
              <div className="mb-6">
                <h3 className="text-lg font-light text-near-black mb-1">
                  {model.name}
                </h3>
                <p className="text-sm text-dark-gray font-light">{model.year}</p>
                <button
                  type="button"
                  className="text-sm font-light underline underline-offset-2 mt-2 text-near-black hover:opacity-70"
                >
                  Technical data and standard equipment
                </button>
              </div>

              {model.defaultImage && (
                <div className="relative h-48 rounded-xl overflow-hidden mb-8 bg-gray-100">
                  <Image
                    src={model.defaultImage}
                    alt={model.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}

              <h3 className="text-base font-light text-near-black mb-2">Total MSRP*</h3>
              <p className="text-4xl font-light text-near-black mb-8">{formatPrice(totalPrice)}</p>

              <div className="space-y-4 text-sm mb-8">
                <div className="flex justify-between">
                  <span className="text-dark-gray font-light">Base MSRP</span>
                  <span className="font-light">{formatPrice(model.baseMsrp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-gray font-light">Price for Equipment</span>
                  <span className="font-light">{formatPrice(equipmentPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-gray font-light">
                    Delivery, Processing and Handling Fee
                  </span>
                  <span className="font-light">{formatPrice(model.deliveryFee)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onSelectDealer}
                  className="w-full py-3 bg-black text-white text-sm font-light rounded-full hover:bg-dark-surface transition-colors"
                >
                  Select a dealer
                </button>
                <button
                  type="button"
                  onClick={onTestDrive}
                  className="w-full py-3 bg-brand-red text-white text-sm font-light rounded-full hover:bg-red-800 transition-colors"
                >
                  Đăng ký lái thử
                </button>
                <button
                  type="button"
                  className="w-full py-3 border border-black text-sm font-light rounded-full hover:bg-neutral-50 transition-colors"
                >
                  Explore Payment & Trade-In
                </button>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onSave}
                    className="flex-1 py-2.5 border border-light-gray-surface text-sm font-light rounded-full hover:border-black transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={onCreatePorscheCode}
                    className="flex-1 py-2.5 border border-light-gray-surface text-sm font-light rounded-full hover:border-black transition-colors"
                  >
                    Create Porsche Code
                  </button>
                </div>
                <button
                  type="button"
                  className="w-full py-2.5 text-sm font-light text-link-blue hover:underline"
                >
                  Download build (PDF)
                </button>
                <button
                  type="button"
                  className="w-full py-2.5 text-sm font-light text-link-blue hover:underline"
                >
                  Load existing build
                </button>
              </div>

              <p className="text-[10px] text-neutral-400 font-light mt-6 leading-relaxed">
                * {MSRP_DISCLAIMER}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
