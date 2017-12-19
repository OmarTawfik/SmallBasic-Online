import * as fs from "fs";
import * as gulp from "gulp";
import * as path from "path";
import * as helpers from "./build/gulp-helpers";
import { generateModels } from "./build/generate-models";
import { generateLocStrings } from "./build/generate-loc-strings";

gulp.task("generate-errors-strings", () => generateLocStrings("ErrorResources", "errors"));
gulp.task("generate-syntax-kinds-strings", () => generateLocStrings("SyntaxKindResources", "syntax-kinds"));
gulp.task("generate-token-kinds-strings", () => generateLocStrings("TokenKindResources", "token-kinds"));

gulp.task("generate-loc-strings", [
    "generate-errors-strings",
    "generate-syntax-kinds-strings",
    "generate-token-kinds-strings"
]);

gulp.task("generate-syntax-expressions", () => generateModels("syntax-expressions"));
gulp.task("generate-syntax-commands", () => generateModels("syntax-commands"));
gulp.task("generate-syntax-statements", () => generateModels("syntax-statements"));
gulp.task("generate-bound-statements", () => generateModels("bound-statements"));
gulp.task("generate-bound-expressions", () => generateModels("bound-expressions"));

gulp.task("generate-models", [
    "generate-syntax-expressions",
    "generate-syntax-commands",
    "generate-syntax-statements",
    "generate-bound-expressions",
    "generate-bound-statements"
]);

gulp.task("watch-source", ["generate-models", "generate-loc-strings"], () => {
    gulp.watch("build/**", ["generate-models", "generate-loc-strings"]);

    helpers.runWebpack({
        projectPath: "./src/app/webpack.config.ts",
        release: false,
        watch: true
    });
});

gulp.task("build-tests", () => helpers.runWebpack({
    projectPath: "./tests/webpack.config.ts",
    release: false,
    watch: false
}));

gulp.task("run-tests", ["build-tests"], () => helpers.cmdToPromise("node", [
    "./node_modules/jasmine/bin/jasmine.js",
    "./out/tests/tests.js"
]));

gulp.task("watch-tests", () => {
    gulp.watch(["build/**"], ["generate-models", "generate-loc-strings"]);
    gulp.watch(["src/**", "tests/**"], ["run-tests"]);
});

gulp.task("release", ["generate-models", "generate-loc-strings"], () =>
    helpers.rimrafToPromise("./out/app")
    .then(() => helpers.runWebpack({
        projectPath: "./src/app/webpack.config.ts",
        release: true,
        watch: false
    })));

gulp.task("package", ["release"], () => {
    const setupConfigPath = "./out/electron/electron-builder-config.json";
    const electronBuilderPath = path.resolve(__dirname, "./node_modules/.bin/electron-builder.cmd");

    return helpers.rimrafToPromise("./out/electron")
        .then(() => helpers.runWebpack({
            projectPath: "./src/electron/webpack.config.ts",
            release: true,
            watch: false
        }))
        .then(() => helpers.streamToPromise(gulp.src("./out/app/**").pipe(gulp.dest("./out/electron"))))
        .then(() => helpers.streamToPromise(gulp.src("./package.json").pipe(gulp.dest("./out/electron"))))
        .then(() => helpers.rimrafToPromise("./out/installers"))
        .then(() => new Promise<void>((resolve, reject) => {
            const config = {
                productName: "SuperBasic",
                directories: {
                    app: "./out/electron",
                    output: "./out/installers"
                },
                win: {
                    target: [
                        { target: "nsis", arch: ["ia32"] }
                    ],
                    icon: "./src/electron/installer"
                }
            };
            fs.writeFile(setupConfigPath, JSON.stringify(config), "utf8", error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        }))
        .then(() => helpers.cmdToPromise(electronBuilderPath, ["build", "--config", setupConfigPath]));
});
