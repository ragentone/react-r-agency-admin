/**
 * Interfaces for UserEmailExists and UserAliasExists GraphQL Queries
 */

export interface IUserEmailExistsVariables {
  email: string;
}

export type IUserEmailExistsParams = IUserEmailExistsVariables;

export interface IUserEmailExistsReturn {
  exists?: boolean | null;
}

export type IUserEmailExists = IUserEmailExistsReturn;

export interface IUserEmailExistsResponse {
  userEmailExists?: IUserEmailExistsReturn | null;
}

export type IUserEmailExistsQuery = IUserEmailExistsResponse;

export interface IUserAliasExistsVariables {
  alias: string;
}

export type IUserAliasExistsParams = IUserAliasExistsVariables;

export interface IUserAliasExistsReturn {
  exists?: boolean | null;
}

export type IUserAliasExists = IUserAliasExistsReturn;

export interface IUserAliasExistsResponse {
  userAliasExists?: IUserAliasExistsReturn | null;
}

export type IUserAliasExistsQuery = IUserAliasExistsResponse;
