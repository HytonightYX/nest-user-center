export interface CommonFindOptions<T> {
  attributes?: Array<keyof T>;
  fuzzySearch?: boolean;
}
