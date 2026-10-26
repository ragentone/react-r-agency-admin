import type {
  UserLoginMutation,
  UserPasswordChangeMutation,
  UserPasswordCreateMutation,
  UserPasswordResetMutation,
  UserUploadAvatarMutation,
} from '@generated/graphql/graphql.ts';

/*
 * Results of the auth mutations, derived from the generated operation types.
 * Codegen only emits operation types (no schema `…Return` types) – deriving them here
 * keeps them in sync with the selected fields in `graphql/*.ts`.
 */
export type UserPasswordChangeReturn = NonNullable<
  UserPasswordChangeMutation['userPasswordChange']
>;
export type UserPasswordCreateReturn = NonNullable<
  UserPasswordCreateMutation['userPasswordCreate']
>;
export type UserPasswordResetReturn = NonNullable<UserPasswordResetMutation['userPasswordReset']>;
export type UserUploadAvatarReturn = NonNullable<UserUploadAvatarMutation['userUploadAvatar']>;
export type UserLoginReturn = NonNullable<UserLoginMutation['userLogin']>;
