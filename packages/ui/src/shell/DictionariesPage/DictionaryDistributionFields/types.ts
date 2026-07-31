export interface DictionaryDistributionFieldsProps {
  item: import('@schdk/common').SchdkDictionaryItem;
  onChange(
    value: import('@schdk/common').SchdkDictionaryDistribution extends Record<
      infer Key,
      number
    >
      ? Key
      : never,
    percentage: number,
  ): void;
}
