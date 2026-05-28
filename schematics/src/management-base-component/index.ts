import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  strings,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { ManagementBaseComponentSchema } from './schema';

export function managementBaseComponent(options: ManagementBaseComponentSchema): Rule {
  return chain([
    _createComponent(options),
    _addToComponentStore(options),
  ]);
}

function _createComponent(options: ManagementBaseComponentSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(`Generating management base component: ${strings.classify(options.name)}Component`);

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...options,
        classify: strings.classify,
        dasherize: strings.dasherize,
      }),
      renameTemplateFiles(),
      move(`src/app/${options.path}/${strings.dasherize(options.name)}`),
    ]);

    return mergeWith(templateSource, MergeStrategy.Overwrite);
  };
}

function _addToComponentStore(options: ManagementBaseComponentSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(`Adding component: ${strings.classify(options.name)}Component to the component store`);

    const servicePath = 'src/app/components/component.service.ts';
    const buffer = tree.read(servicePath);
    if (!buffer) {
      throw new Error(`File not found: ${servicePath}`);
    }

    const content = buffer.toString('utf-8');
    const componentName = strings.dasherize(options.name);
    const newEntry = `'${componentName}': () => import('./${componentName}/${componentName}.component')`;

    const updated = content.replace(
      /componentStore\s*:\s*Record<string,\s*\(\)\s*=>\s*Promise<any>>\s*=\s*\{([\s\S]*?)\}/,
      (_: any, objectContent: any) => {
        const trimmed = objectContent.trim();
        if (!trimmed) {
          return `componentStore: Record<string, () => Promise<any>> = {\n    ${newEntry},\n}`;
        }
        return `componentStore: Record<string, () => Promise<any>> = {${objectContent.trimEnd()}\n    ${newEntry},\n}`;
      }
    );

    tree.overwrite(servicePath, updated);
    return tree;
  };
}
