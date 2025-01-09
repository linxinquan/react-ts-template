// declarations.d.ts
declare module '*.less' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
declare module '*.glsl' {
  const str: string;
  export default str;
}
