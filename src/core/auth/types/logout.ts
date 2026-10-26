/**
 * Interfaces for UserLogout GraphQL Query
 */

export interface IUserLogoutReturn {
  success?: boolean | null;
}

export type IUserLogout = IUserLogoutReturn;

export interface IUserLogoutResponse {
  userLogout?: IUserLogoutReturn | null;
}

export type IUserLogoutQuery = IUserLogoutResponse;
