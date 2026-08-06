import * as path from 'path';
import * as Serverless from 'serverless';
import { DefinitionGenerator } from '../DefinitionGenerator';

class ServerlessInterface extends Serverless {
  public service: any = {};
  public config: any = {};
  public yamlParser: any = {};
  public pluginManager: any = {};
  public variables: any = {};
}

describe('OpenAPI Documentation Generator', () => {
  it('Generates OpenAPI document', async () => {
    const servicePath = path.join(__dirname, '../../test/project');
    const serverlessYamlPath = path.join(servicePath, './serverless.yml');
    const sls: ServerlessInterface = new Serverless();

    sls.config.update({
      servicePath,
    });

    const config = await sls.yamlParser.parse(serverlessYamlPath);
    sls.pluginManager.cliOptions = { stage: 'dev' };

    await sls.service.load(config);
    await sls.variables.populateService();

    if ('documentation' in sls.service.custom) {
      const docGen = new DefinitionGenerator(sls.service.custom.documentation);

      expect(docGen).not.toBeNull();
    } else {
      throw new Error('Cannot find "documentation" in custom section of "serverless.yml"');
    }
  });

  describe('servers', () => {
    // `servers` was declared on IDefinition (the output) but never read off the
    // config, so it was silently dropped. A spec with no `servers` makes
    // consumers fall back to OpenAPI's default of a single server with url `/`,
    // which Swagger UI resolves against whichever host serves the spec rather
    // than the API — so the docs advertise the wrong base URL.
    it('passes a configured servers list through to the definition, in order', () => {
      const servers = [
        { url: 'https://api.example.com/v2', description: 'Production' },
        { url: 'https://dev-api.example.com/v2', description: 'Development' },
      ];

      const docGen = new DefinitionGenerator({
        title: 'Test',
        description: 'Test',
        models: [],
        servers,
      }).parse();

      expect(docGen.definition.servers).toEqual(servers);
    });

    it('does not mutate the caller\'s servers array', () => {
      const servers = [{ url: 'https://api.example.com/v2' }];
      const docGen = new DefinitionGenerator({
        title: 'Test',
        description: 'Test',
        models: [],
        servers,
      }).parse();

      (docGen.definition.servers as any[])[0].url = 'https://mutated.example.com';

      expect(servers[0].url).toBe('https://api.example.com/v2');
    });

    // Absent and empty are equivalent per OpenAPI 3.0, so neither should emit
    // the key — the resulting document stays clean either way.
    const emptyCases: Array<[string, any]> = [
      ['omitted', undefined],
      ['an empty array', []],
    ];

    emptyCases.forEach(([label, servers]) => {
      it(`leaves the servers key off the definition when ${label}`, () => {
        const docGen = new DefinitionGenerator({
          title: 'Test',
          description: 'Test',
          models: [],
          servers,
        }).parse();

        expect(docGen.definition).not.toHaveProperty('servers');
      });
    });

    it('reads servers from the test project serverless.yml', async () => {
      const servicePath = path.join(__dirname, '../../test/project');
      const sls: ServerlessInterface = new Serverless();

      sls.config.update({ servicePath });
      const config = await sls.yamlParser.parse(path.join(servicePath, './serverless.yml'));
      sls.pluginManager.cliOptions = { stage: 'dev' };
      await sls.service.load(config);
      await sls.variables.populateService();

      const docGen = new DefinitionGenerator(sls.service.custom.documentation).parse();

      expect(docGen.definition.servers).toEqual([
        { url: 'https://api.example.com/v2', description: 'Production' },
        { url: 'https://dev-api.example.com/v2', description: 'Development' },
      ]);
    });
  });
});
