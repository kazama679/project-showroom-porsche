"use client";

import Image from "next/image";
import { Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  SelectedEquipmentGroup,
  ConfigOption,
  formatPrice,
  getOptionPriceLabel,
  MSRP_DISCLAIMER,
  ConfiguratorModel,
} from "@/utils/configurator-data";

type ConfiguratorSummaryProps = {
  model: ConfiguratorModel;
  equipmentGroups: SelectedEquipmentGroup[];
  totalPrice: number;
  equipmentPrice: number;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (groupId: string) => void;
  onChangeOption: (groupId: string, optionId: string) => void;
  onSave?: () => void;
  onCreatePorscheCode?: () => void;
  onSelectDealer?: () => void;
  onTestDrive?: () => void;
};

function EquipmentRow({
  option,
  onChange,
  locale,
  changeLabel,
}: {
  option: ConfigOption;
  onChange: () => void;
  locale?: string;
  changeLabel: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        {option.image ? (
          <div className="relative w-12 h-12 rounded-md border border-light-gray-surface overflow-hidden flex-shrink-0 bg-gray-100">
            <Image
              src={option.image}
              alt={option.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : option.color ? (
          <div
            className="w-12 h-12 rounded-md border border-light-gray-surface flex-shrink-0"
            style={{ backgroundColor: option.color }}
          />
        ) : (
          <div className="w-12 h-12 rounded-md border border-light-gray-surface bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-eyebrow text-neutral-400">—</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-light text-near-black truncate">
            {option.name}
          </p>
          <p className="text-xs text-neutral-400 font-light">{option.code}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
        <button
          type="button"
          aria-label="More information"
          className="text-dark-gray hover:text-black hidden sm:block"
        >
          <Info size={16} />
        </button>
        <span className="text-sm font-light text-dark-gray w-28 text-right">
          {getOptionPriceLabel(option, locale)}
        </span>
        <button
          type="button"
          onClick={onChange}
          className="text-sm font-light text-link-blue hover:underline whitespace-nowrap"
        >
          {changeLabel}
        </button>
      </div>
    </div>
  );
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
  const locale = useLocale();
  const t = useTranslations("configurator");
  const tc = useTranslations("common");

  return (
    <section
      id="section-summary"
      className="bg-white border-t border-gray-200 pt-16 pb-32"
    >
      <div className="mx-auto max-w-page px-4 md:px-8">
        <div className="mb-16 text-center">
          <p className="text-sm text-dark-gray font-light mb-2">
            {t("deliveryExperience")}
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-near-black mb-2">
            {t("dreamReality")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-light text-near-black mb-6">
              {t("selectedEquipment")}
            </h2>

            {equipmentGroups.map((group) => {
              const isExpanded = expandedGroups[group.id] !== false;

              return (
                <div key={group.id} className="border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => onToggleGroup(group.id)}
                    className="w-full flex items-center justify-between py-4 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <h3 className="text-base font-light text-near-black">
                      {group.title}{" "}
                      <span className="text-neutral-400">{group.count}</span>
                    </h3>
                    <span className="text-2xl text-neutral-400 font-light leading-none">
                      {isExpanded ? "−" : "+"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pb-4">
                      {group.items.map((item) => (
                        <EquipmentRow
                          key={item.id}
                          option={item}
                          onChange={() => onChangeOption(group.id, item.id)}
                          locale={locale}
                          changeLabel={t("change")}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pricing sidebar */}
          <div className="lg:border-l lg:border-gray-200 lg:pl-8">
            <div className="sticky top-20">
              <div className="mb-6">
                <h3 className="text-lg font-light text-near-black mb-1">
                  {model.name}
                </h3>
                <p className="text-sm text-dark-gray font-light">
                  {model.year}
                </p>
              </div>

              {model.defaultImage && (
                <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg border border-neutral-100 bg-gradient-to-b from-gray-50 to-white">
                  <Image
                    src={model.defaultImage}
                    alt={model.name}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-contain p-4"
                  />
                </div>
              )}

              <h3 className="text-base font-light text-near-black mb-2">
                {t("totalPrice")}
              </h3>
              <p className="text-4xl font-light text-near-black mb-8">
                {formatPrice(totalPrice, locale)}
              </p>

              <div className="space-y-4 text-sm mb-8">
                <div className="flex justify-between">
                  <span className="text-dark-gray font-light">{t("basePrice")}</span>
                  <span className="font-light">
                    {formatPrice(model.baseMsrp, locale)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-gray font-light">
                    {t("optionsPrice")}
                  </span>
                  <span className="font-light">
                    {formatPrice(equipmentPrice, locale)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onSelectDealer}
                  className="w-full py-3 bg-black text-white text-sm font-light rounded-full hover:bg-dark-surface transition-colors"
                >
                  {t("selectDealer")}
                </button>
                <button
                  type="button"
                  onClick={onTestDrive}
                  className="w-full py-3 bg-brand-red text-white text-sm font-light rounded-full hover:bg-red-800 transition-colors"
                >
                  {t("testDrive")}
                </button>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onSave}
                    className="flex-1 py-2.5 border border-light-gray-surface text-sm font-light rounded-full hover:border-black transition-colors"
                  >
                    {tc("save")}
                  </button>
                  <button
                    type="button"
                    onClick={onCreatePorscheCode}
                    className="flex-1 py-2.5 border border-light-gray-surface text-sm font-light rounded-full hover:border-black transition-colors"
                  >
                    {t("generateCode")}
                  </button>
                </div>
              </div>

              <p className="mt-6 text-eyebrow font-light leading-relaxed text-neutral-400">
                * {MSRP_DISCLAIMER}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
