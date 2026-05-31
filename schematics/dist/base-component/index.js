"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseComponent = baseComponent;
const schematics_1 = require("@angular-devkit/schematics");
function baseComponent(options) {
    return (0, schematics_1.chain)([
        _createComponent(options),
        _addToComponentStore(options),
    ]);
}
function _createComponent(options) {
    return (tree, context) => {
        context.logger.info(`Generating base component: ${schematics_1.strings.classify(options.name)}Component`);
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.template)({
                ...schematics_1.strings,
                ...options,
                classify: schematics_1.strings.classify,
                dasherize: schematics_1.strings.dasherize,
            }),
            (0, schematics_1.renameTemplateFiles)(),
            (0, schematics_1.move)(`src/app/${options.path}/${schematics_1.strings.dasherize(options.name)}`),
        ]);
        return (0, schematics_1.mergeWith)(templateSource, schematics_1.MergeStrategy.Overwrite);
    };
}
function _addToComponentStore(options) {
    return (tree, context) => {
        context.logger.info(`Adding component: ${schematics_1.strings.classify(options.name)}Component to the component store`);
        const servicePath = 'src/app/components/component.service.ts';
        const buffer = tree.read(servicePath);
        if (!buffer) {
            throw new Error(`File not found: ${servicePath}`);
        }
        const content = buffer.toString('utf-8');
        const componentName = schematics_1.strings.dasherize(options.name);
        const newEntry = `'${componentName}': () => import('./${componentName}/${componentName}.component')`;
        const updated = content.replace(/componentStore\s*:\s*Record<string,\s*\(\)\s*=>\s*Promise<any>>\s*=\s*\{([\s\S]*?)\}/, (_, objectContent) => {
            const trimmed = objectContent.trim();
            if (!trimmed) {
                return `componentStore: Record<string, () => Promise<any>> = {\n    ${newEntry},\n}`;
            }
            return `componentStore: Record<string, () => Promise<any>> = {${objectContent.trimEnd()}\n    ${newEntry},\n}`;
        });
        tree.overwrite(servicePath, updated);
        return tree;
    };
}
//# sourceMappingURL=index.js.map