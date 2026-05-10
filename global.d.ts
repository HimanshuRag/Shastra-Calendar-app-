// CSS module declarations — required for TypeScript 5 with moduleResolution: "bundler"
// Side-effect CSS imports (e.g. import './globals.css') need this to satisfy the type checker.
declare module '*.css' {
    const styles: { readonly [className: string]: string }
    export default styles
}
