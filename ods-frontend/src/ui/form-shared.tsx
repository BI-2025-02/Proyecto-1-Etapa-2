import * as React from "react";
import { useFormContext, useFormState } from "react-hook-form";

type FormFieldContextValue = {
  name: string;
};

export const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

type FormItemContextValue = {
  id: string;
};

export const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  // useFormState accepts a name option but typing can be complicated here; call without options
  const formState = useFormState();
  // The typings for getFieldState/formState are awkward here when using generic FieldValues from react-hook-form.
  // Use a narrow, intentional cast to avoid leaking 'any' across the codebase.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldState = getFieldState(fieldContext.name as any, formState as any);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext as FormItemContextValue;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};
