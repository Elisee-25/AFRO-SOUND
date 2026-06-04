// Configuration globale de l'application
export const CONFIG = {
  // URL Vercel déployée
  BACKEND_URL: 'https://spotify-clone-phi-lac.vercel.app', 
  // En développement local avec un simulateur Android, utilisez 10.0.2.2 au lieu de localhost
  DEV_BACKEND_URL: 'http://10.0.2.2:3000',
};

export const getBaseUrl = () => {
  if (__DEV__) {
    return CONFIG.DEV_BACKEND_URL;
  }
  return CONFIG.BACKEND_URL;
};
