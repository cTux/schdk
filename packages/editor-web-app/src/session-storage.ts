export type SessionStorage = Pick<
  Storage,
  'getItem' | 'removeItem' | 'setItem'
>;
