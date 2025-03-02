// src/common/decorators/validation.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// Валидатор для пароля
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string) {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
    return typeof password === 'string' && passwordRegex.test(password);
  }

  defaultMessage(args: ValidationArguments) {
    const value = args.value as string;
    if (!value) return 'Пароль обязателен';
    if (value.length < 8) return 'Пароль должен содержать минимум 8 символов';
    if (!/[A-Z]/.test(value))
      return 'Пароль должен содержать минимум одну заглавную букву';
    if (!/[a-z]/.test(value))
      return 'Пароль должен содержать минимум одну строчную букву';
    if (!/[0-9]/.test(value))
      return 'Пароль должен содержать минимум одну цифру';
    if (!/[^A-Za-z0-9]/.test(value))
      return 'Пароль должен содержать минимум один специальный символ';
    return 'Пароль не соответствует требованиям';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

// Валидатор для полного имени
@ValidatorConstraint({ name: 'isValidFullName', async: false })
export class IsValidFullNameConstraint implements ValidatorConstraintInterface {
  validate(fullName: string) {
    const fullNameRegex = /^[a-zA-Z\s'-]+$/;
    return (
      typeof fullName === 'string' &&
      fullName.length >= 2 &&
      fullName.length <= 50 &&
      fullNameRegex.test(fullName)
    );
  }

  defaultMessage(args: ValidationArguments) {
    const value = args.value as string;
    if (!value) return 'Полное имя обязательно';
    if (value.length < 2)
      return 'Полное имя должно содержать минимум 2 символа';
    if (value.length > 50) return 'Полное имя должно быть короче 50 символов';
    if (!/^[a-zA-Z\s'-]+$/.test(value))
      return 'Полное имя может содержать только буквы, пробелы, дефисы и апострофы';
    return 'Полное имя не соответствует требованиям';
  }
}

export function IsValidFullName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidFullNameConstraint,
    });
  };
}
