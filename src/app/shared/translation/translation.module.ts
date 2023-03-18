import { NgModule, ModuleWithProviders, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateCompiler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';


// AoT requires an exported function for factories
const HttpLoaderFactory = (http: HttpClient) => new TranslateHttpLoader(http, 'assets/i18n/', '.json');

const translateCompilerFactory = () => new TranslateMessageFormatCompiler();


const translateLoader: Provider = {
  provide: TranslateLoader,
  useFactory: HttpLoaderFactory,
  deps: [HttpClient]
};

const translateCompiler: Provider = {
  provide: TranslateCompiler,
  useFactory: translateCompilerFactory
};



@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class TranslationModule {
  static forRoot(): ModuleWithProviders<TranslationModule> {
    return TranslateModule.forRoot({
      loader: translateLoader,
      compiler: translateCompiler
    });
  }

  static forChild(): ModuleWithProviders<TranslationModule> {
    return TranslateModule.forChild({
      loader: translateLoader,
      compiler: translateCompiler,
      isolate: false
    });
  } 
}