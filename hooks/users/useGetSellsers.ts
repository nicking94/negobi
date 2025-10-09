// hooks/users/useGetSellers.ts
import useGetUsers from "./useGetUsers";

export const useGetSellers = () => {
  const usersHook = useGetUsers();

  const sellers = usersHook.users.filter((user) => user.role === "sellers");

  return {
    ...usersHook,
    users: sellers,
  };
};
