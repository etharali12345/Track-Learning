import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import adobe from "@/assets/icons/adobe.png";
import back from "@/assets/icons/back.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import dropbox from "@/assets/icons/dropbox.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import home from "@/assets/icons/home.png";
import medium from "@/assets/icons/medium.png";
import menu from "@/assets/icons/menu.png";
import notion from "@/assets/icons/notion.png";
import openai from "@/assets/icons/openai.png";
import plus from "@/assets/icons/plus.png";
import setting from "@/assets/icons/setting.png";
import spotify from "@/assets/icons/spotify.png";
import wallet from "@/assets/icons/wallet.png";

export const icons = {
  home,
  wallet,
  setting,
  activity,
  add,
  back,
  menu,
  plus,
  notion,
  dropbox,
  openai,
  adobe,
  medium,
  figma,
  spotify,
  github,
  claude,
  canva,
} as const;
//as const: tells TypeScript to treat the keys as fixed and read-only

export type IconKey = keyof typeof icons;
//keyof takes that shape and gives you only the names of its keys, as a union
//You need typeof because keyof works on types(shape), not on real values.
//typeof (shape) ===> { readonly home: ImageType; readonly wallet: ImageType; ... }
//keyof ====> "home" | "wallet" | "setting" | "activity" | ... | "canva"

//purpose: create a type that represents the keys, so in another components, we specify the parameter type as IconKey, and TypeScript will enforce that only valid keys from the icons object can be used.
