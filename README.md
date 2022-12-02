# ellipsis-angular

## Live demo

Sample demo [page](https://pikus.spb.ru/code) (under construction)

## What is this?

Angular 15+ directive to truncate multi-line text to the visible height. Unlike most ellipsis components this may be used
with HTML content also. The end of the visible text is appended with an ellipsis symbol `…`

## Instalation

```
npm install ellipsis-angular
```

Add module import to your Angular application:
```
import { EllipsisAngularModule } from 'ellipsis-angular';
...

@NgModule({
  imports: [
    BrowserModule,
    ...
    
    EllipsisAngularModule
  ],

```

Start using directive:

```
<div ellipsis-angular>
...
</div>

```

## Features

There are two options available for using ellipsis-angular.

### 1. Static content
You may use it with static content without any additional settings:

```
<div ellipsis-angular>
<!-- Static HTML content goes here ---> 
</div>

```
There will be ellipsis added if needed once component loads or a browser window resizes.
But it will not react to any inner content change.

### 2. Dynamic content
You may provide [innerHTML] parameter if you want ellipsis to react on inner HTML content
change:
```
<div ellipsis-angular [innerHTML]="someHTMLStringVariable"></div>

```
This way ellipsis will render someHTMLStringVariable html content and will also react on
its changes.

## Credits
This component is inspired by [dibari/angular-ellipsis](https://github.com/dibari/angular-ellipsis)
AngularJS directive made by Eric Di Bari (dibari). Please see this author on
[GitHub](https://github.com/dibari).
Some code samples are reused in this directive under MIT License.

