import { Test, TestingModule } from '@nestjs/testing';

export class TestModuleBuilder {
  private providers: any[] = [];
  private imports: any[] = [];
  private controllers: any[] = [];

  addProvider(provider: any): this {
    this.providers.push(provider);
    return this;
  }

  addImport(module: any): this {
    this.imports.push(module);
    return this;
  }

  addController(controller: any): this {
    this.controllers.push(controller);
    return this;
  }

  async build(): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: this.imports,
      controllers: this.controllers,
      providers: this.providers,
    }).compile();
  }
}

export class TestModuleHelpers {
  static createTestingModule(config: {
    imports?: any[];
    controllers?: any[];
    providers?: any[];
  }): Promise<TestingModule> {
    return Test.createTestingModule(config).compile();
  }

  static createTestingModuleWithDatabase(config: {
    imports?: any[];
    controllers?: any[];
    providers?: any[];
  }): Promise<TestingModule> {
    return Test.createTestingModule({
      ...config,
      imports: [...(config.imports || [])],
    }).compile();
  }
}
