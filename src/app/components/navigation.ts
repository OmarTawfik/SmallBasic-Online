import { Run } from "./run";
import { Debug } from "./debug";
import { strings } from "../loc";
import { CodeEditor } from "./code-editor";

interface ISection {
    name: string;
    url: string;
    icon: string;
    component: React.ComponentClass;
}

export const defaultSection = "/editor";

export const sections: ISection[] = [
    {
        name: strings.app.codeEditorTitle,
        url: "/editor",
        icon: "icon-note",
        component: CodeEditor
    },
    {
        name: strings.app.runTitle,
        url: "/about",
        icon: "icon-control-play",
        component: Run
    },
    {
        name: strings.app.debugTitle,
        url: "/debug",
        icon: "icon-magnifier-add",
        component: Debug
    }
];
