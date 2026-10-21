import { ImageSourcePropType } from "react-native";
/*
The scope rule
    A file with no top-level import/export is a script. Everything in it is global automatically.
    A file with any top-level import/export is a module. Everything in it is private to that file unless you export it || In type.d.ts, the top-level import { ImageSourcePropType } makes the file a module. So interface would be private
*/

declare global {
  //define a type, TabIconProps, that can be used in any file without importing it.
  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }

  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  interface Subscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    plan?: string;
    category?: string;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
    price: number;
    currency?: string;
    billing: string;
    renewalDate?: string;
    color?: string;
  }

  //Omit is a built-in TypeScript utility type
  //creates a new type based on Subscription but excludes the id
  interface SubscriptionCardProps extends Omit<Subscription, "id"> {
    expanded: boolean;
    onPress: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  interface UpcomingSubscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    price: number;
    currency?: string;
    daysLeft: number;
  }

  interface UpcomingSubscriptionCardProps extends Omit<
    UpcomingSubscription,
    "id"
  > {}

  interface ListHeadingProps {
    title: string;
  }
}
