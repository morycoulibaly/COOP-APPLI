import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// Compare uniquement les dates (pas l'heure) : une date "aujourd'hui" reste
// valide même si l'admin remplit le formulaire à 23h59.
export function IsNotBeforeToday(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotBeforeToday',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return false;

          const aujourdHui = new Date();
          aujourdHui.setHours(0, 0, 0, 0);
          date.setHours(0, 0, 0, 0);

          return date >= aujourdHui;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} ne peut pas être antérieure à la date du jour`;
        },
      },
    });
  };
}
