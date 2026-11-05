//TypeScript doesn't know how to handle imports that aren't TypeScript | import "***.png"
//d.ts extension => a delaration file for TS

//any import that ends with .png will be treated as a module with a default export of type any
declare module "*.png" {
  const value: any;
  export default value;
}
declare module "*.jpg" {
  const value: any;
  export default value;
}
declare module "*.jpeg" {
  const value: any;
  export default value;
}
declare module "*.svg" {
  const value: any;
  export default value;
}
declare module "*.gif" {
  const value: any;
  export default value;
}
