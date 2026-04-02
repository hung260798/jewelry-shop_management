import { API_URL } from "@/utils/constants/URLS";
import { message } from "antd";
import axios from "axios";
import { useEffect } from "react";
import { User } from "utils/types/Entities";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

const noAuthClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AuthUser extends User {
  _id: string;
  isAdmin: boolean;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user?: AuthUser;
}

interface AuthState {
  auth: AuthResponse | null;
  setAuthUser: (data: AuthUser) => Promise<void>;
  setAuth: (
    newAuth:
      | AuthState["auth"]
      | ((auth: AuthState["auth"]) => AuthState["auth"])
  ) => void;
  loading: boolean;
  setLoading: (updater: boolean | ((old: boolean) => boolean)) => void;
}

const initialState = { auth: null, loading: false };

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        setAuth: (newAuth) => {
          return set(
            (state) => ({
              auth:
                typeof newAuth === "function" ? newAuth(state.auth) : newAuth,
            }),
            false,
            {
              type: "auth/login",
            }
          );
        },
        setAuthUser: async (data: AuthUser) => {
          const auth = get().auth;
          if (!auth) return;
          set({ auth: { ...auth, user: data } }, false, {
            type: "auth/setData",
          });
        },
        setLoading: (updater) =>
          set((state) => {
            if (typeof updater === "function") {
              return { loading: updater(state.loading) };
            }
            return { loading: updater };
          }),
        ...initialState,
      }),
      {
        name: "adminWeb-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export const useFetchUserProfile = async (token?: string) => {
  const auth = useAuthStore((s) => s.auth);
  const setAuthUser = useAuthStore((s) => s.setAuthUser);
  token = token ?? window.localStorage.getItem("token") ?? auth?.token;
  useEffect(() => {
    (async () => {
      if (!token) {
        return;
      }
      const profileResponse = await noAuthClient.get<AuthUser>(
        `/employees/login/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (profileResponse.status !== 200) {
        message.error("Get profile unsuccessfully!!");
        return;
      }
      const user = profileResponse.data;
      setAuthUser(user);
    })();
  }, [token]);
};

export const useUser = () => {
  const auth = useAuthStore((s) => s.auth);
  return auth?.user;
};
