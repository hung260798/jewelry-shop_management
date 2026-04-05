export type StringLike = string | number | boolean;

export type Nullable<T> = T | null;

export type Updater<T> = (s: T) => T;

export type SetState<T> = (s: T | Updater<T>) => void;

export type Updaters<S extends Record<string, unknown>> = {
  [k in keyof S as `set${Capitalize<string & k>}`]: SetState<S[k]>;
};

export type StateAndUpdaters<S extends Record<string, unknown>> = S &
  Updaters<S>;
