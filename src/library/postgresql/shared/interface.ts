export interface Conditions<T> {
  operator?: any;
  fuzzySearch?: boolean;
  attributes?: Array<keyof T>;
}
