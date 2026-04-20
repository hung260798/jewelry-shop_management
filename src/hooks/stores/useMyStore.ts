/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Store,
  StateUpdaters,
  SetStateFn,
  NewStateOrUpdater,
  NonCallable,
} from "@/utils/types/Others";
import { create, StateCreator } from "zustand";

type StateCreatorParam<T> = Parameters<StateCreator<T>>;

type UpdaterCreator<TState = any> = (
  ...outerArgs: StateCreatorParam<TState>
) => (...args: any[]) => any;

type ExtractUpdater<T, TState> =
  T extends Record<string, unknown>
    ? {
        [k in keyof T]: T[k] extends UpdaterCreator<TState>
          ? ReturnType<T[k]>
          : never;
      }
    : never;

export const createStoreHook =
  <TState extends Record<string, NonCallable>>(initState: TState) =>
  <TExtraUpdaters extends Record<string, UpdaterCreator<TState>>>(
    additionalUpdaters?: TExtraUpdaters
  ) => {
    return create<Store<TState> & ExtractUpdater<TExtraUpdaters, TState>>(
      (set, get, state) => {
        const createSetState =
          (key: keyof TState): SetStateFn<TState[keyof TState]> =>
          (arg: NewStateOrUpdater<TState[keyof TState]>) => {
            return set(
              (state) =>
                ({
                  [key]: typeof arg === "function" ? arg(state[key]) : arg,
                }) as any
            );
          };
        const updaters: Partial<StateUpdaters<TState>> = {};
        for (const k in initState) {
          if (
            typeof k !== "string" ||
            k.length === 0 ||
            k[0] !== k[0].toLowerCase()
          ) {
            throw new Error(
              `Invalid key "${k}" in initState: must be a non-empty camelCase string starting with a lowercase letter.`
            );
          }
          const keyName =
            `set${k[0].toUpperCase()}${k.substring(1)}` as keyof StateUpdaters<TState>;
          updaters[keyName] = createSetState(k) as any;
        }
        for (const k in additionalUpdaters) {
          additionalUpdaters[k] = additionalUpdaters[k](set, get, state) as any;
        }
        return {
          ...initState,
          ...updaters,
          ...(additionalUpdaters ?? {}),
        } as any;
      }
    );
  };

// const useStoreA = createStoreHook(
//   { name: "hung", age: 29 },
//   {
//     setAll: (set) => (name: string, age: number) => set({ name, age }),
//   }
// );
