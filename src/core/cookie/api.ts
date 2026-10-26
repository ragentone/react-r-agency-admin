import { getMeshClient } from 'r-agency-mesh-client-v1/release';

export interface ICookieApiResponse {
  success: boolean;
}

export const CookieApi = {
  /**
   * Sends accept cookie consent to the backend.
   */
  async accept(): Promise<ICookieApiResponse> {
    try {
      const response = await getMeshClient()
        .restApi('/cookie')
        .send({
          path: '/accept',
          method: 'POST',
        });
      return { success: response.isSuccess() };
    } catch (error) {
      console.warn('[cookie] accept failed', error);
      return { success: false };
    }
  },

  /**
   * Sends reject cookie consent to the backend.
   */
  async reject(): Promise<ICookieApiResponse> {
    try {
      const response = await getMeshClient()
        .restApi('/cookie')
        .send({
          path: '/reject',
          method: 'POST',
        });
      return { success: response.isSuccess() };
    } catch (error) {
      console.warn('[cookie] reject failed', error);
      return { success: false };
    }
  },
};
