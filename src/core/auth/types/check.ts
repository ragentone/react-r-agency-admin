/**
 * Interfaces for CheckAuth GraphQL Query
 */

export interface ICheckAuthVariables {
  userRole?: string[] | string | null;
}

export type ICheckAuthParams = ICheckAuthVariables;

export interface IUserCheckAuth {
  hasPromission?: boolean | null;
  authorized?: boolean | null;
}

export type ICheckAuthReturn = IUserCheckAuth;

export interface ICheckAuthResponse {
  userCheckAuth?: IUserCheckAuth | null;
}

export type ICheckAuthQuery = ICheckAuthResponse;
