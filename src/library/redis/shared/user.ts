export const getUserKey = (appName: string, userId: number) => {
  return {
    hkey: `${appName}:USER`, key: `USERID:${userId}`,
  };
};
