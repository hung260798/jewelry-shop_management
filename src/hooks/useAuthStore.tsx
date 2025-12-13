import { API_URL } from "@/utils/constants/URLS";
import { User, WithId } from "@repo/utils/types";
import { message } from "antd";
import axios from "axios";
import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

const noAuthClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// interface Account {
//   email: string;
//   password: string;
// }

interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
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
}

// type LoginResponse =
//   | { token: string; refreshToken: string }
//   | { message: string };

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => {
        return {
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
          auth: null,
          // fetchUserProfile: async (token?: string) => {
          //   const auth = get().auth;
          //   token =
          //     token ?? window.localStorage.getItem("token") ?? auth?.token;
          //   const profileResponse = await noAuthClient.get<WithId<User>>(
          //     `/employees/login/profile`,
          //     {
          //       headers: {
          //         Authorization: `Bearer ${token}`,
          //       },
          //     }
          //   );
          //   if (profileResponse.status !== 200) {
          //     message.error("Get profile unsuccessfully!!");
          //     return;
          //   }
          //   const user = profileResponse.data;
          //   get().setAuthUser(user);
          // },
          setAuthUser: async (data: AuthUser) => {
            const auth = get().auth;
            if (!auth) return;
            set({ auth: { ...auth, user: data } }, false, {
              type: "auth/setData",
            });
          },
          // logout: async () => {
          //   const auth = get().auth;
          //   if (auth?.user) {
          //     axiosClientJson.patch(`/employees/${auth.user._id}`, {
          //       lastActivity: new Date(),
          //     });
          //   }
          //   localStorage.clear();
          //   window.location.href = "/";
          //   return set({ auth: null }, false, { type: "auth/logout-success" });
          // },
        };
      },
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
      const profileResponse = await noAuthClient.get<WithId<User>>(
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
