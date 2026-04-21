import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner = `/* main.js */`;

const prod = process.argv[2] && process.argv[2].includes('production');

const buildOptions = {
    banner: {
        js: banner,
    },
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
    loader: {
        '.json': 'json'
    }
};

if (prod) {
    try {
        await esbuild.build(buildOptions);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
} else {
    const context = await esbuild.context(buildOptions);
    await context.watch();
}