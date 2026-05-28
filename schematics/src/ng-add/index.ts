import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

const PACKAGE_NAME = '@cedricbelin/test-schematics-14';

export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const angularJsonPath = 'angular.json';

    if (!tree.exists(angularJsonPath)) {
      context.logger.warn(
        'Could not find angular.json. Please add the collection manually.',
      );
      return tree;
    }

    const angularJsonContent = tree.read(angularJsonPath);
    if (!angularJsonContent) {
      context.logger.warn('Could not read angular.json.');
      return tree;
    }

    const angularJson = JSON.parse(angularJsonContent.toString('utf-8'));

    // Ensure cli section exists
    if (!angularJson['cli']) {
      angularJson['cli'] = {};
    }

    // Ensure schematicCollections array exists
    if (!angularJson['cli']['schematicCollections']) {
      angularJson['cli']['schematicCollections'] = ['@schematics/angular'];
    }

    const collections: string[] = angularJson['cli']['schematicCollections'];

    if (collections.includes(PACKAGE_NAME)) {
      context.logger.info(
        `✅ "${PACKAGE_NAME}" is already registered in angular.json.`,
      );
      return tree;
    }

    // Add our package to the list
    collections.push(PACKAGE_NAME);
    angularJson['cli']['schematicCollections'] = collections;

    tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));

    context.logger.info(
      `✅ "${PACKAGE_NAME}" added to schematicCollections in angular.json.`,
    );
    context.logger.info(`👉 You can now run the two following commands: 
      - ng generate base-component <name>
      - ng generate management-base-component <name>
    `);

    return tree;
  };
}
