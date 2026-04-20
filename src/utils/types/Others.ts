export type StringLike = string | number | boolean;

export type NonCallable = string | number | boolean | object | undefined | null;

export type Nullable<T> = T | null;

export type StateUpdater<T> = (s: T) => T;

export type NewStateOrUpdater<T> = T | StateUpdater<T>;

export type SetStateFn<T> = (s: NewStateOrUpdater<T>) => void;

export type StateUpdaters<S extends Record<string, unknown>> = {
  [K in keyof S as `set${Capitalize<string & K>}`]: SetStateFn<S[K]>;
};

export type Store<S extends Record<string, unknown>> = S & StateUpdaters<S>;
