import { FieldError } from "../graphql_types/object_types";

export default function validatePassword(password: string): FieldError[] {
  const errors: FieldError[] = [];

  if (password.length <= 4) {
    errors.push({
      message: "Password must have at least 5 characters.",
      field: "password",
    });
  }

  return errors;
}
