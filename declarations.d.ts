// declarations.d.ts
declare module '*.less' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
declare module '*.glsl' {
  const str: string;
  export default str;
}

declare module 'polyline-normals' {
  const value: (p: number[][]) => [number[], number][]; // 或者根据需要定义更具体的类型
  export default value;
}
