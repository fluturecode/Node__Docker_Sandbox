export interface ValidationConst {
  validation: RegExp;
  message: string;
}

export const ValidPassword: ValidationConst = {
  validation: /(?:(?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
  message: 'Password needs to include 1 uppercase letter, 1 lowercase letter, 1 number and a special character.'
};